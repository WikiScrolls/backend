# WikiScrolls PageRank Algorithm & Article Fetching Documentation

## Overview

This document explains how the WikiScrolls recommendation system works for the backend team. The key insight is that **articles are fetched directly from Wikipedia's API on-demand** and are NOT stored in a traditional database first. The system uses **Gorse** (an open-source recommendation engine) for personalization and tracking, combined with direct Wikipedia API calls.

---

## Architecture Summary

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Frontend      │────▶│   PageRank API  │────▶│   Wikipedia     │
│   (TikTok-style)│     │   (Go/Gin)      │     │   API           │
└─────────────────┘     └────────┬────────┘     └─────────────────┘
                                 │
                                 ▼
                        ┌─────────────────┐
                        │   Gorse         │
                        │   (Recommender) │
                        └─────────────────┘
```

---

## Core Concept: No Pre-Storage Required

### Why Articles Aren't Stored First

1. **Wikipedia has ~6.7 million+ articles** - storing all of them is impractical
2. **Real-time freshness** - articles are fetched live from Wikipedia
3. **On-demand discovery** - articles enter the recommendation system only when encountered
4. **Lightweight footprint** - minimal storage, maximum coverage

### The Flow

```
User Request → Check Gorse for Personalized Recommendations
                    │
                    ├─── Has Recommendations? ──▶ Fetch by IDs from Wikipedia API
                    │
                    └─── No Recommendations? ──▶ Fetch Random from Wikipedia API
                                                        │
                                                        ▼
                                              Insert into Gorse (lazy)
```

---

## How Article Fetching Works

### 1. Wikipedia Client (`app/client/wikipedia_client.go`)

The Wikipedia client makes direct HTTP calls to the Wikipedia API. **No database involved.**

#### Three Fetching Methods:

| Method | Use Case | API Parameter |
|--------|----------|---------------|
| `GetRandomArticles(count)` | Cold start / fallback | `generator=random` |
| `FetchByIDs(ids)` | Personalized recommendations | `pageids=123\|456\|789` |
| `FetchByTitles(titles)` | Graph-based recommendations | `titles=Cat\|Dog\|Bird` |

#### API Parameters Used:

```go
params := url.Values{
    "action":       {"query"},
    "format":       {"json"},
    "prop":         {"extracts|info|pageimages"},  // Content + metadata + images
    "exintro":      {"1"},                          // Only intro paragraph
    "exsentences":  {"10"},                         // Limit to 10 sentences
    "explaintext":  {"1"},                          // Plain text (no HTML)
    "piprop":       {"thumbnail"},                  // Get thumbnail
    "pithumbsize":  {"800"},                        // Thumbnail size
}
```

### 2. Article Model (`app/model/article_model.go`)

Articles are simple, lightweight objects:

```go
type Article struct {
    Id           string  // Wikipedia Page ID (e.g., "12345")
    Title        string  // Article title
    WikipediaUrl string  // Full URL to Wikipedia page
    Content      string  // Intro extract (10 sentences max)
    Thumbnail    string  // Image URL
}
```

**Key Point:** This model is returned directly to the frontend. There's no separate "database model" vs "API model" - it's the same thing.

---

## The Recommendation Algorithm

### Gorse Recommendation Engine

[Gorse](https://gorse.io/) is an open-source recommendation system that provides:

- **Collaborative Filtering** - "Users who liked X also liked Y"
- **Content-Based Filtering** - Using labels/categories
- **Real-time updates** - Learns from user feedback

### How Personalization Works

#### Step 1: Get Recommendations from Gorse

```go
gorseIds, err := s.gorse.GetRecommend(ctx, userId, "article", chainLength, 0)
```

This returns a list of Wikipedia Page IDs that Gorse thinks the user will like.

#### Step 2: Fetch Full Article Data from Wikipedia

```go
resp, err := s.wiki.FetchByIDs(ctx, gorseIds)
```

The IDs from Gorse are used to fetch actual article content from Wikipedia's API.

#### Step 3: Fallback to Random

If Gorse has no recommendations (new user, cold start), fall back to random articles:

```go
if err != nil || len(gorseIds) == 0 {
    return s.GetRandomArticles(ctx, chainLength)
}
```

### The Complete Flow (`app/service/recommendation_service.go`)

```go
func (s *RecommendationService) GetRecommendations(ctx context.Context, chainLength int, userId string) ([]model.Article, error) {
    // 1. Ask Gorse for personalized article IDs
    gorseIds, err := s.gorse.GetRecommend(ctx, userId, "article", chainLength, 0)

    if err == nil && len(gorseIds) > 0 {
        // 2. Fetch articles from Wikipedia by ID
        resp, err := s.wiki.FetchByIDs(ctx, gorseIds)
        if err == nil {
            articles := wikipediaResponseToArticles(resp)

            // 3. Fill remaining slots with random if needed
            if len(articles) < chainLength {
                fill, _ := s.GetRandomArticles(ctx, chainLength-len(articles))
                articles = append(articles, fill...)
            }
            return articles, nil
        }
    }

    // 4. Complete fallback: return random articles
    return s.GetRandomArticles(ctx, chainLength)
}
```

---

## Lazy Loading into Gorse

### When Articles Enter the System

Articles are inserted into Gorse **only when they're shown to users** (specifically during random article fetches):

```go
func (s *RecommendationService) GetRandomArticles(ctx context.Context, articleCount int) ([]model.Article, error) {
    // Fetch from Wikipedia
    wikiResponse, err := s.wiki.GetRandomArticles(ctx, articleCount)
    
    articles := wikipediaResponseToArticles(wikiResponse)

    // Insert into Gorse for future recommendations
    for _, article := range articles {
        s.gorse.InsertItem(ctx, g.Item{
            ItemId:     article.Id,           // Wikipedia Page ID
            IsHidden:   false,
            Labels:     []string{"wikipedia", "article"},
            Categories: []string{"article"},
            Comment:    article.Title,        // Human-readable reference
            Timestamp:  time.Now(),
        })
    }

    return articles, err
}
```

### What Gets Stored in Gorse

| Field | Value | Purpose |
|-------|-------|---------|
| `ItemId` | Wikipedia Page ID | Unique identifier |
| `Labels` | `["wikipedia", "article"]` | For filtering |
| `Categories` | `["article"]` | For category-based recommendations |
| `Comment` | Article title | Human-readable reference |

**Important:** Gorse only stores the **metadata** (ID, labels), not the full article content. Content is always fetched fresh from Wikipedia.

---

## User Feedback Loop

### How the Algorithm Learns

The system tracks two types of user interactions:

#### 1. Like an Article
```go
s.gorse.InsertFeedback(ctx, []g.Feedback{{
    FeedbackType: "like",
    UserId:       userId,
    ItemId:       itemId,  // Wikipedia Page ID
    Value:        1.0,
    Timestamp:    time.Now(),
}})
```

#### 2. Open an Article (View)
```go
s.gorse.InsertFeedback(ctx, []g.Feedback{{
    FeedbackType: "open_article",
    UserId:       userId,
    ItemId:       itemId,
    Value:        1.0,
    Timestamp:    time.Now(),
}})
```

These feedback signals help Gorse learn:
- Which articles users prefer
- Patterns across users (collaborative filtering)
- User-specific preferences

---

## User Registration

### Cold Start Handling

When a user registers, they can provide initial interests:

```go
s.gorse.InsertUser(ctx, g.User{
    UserId: userId,
    Labels: interests,  // e.g., ["science", "history", "technology"]
})
```

This helps Gorse make better initial recommendations before it has behavioral data.

---

## API Endpoints Summary

| Endpoint | Method | Description |
|----------|--------|-------------|
| `GET /api/recommendation/:userId` | GET | Get 10 personalized articles |
| `GET /api/recommendation/random` | GET | Get 10 random articles |
| `POST /api/articles/:id/like?userId=xxx` | POST | Like an article |
| `POST /api/articles/:id/open?userId=xxx` | POST | Mark article as opened/viewed |
| `POST /api/user/` | POST | Register user with interests |

---

## Neo4j Graph (Legacy/Optional)

The codebase contains a Neo4j repository that's not currently used in the main flow:

```go
// This was for graph-based traversal recommendations
MATCH (n)
WITH n, rand() AS r
ORDER BY r
LIMIT 1
MATCH p = (n)-[*1..chainLength]-(m)  // Follow links
RETURN [x IN nodes(p) | x.title] AS pathTitles
```

This would traverse Wikipedia's link graph to find related articles. The current implementation uses Gorse instead, which is simpler and doesn't require pre-loading the Wikipedia link graph.

---

## Key Takeaways for Backend Team

### 1. **No Article Database Required**
- Articles are fetched on-demand from Wikipedia's API
- Only metadata (IDs, labels) stored in Gorse
- Content is always fresh from Wikipedia

### 2. **Gorse is the Brain**
- Handles all recommendation logic
- Stores user preferences and feedback
- Provides personalized article IDs

### 3. **Wikipedia API is the Source**
- Direct HTTP calls to `en.wikipedia.org/w/api.php`
- Random article generation built-in
- Fetch by ID or title

### 4. **Lazy Population**
- Articles enter Gorse only when shown to users
- System grows organically with usage
- No need to pre-seed millions of articles

### 5. **Simple Article Model**
- Just 5 fields: id, title, url, content, thumbnail
- Same model for API responses
- No ORM or database mapping needed

---

## Environment Variables Required

```env
GORSE_URL=http://localhost:8087    # Gorse server URL
GORSE_KEY=your-api-key             # Gorse API key
AppPort=8080                       # This service's port
# Neo4j vars exist but are optional/legacy
```

---

## Sequence Diagram: Full User Flow

```
User                    PageRank API              Gorse              Wikipedia API
  │                          │                      │                      │
  │──GET /recommendation/123─▶│                      │                      │
  │                          │──GetRecommend(123)──▶│                      │
  │                          │◀──[id1,id2,id3]──────│                      │
  │                          │                      │                      │
  │                          │──FetchByIDs([...])───────────────────────▶│
  │                          │◀──{pages: [...]}────────────────────────────│
  │                          │                      │                      │
  │◀─────[articles]──────────│                      │                      │
  │                          │                      │                      │
  │───POST /articles/id1/like?userId=123──────────▶│                      │
  │                          │──InsertFeedback()──▶│                      │
  │◀─────{success}───────────│                      │                      │
```

---

## Questions?

Contact the PageRank team for clarification on:
- Gorse configuration and tuning
- Wikipedia API rate limits
- Adding new feedback types
- Custom recommendation strategies
