# WikiScrolls Backend - API Documentation

**Generated:** November 3, 2025

All routes are RESTful and return JSON responses in the following format:

```json
{
  "success": true/false,
  "message": "Description of result",
  "data": { ... }, // Present on success
  "errors": [ ... ] // Present on validation failures
}
```

---

## 🔐 Authentication Routes (`/api/auth`)

### 1. **Register User**
- **POST** `/api/auth/signup`
- **Rate Limited:** 5 requests per 15 minutes
- **Body:**
  ```json
  {
    "username": "string (3-50 chars, alphanumeric + underscore)",
    "email": "string (valid email)",
    "password": "string (min 8 chars, 1 uppercase, 1 lowercase, 1 number)"
  }
  ```
- **Response:** `201 Created`
  ```json
  {
    "user": { "id", "username", "email", "isAdmin", "createdAt" },
    "token": "JWT token"
  }
  ```

### 2. **Login User**
- **POST** `/api/auth/login`
- **Rate Limited:** 5 requests per 15 minutes
- **Body:**
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```
- **Response:** `200 OK`
  ```json
  {
    "user": { "id", "username", "email", "isAdmin", "createdAt", "lastLoginAt" },
    "token": "JWT token"
  }
  ```

### 3. **Get Profile**
- **GET** `/api/auth/profile`
- **Auth:** Required (Bearer token)
- **Response:** `200 OK` - User object with profile relation

---

## 👥 User Management Routes (`/api/users`) - **ADMIN ONLY**

All routes require authentication + admin privileges.

### 1. **List All Users**
- **GET** `/api/users`
- **Response:** `200 OK` - Array of users with profiles

### 2. **Get User by ID**
- **GET** `/api/users/:id`
- **Params:** `id` (UUID)
- **Response:** `200 OK` - User object with profile

### 3. **Create User**
- **POST** `/api/users`
- **Rate Limited:** 10 requests per hour
- **Body:**
  ```json
  {
    "username": "string",
    "email": "string",
    "passwordHash": "string",
    "isAdmin": "boolean (optional)"
  }
  ```
- **Response:** `201 Created`

### 4. **Update User**
- **PUT** `/api/users/:id`
- **Params:** `id` (UUID)
- **Body:** Partial user object
- **Response:** `200 OK`

### 5. **Delete User**
- **DELETE** `/api/users/:id`
- **Params:** `id` (UUID)
- **Response:** `204 No Content`

---

## 📂 Category Routes (`/api/categories`) - **ADMIN ONLY**

All routes require authentication + admin privileges.

### 1. **List All Categories**
- **GET** `/api/categories`
- **Response:** `200 OK` - Array of categories with article counts

### 2. **Get Category by ID**
- **GET** `/api/categories/:id`
- **Params:** `id` (UUID)
- **Response:** `200 OK` - Category object

### 3. **Create Category**
- **POST** `/api/categories`
- **Rate Limited:** 10 requests per hour
- **Body:**
  ```json
  {
    "name": "string (1-100 chars, unique)",
    "description": "string (optional, max 500 chars)",
    "color": "string (optional, hex color e.g., #FF5733)"
  }
  ```
- **Response:** `201 Created`

### 4. **Update Category**
- **PUT** `/api/categories/:id`
- **Params:** `id` (UUID)
- **Body:** Partial category object
- **Response:** `200 OK`

### 5. **Delete Category**
- **DELETE** `/api/categories/:id`
- **Params:** `id` (UUID)
- **Note:** Cannot delete category with articles
- **Response:** `204 No Content`

---

## 📰 Article Routes (`/api/articles`)

### Public/User Routes (Require Authentication)

#### 1. **List All Articles**
- **GET** `/api/articles`
- **Auth:** Required
- **Query Params:**
  - `page` (integer, min 1, default 1)
  - `limit` (integer, 1-100, default 20)
  - `sortBy` (createdAt|title|publishedDate|viewCount|likeCount, default createdAt)
  - `sortOrder` (asc|desc, default desc)
- **Response:** `200 OK`
  ```json
  {
    "articles": [ ... ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "totalPages": 5
    }
  }
  ```

#### 2. **Get Article by ID**
- **GET** `/api/articles/:id`
- **Auth:** Required
- **Params:** `id` (UUID)
- **Response:** `200 OK` - Article with category

#### 3. **Increment View Count**
- **POST** `/api/articles/:id/view`
- **Auth:** Required
- **Params:** `id` (UUID)
- **Response:** `200 OK` - Updated article

### Admin Routes

#### 4. **Create Article**
- **POST** `/api/articles`
- **Auth:** Required + Admin
- **Rate Limited:** 10 requests per hour
- **Body:**
  ```json
  {
    "title": "string (1-500 chars)",
    "wikipediaUrl": "string (valid URL, unique)",
    "aiSummary": "string",
    "audioUrl": "string (optional, valid URL)",
    "tags": ["string", "string"] (optional),
    "publishedDate": "ISO 8601 date",
    "categoryId": "UUID"
  }
  ```
- **Response:** `201 Created`

#### 5. **Update Article**
- **PUT** `/api/articles/:id`
- **Auth:** Required + Admin
- **Params:** `id` (UUID)
- **Body:** Partial article object (including isActive, isProcessed)
- **Response:** `200 OK`

#### 6. **Delete Article**
- **DELETE** `/api/articles/:id`
- **Auth:** Required + Admin
- **Params:** `id` (UUID)
- **Response:** `204 No Content`

---

## 👤 User Profile Routes (`/api/profiles`)

### User Routes (Manage Own Profile)

#### 1. **Get My Profile**
- **GET** `/api/profiles/me`
- **Auth:** Required
- **Response:** `200 OK` - Profile with user data

#### 2. **Create My Profile**
- **POST** `/api/profiles/me`
- **Auth:** Required
- **Rate Limited:** 10 requests per hour
- **Body:**
  ```json
  {
    "displayName": "string (optional, 1-100 chars)",
    "bio": "string (optional, max 500 chars)",
    "interests": ["string", "string"] (optional, each 1-50 chars)
  }
  ```
- **Response:** `201 Created`

#### 3. **Update My Profile**
- **PUT** `/api/profiles/me`
- **Auth:** Required
- **Body:** Partial profile object
- **Response:** `200 OK`

#### 4. **Delete My Profile**
- **DELETE** `/api/profiles/me`
- **Auth:** Required
- **Response:** `204 No Content`

### Admin Routes

#### 5. **List All Profiles**
- **GET** `/api/profiles`
- **Auth:** Required + Admin
- **Response:** `200 OK` - Array of profiles with user data

#### 6. **Get Profile by User ID**
- **GET** `/api/profiles/:userId`
- **Auth:** Required (own profile or admin)
- **Params:** `userId` (UUID)
- **Response:** `200 OK`

#### 7. **Update Profile by User ID**
- **PUT** `/api/profiles/:userId`
- **Auth:** Required + Admin
- **Params:** `userId` (UUID)
- **Body:** Partial profile object
- **Response:** `200 OK`

#### 8. **Delete Profile by User ID**
- **DELETE** `/api/profiles/:userId`
- **Auth:** Required + Admin
- **Params:** `userId` (UUID)
- **Response:** `204 No Content`

---

## ❤️ Interaction Routes (`/api/interactions`)

### User Routes

#### 1. **Create Interaction**
- **POST** `/api/interactions`
- **Auth:** Required
- **Body:**
  ```json
  {
    "articleId": "UUID",
    "interactionType": "LIKE | VIEW | SAVE"
  }
  ```
- **Note:** Automatically updates article counts (viewCount, likeCount, saveCount)
- **Response:** `201 Created`

#### 2. **Get My Interactions**
- **GET** `/api/interactions/me`
- **Auth:** Required
- **Query Params:**
  - `type` (optional: LIKE|VIEW|SAVE)
- **Response:** `200 OK` - Array of interactions with article details

#### 3. **Check Interaction**
- **GET** `/api/interactions/check/:articleId`
- **Auth:** Required
- **Params:** `articleId` (UUID)
- **Query Params:**
  - `type` (required: LIKE|VIEW|SAVE)
- **Response:** `200 OK`
  ```json
  {
    "hasInteraction": true/false
  }
  ```

#### 4. **Delete Interaction (Unlike/Unsave)**
- **DELETE** `/api/interactions`
- **Auth:** Required
- **Body:**
  ```json
  {
    "articleId": "UUID",
    "interactionType": "LIKE | SAVE" (VIEW cannot be deleted)
  }
  ```
- **Note:** Automatically decrements article counts
- **Response:** `204 No Content`

### Admin Routes

#### 5. **Get Article Interactions**
- **GET** `/api/interactions/article/:articleId`
- **Auth:** Required + Admin
- **Params:** `articleId` (UUID)
- **Response:** `200 OK` - Array of interactions with user data

---

## 📱 Feed Routes (`/api/feeds`)

### User Routes (Manage Own Feed)

#### 1. **Get My Feed**
- **GET** `/api/feeds/me`
- **Auth:** Required
- **Note:** Auto-creates empty feed if doesn't exist
- **Response:** `200 OK`
  ```json
  {
    "id": "UUID",
    "userId": "UUID",
    "articleIds": ["UUID", "UUID", ...],
    "currentPosition": 0,
    "updatedAt": "ISO 8601"
  }
  ```

#### 2. **Create My Feed**
- **POST** `/api/feeds/me`
- **Auth:** Required
- **Rate Limited:** 10 requests per hour
- **Body:**
  ```json
  {
    "articleIds": ["UUID", "UUID"] (optional)
  }
  ```
- **Response:** `201 Created`

#### 3. **Update My Feed**
- **PUT** `/api/feeds/me`
- **Auth:** Required
- **Body:**
  ```json
  {
    "articleIds": ["UUID", "UUID"] (optional),
    "currentPosition": 5 (optional, non-negative integer)
  }
  ```
- **Response:** `200 OK`

#### 4. **Update Feed Position**
- **PUT** `/api/feeds/me/position`
- **Auth:** Required
- **Body:**
  ```json
  {
    "position": 10 (non-negative integer)
  }
  ```
- **Response:** `200 OK`

#### 5. **Regenerate Feed**
- **POST** `/api/feeds/me/regenerate`
- **Auth:** Required
- **Body:**
  ```json
  {
    "articleIds": ["UUID", "UUID"] (required)
  }
  ```
- **Note:** Resets currentPosition to 0
- **Response:** `200 OK`

#### 6. **Delete My Feed**
- **DELETE** `/api/feeds/me`
- **Auth:** Required
- **Response:** `204 No Content`

### Admin Routes

#### 7. **List All Feeds**
- **GET** `/api/feeds`
- **Auth:** Required + Admin
- **Response:** `200 OK` - Array of feeds with user data

#### 8. **Get Feed by User ID**
- **GET** `/api/feeds/:userId`
- **Auth:** Required (own feed or admin)
- **Params:** `userId` (UUID)
- **Response:** `200 OK`

#### 9. **Update Feed by User ID**
- **PUT** `/api/feeds/:userId`
- **Auth:** Required + Admin
- **Params:** `userId` (UUID)
- **Body:** Partial feed object
- **Response:** `200 OK`

#### 10. **Delete Feed by User ID**
- **DELETE** `/api/feeds/:userId`
- **Auth:** Required + Admin
- **Params:** `userId` (UUID)
- **Response:** `204 No Content`

---

## 🔧 System Routes

### Health Check
- **GET** `/health`
- **Auth:** Not required
- **Response:** `200 OK`
  ```json
  {
    "status": "ok",
    "timestamp": "ISO 8601"
  }
  ```

---

## 🔒 Authentication & Authorization

### Bearer Token Authentication
All protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

### Token Properties
- **Expiration:** 7 days (configurable via `JWT_EXPIRES_IN`)
- **Secret:** Set via `JWT_SECRET` environment variable
- **Payload:** `{ id, username, email, isAdmin }`

### Permission Levels
1. **Public:** No authentication required (health check)
2. **Authenticated:** Valid JWT token required
3. **Admin:** Valid JWT token + `isAdmin: true` required

---

## 📊 Rate Limiting

- **General API:** 100 requests per 15 minutes per IP
- **Auth Endpoints:** 5 requests per 15 minutes per IP
- **Create Endpoints:** 10 requests per hour per IP

---

## ⚠️ Error Responses

### Validation Error (400)
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Must be a valid email address"
    }
  ]
}
```

### Unauthorized (401)
```json
{
  "success": false,
  "message": "Authentication required",
  "errors": [
    {
      "field": "token",
      "message": "No token provided"
    }
  ]
}
```

### Forbidden (403)
```json
{
  "success": false,
  "message": "Authorization failed",
  "errors": [
    {
      "field": "auth",
      "message": "Admin privileges required"
    }
  ]
}
```

### Not Found (404)
```json
{
  "success": false,
  "message": "Article with id xxx not found"
}
```

### Conflict (409)
```json
{
  "success": false,
  "message": "Email already registered"
}
```

### Server Error (500)
```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

## 🚀 Quick Start

1. **Register a new user:**
   ```bash
   POST /api/auth/signup
   ```

2. **Login and get token:**
   ```bash
   POST /api/auth/login
   ```

3. **Use token for subsequent requests:**
   ```bash
   GET /api/articles
   Header: Authorization: Bearer <token>
   ```

4. **Create profile:**
   ```bash
   POST /api/profiles/me
   ```

5. **Interact with articles:**
   ```bash
   POST /api/interactions
   Body: { "articleId": "...", "interactionType": "LIKE" }
   ```

6. **Get personalized feed:**
   ```bash
   GET /api/feeds/me
   ```

---

## 📝 Notes

- All UUIDs are PostgreSQL UUID v4 format
- All dates are ISO 8601 format
- Category deletion is blocked if articles exist
- Interaction deletion automatically updates denormalized counts
- Feed auto-creates on first access if missing
- VIEW interactions can be created multiple times
- LIKE/SAVE interactions are unique per user-article pair
