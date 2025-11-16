# Cloudinary Image Upload Integration

## Overview
This project now supports direct file uploads via Cloudinary for profile avatars and article images. Users no longer need to provide CDN URLs manually.

## Environment Variables
The following Cloudinary credentials are configured in `.env`:
```
CLOUDINARY_CLOUD_NAME=dhdf0lkkt
CLOUDINARY_API_KEY=852683797569189
CLOUDINARY_API_SECRET=tu67HTZwD5HCHu-IcVNS2CgmORs
```

## Database Schema Changes
- **UserProfile**: Added `avatarUrl` field (String, optional)
- **Article**: Added `imageUrl` field (String, optional)

## API Endpoints

### 📸 Upload Profile Avatar
**POST** `/api/upload/avatar`
- **Auth:** Required (User must have a profile created first)
- **Rate Limited:** Yes
- **Content-Type:** `multipart/form-data`
- **Form Field:** `image` (the image file)
- **Accepted:** Image files only (JPEG, PNG, GIF, etc.)
- **Max Size:** 5MB
- **Response:**
  ```json
  {
    "success": true,
    "message": "Avatar uploaded successfully",
    "data": {
      "profile": {
        "id": "...",
        "userId": "...",
        "displayName": "...",
        "bio": "...",
        "avatarUrl": "https://res.cloudinary.com/dhdf0lkkt/image/upload/...",
        "interests": [...],
        "updatedAt": "..."
      },
      "uploadInfo": {
        "url": "https://res.cloudinary.com/...",
        "format": "jpg",
        "width": 1024,
        "height": 1024
      }
    }
  }
  ```

**Example (cURL):**
```bash
curl -X POST http://localhost:3000/api/upload/avatar \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "image=@/path/to/avatar.jpg"
```

### 🗑️ Delete Profile Avatar
**DELETE** `/api/upload/avatar`
- **Auth:** Required
- **Response:** Updated profile without avatar

---

### 📰 Upload Article Image (Admin Only)
**POST** `/api/upload/article/:articleId`
- **Auth:** Required + Admin
- **Rate Limited:** Yes
- **Content-Type:** `multipart/form-data`
- **Form Field:** `image` (the image file)
- **Params:** `articleId` (UUID)
- **Accepted:** Image files only
- **Max Size:** 5MB
- **Response:**
  ```json
  {
    "success": true,
    "message": "Article image uploaded successfully",
    "data": {
      "article": {
        "id": "...",
        "title": "...",
        "imageUrl": "https://res.cloudinary.com/dhdf0lkkt/image/upload/...",
        "category": {...},
        ...
      },
      "uploadInfo": {
        "url": "https://res.cloudinary.com/...",
        "format": "png",
        "width": 1920,
        "height": 1080
      }
    }
  }
  ```

**Example (cURL):**
```bash
curl -X POST http://localhost:3000/api/upload/article/ARTICLE_UUID \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -F "image=@/path/to/article-image.jpg"
```

### 🗑️ Delete Article Image (Admin Only)
**DELETE** `/api/upload/article/:articleId`
- **Auth:** Required + Admin
- **Params:** `articleId` (UUID)
- **Response:** Updated article without image

---

## Implementation Details

### File Upload Flow
1. User sends multipart form data with image file
2. Multer middleware validates file type and size
3. File is stored in memory buffer
4. Cloudinary utility uploads to cloud storage
5. Old image (if exists) is deleted from Cloudinary
6. Database is updated with new image URL
7. Response includes both updated record and upload metadata

### Cloudinary Folder Structure
- **Profile Avatars:** `wikiscrolls/avatars/avatar-{userId}`
- **Article Images:** `wikiscrolls/articles/article-{articleId}`

### Validation Rules
- **File Type:** Images only (checked via MIME type)
- **File Size:** Maximum 5MB
- **Format:** Auto-optimization enabled (quality: auto, format: auto)

### Error Handling
- Missing file: `400 Bad Request`
- Invalid file type: `400 Bad Request`
- File too large: `400 Bad Request`
- Profile not found: `404 Not Found`
- Article not found: `404 Not Found`
- Unauthorized: `401 Unauthorized`
- Not admin: `403 Forbidden`

## Frontend Integration

### Using Fetch API
```javascript
async function uploadAvatar(file) {
  const formData = new FormData();
  formData.append('image', file);

  const response = await fetch('http://localhost:3000/api/upload/avatar', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });

  return await response.json();
}
```

### Using Axios
```javascript
import axios from 'axios';

async function uploadAvatar(file) {
  const formData = new FormData();
  formData.append('image', file);

  const response = await axios.post(
    'http://localhost:3000/api/upload/avatar',
    formData,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    }
  );

  return response.data;
}
```

### React Example
```jsx
function AvatarUpload() {
  const [uploading, setUploading] = useState(false);
  
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const res = await fetch('/api/upload/avatar', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      
      const data = await res.json();
      console.log('Avatar uploaded:', data.data.profile.avatarUrl);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };
  
  return (
    <input
      type="file"
      accept="image/*"
      onChange={handleFileChange}
      disabled={uploading}
    />
  );
}
```

## Testing

### Test Avatar Upload
```bash
# 1. Create a user and login
# 2. Create a profile
# 3. Upload avatar
curl -X POST http://localhost:3000/api/upload/avatar \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "image=@test-avatar.jpg"
```

### Test Article Image Upload (Admin)
```bash
curl -X POST http://localhost:3000/api/upload/article/ARTICLE_UUID \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -F "image=@test-article.png"
```

## Notes
- Old images are automatically deleted from Cloudinary when new ones are uploaded
- Images are optimized automatically by Cloudinary (quality: auto, format: auto)
- Rate limiting is applied to prevent abuse
- Users can still manually set image URLs via the regular update endpoints if needed
- Avatar uploads require an existing profile (create profile first)
- Article image uploads require admin privileges
