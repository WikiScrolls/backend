# Frontend Examples

This folder contains **frontend/client-side** code examples that should be implemented in your React/Next.js frontend application, **NOT** in the backend.

## Files

### `audioPlayer.ts`
A complete audio player utility class for the browser. Features:
- Play/pause/stop controls
- Progress tracking
- Volume control
- Seek functionality
- Event callbacks

**Usage:** Copy this to your frontend repo (e.g., `src/utils/audioPlayer.ts`)

### `AudioPlayerComponent.tsx`
A full React component using the AudioPlayer class. Includes:
- UI controls
- Progress bar
- Volume slider
- Skip forward/backward
- CSS styles

**Usage:** Copy this to your frontend repo (e.g., `src/components/AudioPlayerComponent.tsx`)

## Backend API

The **backend** provides these endpoints:

```bash
# Upload audio (Admin only)
POST /api/upload/audio/:articleId
Content-Type: multipart/form-data
Field: audio (file)

# Delete audio (Admin only)
DELETE /api/upload/audio/:articleId

# Get article (includes audioUrl)
GET /api/articles/:id
```

## Frontend Integration

In your React app:

```jsx
import { AudioPlayerComponent } from './components/AudioPlayerComponent';

function ArticlePage({ article }) {
  return (
    <div>
      <h1>{article.title}</h1>
      
      {/* Simple HTML5 audio */}
      {article.audioUrl && (
        <audio src={article.audioUrl} controls />
      )}
      
      {/* OR use the custom player component */}
      {article.audioUrl && (
        <AudioPlayerComponent 
          audioUrl={article.audioUrl}
          title="Listen to Article"
        />
      )}
    </div>
  );
}
```

## Note

These are **browser-only** utilities. They use:
- `HTMLAudioElement` (browser API)
- `document.createElement` (browser API)
- React hooks (frontend library)

They **cannot** and **should not** run on the Node.js backend.
