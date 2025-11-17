# Audio Upload API Documentation

This backend provides endpoints for uploading and managing audio files for articles using Cloudinary.

## Endpoints

### Upload Audio for Article
**POST** `/api/upload/audio/:articleId`

Upload an audio file (MP3, WAV, OGG) for a specific article.

**Authentication:** Required (Admin only)

**Parameters:**
- `articleId` (URL param) - UUID of the article

**Request:**
- Content-Type: `multipart/form-data`
- Field name: `audio`
- Max file size: 10MB
- Accepted formats: MP3, WAV, OGG

**Example:**
```bash
curl -X POST http://localhost:3000/api/upload/audio/{articleId} \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -F "audio=@path/to/audio.mp3"
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Article audio uploaded successfully",
  "data": {
    "article": {
      "id": "uuid",
      "title": "Article Title",
      "audioUrl": "https://res.cloudinary.com/...",
      ...
    },
    "uploadInfo": {
      "url": "https://res.cloudinary.com/...",
      "format": "mp3",
      "duration": 123.45
    }
  }
}
```

### Delete Audio from Article
**DELETE** `/api/upload/audio/:articleId`

Delete the audio file from a specific article.

**Authentication:** Required (Admin only)

**Parameters:**
- `articleId` (URL param) - UUID of the article

**Example:**
```bash
curl -X DELETE http://localhost:3000/api/upload/audio/{articleId} \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Article audio deleted successfully",
  "data": {
    "id": "uuid",
    "title": "Article Title",
    "audioUrl": null,
    ...
  }
}
```

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Only audio files (MP3, WAV, OGG) are allowed",
  "errors": []
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Article not found",
  "errors": []
}
```

### 413 Payload Too Large
```json
{
  "success": false,
  "message": "Audio file size cannot exceed 10MB",
  "errors": []
}
```

## Notes

- Audio files are stored in Cloudinary under `wikiscrolls/audio/` folder
- Each article can have only one audio file
- Uploading a new audio file will automatically delete the old one
- Audio files are stored in MP3 format in Cloudinary
- The `audioUrl` field in the article will be updated automatically

## Implementation Details

The audio upload system:
1. Accepts audio files via multipart/form-data
2. Validates file type and size
3. Uploads to Cloudinary (stored as video resource type)
4. Updates article record with the new audio URL
5. Deletes old audio file if it exists
6. Returns the article with upload information
