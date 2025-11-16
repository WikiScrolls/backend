# Frontend Integration Fixes

**Last Updated:** November 12, 2025  
**Production API URL:** `https://backend-production-cc13.up.railway.app`

---

## ✅ Validation Result

**All endpoints documented in the Frontend API Guide are CORRECT!**

No endpoint path changes needed. The guide is 100% accurate.

---

## 🔧 Common Issues & Required Fixes

### 1. Base URL Configuration

**Change from:**
```javascript
const API_BASE_URL = 'http://localhost:3000';
```

**Change to:**
```javascript
const API_BASE_URL = 'https://backend-production-cc13.up.railway.app';
```

---

### 2. HTTP Method Mistakes

#### ❌ Common Errors:

```javascript
// WRONG - These MUST be POST
GET /api/auth/signup
GET /api/auth/login

// WRONG - These MUST be GET
POST /api/articles
POST /api/auth/profile
POST /api/profiles/me
```

#### ✅ Correct Methods:

| Endpoint | Method | Auth Required |
|----------|--------|---------------|
| `/api/auth/signup` | `POST` | ❌ No |
| `/api/auth/login` | `POST` | ❌ No |
| `/api/auth/profile` | `GET` | ✅ Yes |
| `/api/articles` | `GET` | ✅ Yes |
| `/api/articles/:id` | `GET` | ✅ Yes |
| `/api/articles/:id/view` | `POST` | ✅ Yes |
| `/api/interactions` | `POST` | ✅ Yes |
| `/api/interactions` | `DELETE` | ✅ Yes |
| `/api/interactions/me` | `GET` | ✅ Yes |
| `/api/interactions/check/:articleId` | `GET` | ✅ Yes |
| `/api/profiles/me` | `GET` | ✅ Yes |
| `/api/profiles/me` | `POST` | ✅ Yes |
| `/api/profiles/me` | `PUT` | ✅ Yes |
| `/api/profiles/me` | `DELETE` | ✅ Yes |
| `/api/feeds/me` | `GET` | ✅ Yes |
| `/api/feeds/me` | `POST` | ✅ Yes |
| `/api/feeds/me` | `PUT` | ✅ Yes |
| `/api/feeds/me/position` | `PUT` | ✅ Yes |
| `/api/feeds/me/regenerate` | `POST` | ✅ Yes |
| `/api/feeds/me` | `DELETE` | ✅ Yes |
| `/health` | `GET` | ❌ No |

---

### 3. Required Headers

#### For POST/PUT Requests:
```javascript
headers: {
  'Content-Type': 'application/json',
  'Authorization': 'Bearer <your-token-here>'  // if protected
}
```

#### For GET Requests (Protected):
```javascript
headers: {
  'Authorization': 'Bearer <your-token-here>'
}
```

---

### 4. Protected vs Public Routes

#### Public Routes (No Auth Required):
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /health`

#### Protected Routes (Auth Token Required):
**All other endpoints require `Authorization: Bearer <token>` header**

Including:
- All `/api/auth/profile` routes
- All `/api/articles` routes
- All `/api/profiles` routes
- All `/api/interactions` routes
- All `/api/feeds` routes

---

### 5. Response Format

All API responses follow this structure:

#### Success Response:
```json
{
  "success": true,
  "message": "Description of result",
  "data": {
    // Response data
  }
}
```

#### Error Response:
```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "fieldName",
      "message": "Error message"
    }
  ]
}
```

**Important:** Always check `response.success` before using data!

---

### 6. HTTP Status Codes & Handling

| Code | Meaning | Action Required |
|------|---------|----------------|
| `200` | Success | Use the data |
| `201` | Created | Resource created successfully |
| `204` | No Content | Success (DELETE operations) |
| `400` | Bad Request | Check validation errors in `response.errors` |
| `401` | Unauthorized | Token invalid/expired → **Redirect to login** |
| `403` | Forbidden | Insufficient permissions |
| `404` | Not Found | Wrong URL or resource doesn't exist |
| `409` | Conflict | Duplicate (email exists, already liked, etc.) |
| `429` | Too Many Requests | Rate limited → retry after delay |
| `500` | Server Error | Backend issue → show error message |

---

## 📝 Working Test Examples

### PowerShell (Windows):

```powershell
# 1. Signup
curl.exe -X POST "https://backend-production-cc13.up.railway.app/api/auth/signup" -H "Content-Type: application/json" -d '{\"username\":\"testuser\",\"email\":\"test@example.com\",\"password\":\"Test123!@#\"}'

# 2. Login
curl.exe -X POST "https://backend-production-cc13.up.railway.app/api/auth/login" -H "Content-Type: application/json" -d '{\"email\":\"demo@wikiscrolls.com\",\"password\":\"Demo123!@#\"}'

# 3. Get Profile (replace YOUR_TOKEN)
curl.exe "https://backend-production-cc13.up.railway.app/api/auth/profile" -H "Authorization: Bearer YOUR_TOKEN"

# 4. List Articles (replace YOUR_TOKEN)
curl.exe "https://backend-production-cc13.up.railway.app/api/articles?page=1&limit=10" -H "Authorization: Bearer YOUR_TOKEN"

# 5. Get My Profile (replace YOUR_TOKEN)
curl.exe "https://backend-production-cc13.up.railway.app/api/profiles/me" -H "Authorization: Bearer YOUR_TOKEN"

# 6. Like Article (replace YOUR_TOKEN and ARTICLE_ID)
curl.exe -X POST "https://backend-production-cc13.up.railway.app/api/interactions" -H "Authorization: Bearer YOUR_TOKEN" -H "Content-Type: application/json" -d '{\"articleId\":\"ARTICLE_ID\",\"interactionType\":\"LIKE\"}'

# 7. Get My Feed (replace YOUR_TOKEN)
curl.exe "https://backend-production-cc13.up.railway.app/api/feeds/me" -H "Authorization: Bearer YOUR_TOKEN"
```

### Bash/Linux:

```bash
# 1. Signup
curl -X POST "https://backend-production-cc13.up.railway.app/api/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"Test123!@#"}'

# 2. Login
curl -X POST "https://backend-production-cc13.up.railway.app/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@wikiscrolls.com","password":"Demo123!@#"}'

# 3. Get Profile (replace YOUR_TOKEN)
curl "https://backend-production-cc13.up.railway.app/api/auth/profile" \
  -H "Authorization: Bearer YOUR_TOKEN"

# 4. List Articles (replace YOUR_TOKEN)
curl "https://backend-production-cc13.up.railway.app/api/articles?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 💻 JavaScript/React Native Examples

### 1. Correct API Client Setup

```javascript
const API_BASE_URL = 'https://backend-production-cc13.up.railway.app';

// Helper to get stored token
async function getToken() {
  return await AsyncStorage.getItem('authToken');
}

// Helper for authenticated requests
async function authFetch(endpoint, options = {}) {
  const token = await getToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });
  
  // Handle 401 - redirect to login
  if (response.status === 401) {
    await AsyncStorage.removeItem('authToken');
    // Navigate to login screen
    return null;
  }
  
  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.message);
  }
  
  return data.data;
}
```

### 2. Login Example

```javascript
async function login(email, password) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message);
    }

    // Store token
    await AsyncStorage.setItem('authToken', result.data.token);
    await AsyncStorage.setItem('user', JSON.stringify(result.data.user));

    return result.data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}
```

### 3. Get Articles Example

```javascript
async function getArticles(page = 1, limit = 20) {
  try {
    const data = await authFetch(
      `/api/articles?page=${page}&limit=${limit}&sortBy=likeCount&sortOrder=desc`
    );
    return data; // { articles, pagination }
  } catch (error) {
    console.error('Get articles error:', error);
    throw error;
  }
}
```

### 4. Like Article Example

```javascript
async function likeArticle(articleId) {
  try {
    const data = await authFetch('/api/interactions', {
      method: 'POST',
      body: JSON.stringify({
        articleId,
        interactionType: 'LIKE',
      }),
    });
    return data;
  } catch (error) {
    // Handle 409 - already liked
    if (error.message.includes('already exists')) {
      console.log('Already liked');
      return null;
    }
    throw error;
  }
}
```

### 5. Unlike Article Example

```javascript
async function unlikeArticle(articleId) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/interactions`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await getToken()}`,
      },
      body: JSON.stringify({
        articleId,
        interactionType: 'LIKE',
      }),
    });

    // 204 No Content = success
    return response.status === 204;
  } catch (error) {
    console.error('Unlike error:', error);
    throw error;
  }
}
```

---

## 🐛 Debugging Checklist

If requests are failing, check:

1. ✅ **Base URL:** Using production URL, not localhost
2. ✅ **HTTP Method:** Correct method (POST/GET/PUT/DELETE)
3. ✅ **Headers:** 
   - `Content-Type: application/json` for POST/PUT
   - `Authorization: Bearer <token>` for protected routes
4. ✅ **Request Body:** 
   - Using `JSON.stringify()` for body
   - Body matches expected format
5. ✅ **Response Handling:** 
   - Checking `response.success` field
   - Handling different status codes
6. ✅ **Token Management:** 
   - Token stored after login
   - Token included in headers
   - Handling 401 responses
7. ✅ **Error Handling:** 
   - Parsing error messages from `response.errors`
   - Showing user-friendly messages

---

## 📊 Quick Reference

### Most Common Mistakes:

1. **Using GET for signup/login** → Should be POST
2. **Missing Authorization header** → Add for all protected routes
3. **Missing Content-Type header** → Add for POST/PUT requests
4. **Using localhost URL** → Change to production URL
5. **Not checking response.success** → Always check before using data
6. **Not handling 401 errors** → Should redirect to login

### Test Account:
- **Email:** `demo@wikiscrolls.com`
- **Password:** `Demo123!@#`

---

## 🚀 Quick Start for FE Team

1. Update `API_BASE_URL` to production URL
2. Ensure all signup/login use `POST` method
3. Add `Authorization: Bearer <token>` header to all protected routes
4. Add `Content-Type: application/json` header to all POST/PUT requests
5. Check `response.success` before using data
6. Handle 401 responses by redirecting to login

---

**Summary:** The API is working correctly. Frontend issues are most likely:
- Wrong base URL (localhost vs production)
- Wrong HTTP methods (GET vs POST)
- Missing Authorization headers
- Missing Content-Type headers
