# Google AI Integration Guide

## Setup Instructions

### 1. Get Google AI API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add it to your `.env` file:
   ```
   GOOGLE_API_KEY=your-api-key-here
   ```

### 2. Set up Google Cloud TTS (for audio generation)

#### Option A: Using Service Account (Recommended for production)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Cloud Text-to-Speech API
4. Create a service account:
   - Go to IAM & Admin > Service Accounts
   - Click "Create Service Account"
   - Give it a name and grant "Cloud Text-to-Speech User" role
   - Create and download JSON key
5. Add to `.env`:
   ```
   GOOGLE_CLOUD_PROJECT_ID=your-project-id
   GOOGLE_APPLICATION_CREDENTIALS=./path/to/service-account-key.json
   ```

#### Option B: Using API Key (Simpler for development)

1. In Google Cloud Console, go to APIs & Services > Credentials
2. Create an API Key
3. Restrict it to Cloud Text-to-Speech API
4. Use the same GOOGLE_API_KEY for both services

### 3. Create temp directory for audio processing

```bash
mkdir temp
```

Add to `.gitignore`:
```
temp/
*.mp3
```

## API Endpoints

### Process Wikipedia Article
**POST** `/api/ai/process-article`

Generates AI summary, tags, and audio for a Wikipedia article.

**Request:**
```json
{
  "content": "Full Wikipedia article text...",
  "title": "Article Title",
  "wikipediaUrl": "https://en.wikipedia.org/wiki/Article",
  "categoryId": "uuid",
  "publishedDate": "2024-01-01T00:00:00Z",
  "imageUrl": "https://cloudinary.com/image.jpg" // optional
}
```

**Response:**
```json
{
  "success": true,
  "message": "Article processed successfully",
  "data": {
    "article": {
      "id": "uuid",
      "title": "Article Title",
      "aiSummary": "Generated summary...",
      "tags": ["tag1", "tag2", "tag3"],
      "audioUrl": null, // Will be generated async
      "isProcessed": false
      // ... other fields
    }
  }
}
```

**Note:** Audio generation happens asynchronously. The `audioUrl` will be `null` initially and `isProcessed` will be `false`. Check back later or listen for updates.

### Regenerate Summary
**POST** `/api/ai/regenerate-summary/:articleId`

**Request:**
```json
{
  "content": "New content to summarize..."
}
```

### Regenerate Audio
**POST** `/api/ai/regenerate-audio/:articleId`

No body required. Generates new audio from existing summary.

## Service Usage

### AI Service (Gemini)

```typescript
import { aiService } from './services/ai.service';

// Generate summary
const summary = await aiService.summarizeArticle(content, 200);

// Generate tags
const tags = await aiService.generateTags(content, 5);

// Moderate content
const isSafe = await aiService.moderateContent(content);
```

### TTS Service

```typescript
import { ttsService } from './services/tts.service';

// Generate audio from text
const audioUrl = await ttsService.textToSpeech(text, articleId, {
  languageCode: 'en-US',
  gender: 'NEUTRAL',
  speakingRate: 1.0,
  pitch: 0
});

// Generate audio from article summary
const audioUrl = await ttsService.generateAudioSummary(summary, articleId);

// Get available voices
const voices = await ttsService.getAvailableVoices('en-US');

// Delete audio
await ttsService.deleteAudio(audioUrl);
```

## Cost Optimization

### Text Summarization (Gemini 1.5 Flash)
- **Input:** $0.075 per 1M tokens
- **Output:** $0.30 per 1M tokens
- Average Wikipedia article (~3000 tokens) = **~$0.0003 per summary**

### Audio Generation (Google Cloud TTS)
- **Standard voices:** $4.00 per 1M characters
- **Neural2 voices:** $16.00 per 1M characters
- Average summary (~200 words = 1000 characters) = **$0.004 - $0.016 per audio**

**Total cost per article:** ~$0.005 - $0.017

## Error Handling

All services include comprehensive error handling and logging. Errors are logged to Winston and returned as appropriate HTTP responses.

## Testing

```bash
# Test AI summary generation
curl -X POST http://localhost:3000/api/ai/process-article \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "content": "Your Wikipedia article content...",
    "title": "Test Article",
    "wikipediaUrl": "https://en.wikipedia.org/wiki/Test",
    "categoryId": "your-category-uuid",
    "publishedDate": "2024-01-01T00:00:00Z"
  }'
```

## Next Steps

1. Add to `.env` file with your credentials
2. Test the API endpoints
3. Implement Wikipedia scraping to get article content
4. Set up webhooks or polling to check when audio processing is complete
5. Consider implementing a job queue (Bull, BullMQ) for large-scale processing
