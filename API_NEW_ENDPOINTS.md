# New API Endpoints Documentation

This document describes the newly added API endpoints for article/user searching and interaction features.

> **Note:** All endpoints require authentication via Bearer token in the `Authorization` header.

---

## 1. User Interactions

### Check Interaction Status for an Article

Returns whether the current user has liked and/or saved a specific article.

```
GET /api/interactions/check/:articleId
```

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `articleId` | UUID | The article ID to check |

**Response:**
```json
{
  "success": true,
  "message": "Interaction check completed",
  "data": {
    "liked": true,
    "saved": false
  }
}
```

---

### Get My Liked Articles

Returns a paginated list of articles the current user has liked.

```
GET /api/interactions/me/liked
```

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | 1 | Page number (min: 1) |
| `limit` | integer | 20 | Items per page (min: 1, max: 100) |

**Response:**
```json
{
  "success": true,
  "message": "Liked articles retrieved successfully",
  "data": {
    "articles": [
      {
        "id": "uuid",
        "title": "Article Title",
        "wikipediaUrl": "https://...",
        "imageUrl": "https://...",
        "aiSummary": "...",
        "audioUrl": "https://...",
        "tags": ["tag1", "tag2"],
        "publishedDate": "2025-01-01T00:00:00.000Z",
        "createdAt": "2025-01-01T00:00:00.000Z",
        "isActive": true,
        "isProcessed": true,
        "viewCount": 100,
        "likeCount": 50,
        "saveCount": 25,
        "categoryId": "uuid",
        "category": {
          "id": "uuid",
          "name": "Science",
          "color": "#FF5733"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "totalPages": 3
    }
  }
}
```

---

### Get My Saved Articles

Returns a paginated list of articles the current user has saved.

```
GET /api/interactions/me/saved
```

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | 1 | Page number (min: 1) |
| `limit` | integer | 20 | Items per page (min: 1, max: 100) |

**Response:**
```json
{
  "success": true,
  "message": "Saved articles retrieved successfully",
  "data": {
    "articles": [
      {
        "id": "uuid",
        "title": "Article Title",
        "wikipediaUrl": "https://...",
        "imageUrl": "https://...",
        "aiSummary": "...",
        "audioUrl": "https://...",
        "tags": ["tag1", "tag2"],
        "publishedDate": "2025-01-01T00:00:00.000Z",
        "createdAt": "2025-01-01T00:00:00.000Z",
        "isActive": true,
        "isProcessed": true,
        "viewCount": 100,
        "likeCount": 50,
        "saveCount": 25,
        "categoryId": "uuid",
        "category": {
          "id": "uuid",
          "name": "Science",
          "color": "#FF5733"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 12,
      "totalPages": 1
    }
  }
}
```

---

### Get Another User's Liked Articles (Public)

Returns a paginated list of articles a specific user has liked.

```
GET /api/interactions/users/:userId/liked
```

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `userId` | UUID | The user ID whose likes to view |

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | 1 | Page number (min: 1) |
| `limit` | integer | 20 | Items per page (min: 1, max: 100) |

**Response:**
```json
{
  "success": true,
  "message": "User liked articles retrieved successfully",
  "data": {
    "articles": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 30,
      "totalPages": 2
    }
  }
}
```

**Errors:**
- `404 Not Found` - User not found

---

## 2. User Profile & Stats

### Get My Stats

Returns statistics for the current authenticated user.

```
GET /api/profiles/me/stats
```

**Response:**
```json
{
  "success": true,
  "message": "Stats retrieved successfully",
  "data": {
    "userId": "uuid",
    "username": "johndoe",
    "joinDate": "2025-01-01T00:00:00.000Z",
    "totalLikes": 45,
    "totalSaves": 12,
    "totalViews": 230
  }
}
```

---

### Get Public Profile

Returns the public profile of any user (does not expose email or sensitive data).

```
GET /api/profiles/public/:userId
```

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `userId` | UUID | The user ID whose profile to view |

**Response:**
```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "id": "uuid",
    "displayName": "John Doe",
    "bio": "I love reading about science!",
    "avatarUrl": "https://...",
    "interests": ["science", "history", "technology"],
    "updatedAt": "2025-01-15T00:00:00.000Z",
    "user": {
      "id": "uuid",
      "username": "johndoe",
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  }
}
```

**Errors:**
- `404 Not Found` - Profile for user not found

---

## 3. Search

### Search Articles

Search articles by title, content (AI summary), or tags.

```
GET /api/articles/search?q=<query>
```

**Query Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `q` | string | ✅ | - | Search query (1-200 chars) |
| `page` | integer | ❌ | 1 | Page number (min: 1) |
| `limit` | integer | ❌ | 20 | Items per page (min: 1, max: 100) |
| `sortBy` | string | ❌ | "createdAt" | Sort field: `createdAt`, `title`, `publishedDate`, `viewCount`, `likeCount` |
| `sortOrder` | string | ❌ | "desc" | Sort order: `asc` or `desc` |

**Example:**
```
GET /api/articles/search?q=quantum+physics&page=1&limit=10&sortBy=likeCount&sortOrder=desc
```

**Response:**
```json
{
  "success": true,
  "message": "Articles search completed",
  "data": {
    "articles": [
      {
        "id": "uuid",
        "title": "Introduction to Quantum Physics",
        "wikipediaUrl": "https://...",
        "imageUrl": "https://...",
        "aiSummary": "Quantum physics is...",
        "audioUrl": "https://...",
        "tags": ["physics", "quantum", "science"],
        "publishedDate": "2025-01-01T00:00:00.000Z",
        "createdAt": "2025-01-01T00:00:00.000Z",
        "isActive": true,
        "isProcessed": true,
        "viewCount": 500,
        "likeCount": 120,
        "saveCount": 45,
        "categoryId": "uuid",
        "category": {
          "id": "uuid",
          "name": "Science",
          "color": "#FF5733"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 5,
      "totalPages": 1
    }
  }
}
```

**Search Behavior:**
- Case-insensitive matching
- Searches in: `title`, `aiSummary`, `tags`
- Only returns active articles (`isActive: true`)

---

### Search Users

Search users by username or display name.

```
GET /api/users/search?q=<query>
```

**Query Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `q` | string | ✅ | - | Search query (1-100 chars) |
| `page` | integer | ❌ | 1 | Page number (min: 1) |
| `limit` | integer | ❌ | 20 | Items per page (min: 1, max: 100) |

**Example:**
```
GET /api/users/search?q=john&page=1&limit=10
```

**Response:**
```json
{
  "success": true,
  "message": "Users search completed",
  "data": {
    "users": [
      {
        "id": "uuid",
        "username": "johndoe",
        "createdAt": "2025-01-01T00:00:00.000Z",
        "profile": {
          "displayName": "John Doe",
          "bio": "I love reading!",
          "avatarUrl": "https://..."
        }
      },
      {
        "id": "uuid",
        "username": "johnny123",
        "createdAt": "2025-02-01T00:00:00.000Z",
        "profile": null
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 2,
      "totalPages": 1
    }
  }
}
```

**Search Behavior:**
- Case-insensitive matching
- Searches in: `username`, `profile.displayName`
- Results sorted alphabetically by username
- Does not expose email addresses

---

## Error Responses

All endpoints follow the standard error response format:

```json
{
  "success": false,
  "message": "Error message here",
  "errors": [
    {
      "field": "fieldName",
      "message": "Validation error message"
    }
  ]
}
```

**Common HTTP Status Codes:**
| Code | Description |
|------|-------------|
| 200 | Success |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (missing/invalid token) |
| 404 | Not Found |
| 500 | Internal Server Error |

---

## TypeScript Types (for Frontend)

```typescript
// Interaction check response
interface InteractionCheck {
  liked: boolean;
  saved: boolean;
}

// User stats
interface UserStats {
  userId: string;
  username: string;
  joinDate: string; // ISO date
  totalLikes: number;
  totalSaves: number;
  totalViews: number;
}

// Public profile
interface PublicProfile {
  id: string;
  displayName: string | null;
  bio: string | null;
  avatarUrl: string | null;
  interests: string[];
  updatedAt: string; // ISO date
  user: {
    id: string;
    username: string;
    createdAt: string; // ISO date
  };
}

// Pagination
interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Paginated response wrapper
interface PaginatedResponse<T> {
  articles?: T[]; // for article endpoints
  users?: T[];    // for user endpoints
  pagination: Pagination;
}

// Article (full object returned in lists)
interface Article {
  id: string;
  title: string;
  wikipediaUrl: string;
  wikipediaId: string | null;  // Wikipedia Page ID
  imageUrl: string | null;
  content: string | null;      // Raw Wikipedia content
  aiSummary: string | null;    // AI-generated summary
  audioUrl: string | null;
  tags: string[];
  publishedDate: string; // ISO date
  createdAt: string;     // ISO date
  isActive: boolean;
  isProcessed: boolean;
  viewCount: number;
  likeCount: number;
  saveCount: number;
  categoryId: string | null;
  category: {
    id: string;
    name: string;
    color: string | null;
  } | null;
}

// User search result
interface UserSearchResult {
  id: string;
  username: string;
  createdAt: string; // ISO date
  profile: {
    displayName: string | null;
    bio: string | null;
    avatarUrl: string | null;
  } | null;
}
```

---

## 4. PageRank Integration (Frontend/Service)

These endpoints are used to sync Wikipedia articles with the backend database, typically when the frontend receives recommendations from the PageRank service.

> **Note:** These endpoints require authentication (any signed-in user).

### Upsert Single Article

Creates a new article or returns existing article if it already exists (matched by `wikipediaId` or `wikipediaUrl`).

```
POST /api/articles/upsert
```

**Request Body:**
```json
{
  "id": "12345",           // Wikipedia Page ID (maps to wikipediaId)
  "title": "Quantum Physics",
  "wikipediaUrl": "https://en.wikipedia.org/wiki/Quantum_physics",
  "content": "Quantum physics is the branch of physics...",
  "thumbnail": "https://upload.wikimedia.org/..."
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | ✅ | Wikipedia Page ID |
| `title` | string | ✅ | Article title |
| `wikipediaUrl` | string | ✅ | Full Wikipedia URL |
| `content` | string | ❌ | Wikipedia extract/intro text |
| `thumbnail` | string | ❌ | Wikipedia thumbnail image URL |

**Response (Created - 201):**
```json
{
  "success": true,
  "message": "Article created successfully",
  "data": {
    "article": {
      "id": "uuid",
      "wikipediaId": "12345",
      "title": "Quantum Physics",
      "wikipediaUrl": "https://...",
      "content": "...",
      "imageUrl": "https://...",
      "isProcessed": false,
      ...
    },
    "created": true
  }
}
```

**Response (Already Exists - 200):**
```json
{
  "success": true,
  "message": "Article already exists",
  "data": {
    "article": { ... },
    "created": false
  }
}
```

---

### Batch Upsert Articles

Bulk upsert multiple articles at once.

```
POST /api/articles/upsert-batch
```

**Request Body:**
```json
{
  "articles": [
    {
      "id": "12345",
      "title": "Quantum Physics",
      "wikipediaUrl": "https://en.wikipedia.org/wiki/Quantum_physics",
      "content": "...",
      "thumbnail": "https://..."
    },
    {
      "id": "67890",
      "title": "General Relativity",
      "wikipediaUrl": "https://en.wikipedia.org/wiki/General_relativity",
      "content": "...",
      "thumbnail": "https://..."
    }
  ]
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `articles` | array | ✅ | Array of 1-100 articles |

**Response:**
```json
{
  "success": true,
  "message": "Bulk upsert completed",
  "data": {
    "created": 1,
    "existing": 1,
    "articles": [
      { ... },
      { ... }
    ]
  }
}
```

---

### Get Article by Wikipedia ID

Retrieve an article by its Wikipedia Page ID.

```
GET /api/articles/wikipedia/:wikipediaId
```

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `wikipediaId` | string | Wikipedia Page ID |

**Response:**
```json
{
  "success": true,
  "message": "Article retrieved successfully",
  "data": {
    "id": "uuid",
    "wikipediaId": "12345",
    "title": "Quantum Physics",
    ...
  }
}
```

**Error (404):**
```json
{
  "success": true,
  "message": "Article not found",
  "data": null
}
```

---

### Get Article by Wikipedia URL

Retrieve an article by its Wikipedia URL.

```
GET /api/articles/wikipedia/url?url=<wikipedia_url>
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `url` | string | ✅ | Full Wikipedia URL (URL-encoded) |

**Example:**
```
GET /api/articles/wikipedia/url?url=https%3A%2F%2Fen.wikipedia.org%2Fwiki%2FQuantum_physics
```

**Response:**
```json
{
  "success": true,
  "message": "Article retrieved successfully",
  "data": {
    "id": "uuid",
    "wikipediaId": "12345",
    "title": "Quantum Physics",
    ...
  }
}
```

---

## Environment Variables

For Gorse integration, add these environment variables:

```env
# Gorse Recommendation Engine
GORSE_URL=http://localhost:8087
GORSE_API_KEY=your-api-key-here
```

When configured, user interactions (likes, saves, views) will be automatically synced to Gorse for personalized recommendations.
