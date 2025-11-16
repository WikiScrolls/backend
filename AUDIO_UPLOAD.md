# Audio Upload & Playback Integration

## 🎵 Overview
WikiScrolls now supports **direct audio file uploads** via Cloudinary, eliminating the need for manual URL entry. Audio files are automatically converted to MP3 for optimal compatibility and streaming.

## 📋 Features
✅ Direct audio file uploads to Cloudinary  
✅ Automatic transcoding to MP3 format  
✅ Support for multiple audio formats (MP3, WAV, OGG, FLAC, AAC, M4A)  
✅ File size limit: 20MB  
✅ Automatic deletion of old audio when uploading new files  
✅ Admin-only access for article audio uploads  
✅ Built-in audio player utilities for frontend  

---

## 🚀 API Endpoints

### Upload Article Audio (Admin Only)
**POST** `/api/upload/audio/:articleId`

**Authentication:** Required + Admin  
**Content-Type:** `multipart/form-data`  
**Rate Limited:** Yes  

**Request:**
- **Params:** `articleId` (UUID)
- **Form Field:** `audio` (the audio file)
- **Accepted Formats:** MP3, WAV, OGG, FLAC, AAC, M4A
- **Max Size:** 20MB

**Response:**
```json
{
  "success": true,
  "message": "Article audio uploaded successfully",
  "data": {
    "article": {
      "id": "...",
      "title": "...",
      "audioUrl": "https://res.cloudinary.com/dhdf0lkkt/video/upload/...",
      "category": {...}
    },
    "uploadInfo": {
      "url": "https://res.cloudinary.com/...",
      "format": "mp3",
      "duration": 180.5,
      "bytes": 2896234
    }
  }
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/upload/audio/ARTICLE_UUID \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -F "audio=@article-narration.mp3"
```

---

### Delete Article Audio (Admin Only)
**DELETE** `/api/upload/audio/:articleId`

**Authentication:** Required + Admin  
**Params:** `articleId` (UUID)

**Response:**
```json
{
  "success": true,
  "message": "Article audio deleted successfully",
  "data": {
    "article": {
      "id": "...",
      "audioUrl": null,
      ...
    }
  }
}
```

**cURL Example:**
```bash
curl -X DELETE http://localhost:3000/api/upload/audio/ARTICLE_UUID \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

---

## 💻 Frontend Integration

### JavaScript/Fetch Example
```javascript
async function uploadArticleAudio(articleId, audioFile) {
  const formData = new FormData();
  formData.append('audio', audioFile);

  const response = await fetch(`/api/upload/audio/${articleId}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${adminToken}`
    },
    body: formData
  });

  const data = await response.json();
  console.log('Audio uploaded:', data.data.uploadInfo);
  return data;
}

// Usage
const fileInput = document.querySelector('#audio-file');
await uploadArticleAudio('article-uuid', fileInput.files[0]);
```

---

### React Component Example
```jsx
import { useState } from 'react';

function AudioUploader({ articleId, adminToken }) {
  const [uploading, setUploading] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('audio', file);

      const res = await fetch(`/api/upload/audio/${articleId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${adminToken}` },
        body: formData
      });

      const data = await res.json();
      setAudioUrl(data.data.article.audioUrl);
      alert('Audio uploaded successfully!');
    } catch (error) {
      alert('Upload failed: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input
        type="file"
        accept="audio/*"
        onChange={handleUpload}
        disabled={uploading}
      />
      {uploading && <p>Uploading...</p>}
      {audioUrl && <audio src={audioUrl} controls />}
    </div>
  );
}
```

---

## 🎧 Audio Player Utility

We've included a robust `AudioPlayer` class for frontend audio playback:

### Basic Usage
```javascript
import { AudioPlayer, formatTime } from './utils/audioPlayer';

const player = new AudioPlayer();

// Load audio
player.load('https://res.cloudinary.com/.../audio.mp3');

// Play
await player.play();

// Pause
player.pause();

// Seek to 30 seconds
player.seek(30);

// Set volume (0.0 to 1.0)
player.setVolume(0.8);

// Get current time and duration
const current = player.getCurrentTime();
const total = player.getDuration();
console.log(`${formatTime(current)} / ${formatTime(total)}`);

// Register callbacks
player.onProgress((progress) => {
  console.log(`Progress: ${progress}%`);
});

player.onEnded(() => {
  console.log('Playback finished');
});

// Clean up
player.destroy();
```

### Full React Component
See `src/utils/AudioPlayerComponent.example.tsx` for a complete React audio player with:
- Play/pause controls
- Progress bar with seeking
- Volume control
- Skip forward/backward (10s)
- Time display
- Auto-play support

---

## 🎨 Supported Audio Formats

| Format | MIME Type | Supported |
|--------|-----------|-----------|
| MP3 | `audio/mpeg`, `audio/mp3` | ✅ |
| WAV | `audio/wav`, `audio/wave`, `audio/x-wav` | ✅ |
| OGG | `audio/ogg` | ✅ |
| WebM | `audio/webm` | ✅ |
| FLAC | `audio/flac` | ✅ |
| AAC | `audio/aac` | ✅ |
| M4A | `audio/m4a`, `audio/x-m4a` | ✅ |

**Note:** All formats are automatically converted to MP3 by Cloudinary for maximum compatibility.

---

## 📁 Cloudinary Storage Structure

```
wikiscrolls/
├── avatars/
│   └── avatar-{userId}.jpg
├── articles/
│   └── article-{articleId}.png
└── audio/
    └── audio-{articleId}.mp3
```

---

## 🔒 Security & Validation

**File Validation:**
- ✅ Audio MIME type checking
- ✅ File size limit (20MB max)
- ✅ Admin-only access
- ✅ Rate limiting enabled

**Error Handling:**
- Missing file: `400 Bad Request`
- Invalid file type: `400 Bad Request`
- File too large: `400 Bad Request`
- Article not found: `404 Not Found`
- Unauthorized: `401 Unauthorized`
- Not admin: `403 Forbidden`

---

## 🧪 Testing

### Test Upload
```bash
# 1. Login as admin
# 2. Get an article ID
# 3. Upload audio
curl -X POST http://localhost:3000/api/upload/audio/ARTICLE_UUID \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -F "audio=@narration.mp3"
```

### Test Playback (HTML)
```html
<!DOCTYPE html>
<html>
<head>
  <title>Audio Test</title>
</head>
<body>
  <h1>Audio Player Test</h1>
  <audio controls src="YOUR_CLOUDINARY_AUDIO_URL"></audio>
</body>
</html>
```

---

## 💡 Advanced Features

### Get Audio Metadata
```javascript
const player = new AudioPlayer();
player.load(audioUrl);

player.onProgress(() => {
  const duration = player.getDuration();
  const current = player.getCurrentTime();
  const remaining = duration - current;
  
  console.log({
    current: formatTime(current),
    duration: formatTime(duration),
    remaining: formatTime(remaining),
    progress: player.getProgress()
  });
});
```

### Preload Audio
```javascript
import { preloadAudio } from './utils/audioPlayer';

// Preload for faster playback
const audioElement = preloadAudio(audioUrl);

// Later...
const player = new AudioPlayer();
player.load(audioUrl); // Will use cached version
await player.play();
```

### Check Browser Support
```javascript
import { canPlayAudioType } from './utils/audioPlayer';

if (canPlayAudioType('audio/mpeg')) {
  console.log('MP3 is supported');
}

if (canPlayAudioType('audio/ogg')) {
  console.log('OGG is supported');
}
```

---

## 📊 Cloudinary Dashboard

Monitor your audio uploads in Cloudinary:
- **Dashboard:** https://cloudinary.com/console
- **Media Library:** View all uploaded audio files
- **Usage:** Track bandwidth and storage
- **Transformations:** See auto-conversions to MP3

---

## ⚙️ Configuration

Audio upload settings in `src/middleware/upload.ts`:
```typescript
const audioFileFilter = (req, file, cb) => {
  // Allowed MIME types
  const allowedMimeTypes = [
    'audio/mpeg', 'audio/mp3', 'audio/wav',
    'audio/ogg', 'audio/webm', 'audio/flac',
    'audio/aac', 'audio/m4a'
  ];
  
  // 20MB max size
  const maxSize = 20 * 1024 * 1024;
};
```

---

## 🎯 Use Cases

1. **Article Narration** - Upload AI-generated or human-narrated article audio
2. **Podcast Episodes** - Store podcast content for articles
3. **Audio Summaries** - Quick audio versions of text content
4. **Background Music** - Atmospheric audio for reading
5. **Language Learning** - Multiple language audio tracks

---

## 🚦 Next Steps

- ✅ Upload audio files via API
- ✅ Play audio using the AudioPlayer utility
- ⏳ Implement audio waveform visualization (optional)
- ⏳ Add playback speed control (optional)
- ⏳ Support for multiple audio tracks per article (optional)
- ⏳ Implement audio transcription (optional)

---

## 📚 Additional Resources

- [Cloudinary Audio Documentation](https://cloudinary.com/documentation/audio_transformations)
- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [HTML Audio Element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/audio)
