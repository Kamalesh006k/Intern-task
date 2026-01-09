# API Documentation

## Base URL
```
http://localhost:8000
```

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## Authentication Endpoints

### Register User
**POST** `/auth/register`

Create a new user account.

**Request Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Password Requirements:**
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character (@$!%*?&)

**Response:** `201 Created`
```json
{
  "id": 1,
  "username": "johndoe",
  "email": "john@example.com",
  "notes": []
}
```

---

### Login
**POST** `/auth/login`

Authenticate and receive JWT token.

**Request Body:** (application/x-www-form-urlencoded)
```
username=johndoe
password=SecurePass123!
```

**Response:** `200 OK`
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

---

### Google OAuth Login
**POST** `/auth/google`

Authenticate using Google OAuth token.

**Request Body:**
```json
{
  "token": "<google_id_token>"
}
```

**Response:** `200 OK`
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "username": "johndoe"
}
```

---

## Profile Endpoints

### Get Current User Profile
**GET** `/profile/me`

🔒 **Protected** - Requires authentication

Retrieve the authenticated user's complete profile.

**Response:** `200 OK`
```json
{
  "id": 1,
  "username": "johndoe",
  "email": "john@example.com",
  "full_name": "John Doe",
  "bio": "Software developer passionate about web technologies",
  "phone": "+1 555-123-4567",
  "avatar_url": null,
  "created_at": "2026-01-09T14:30:00",
  "updated_at": "2026-01-09T15:45:00"
}
```

---

### Update Current User Profile
**PUT** `/profile/me`

🔒 **Protected** - Requires authentication

Update the authenticated user's profile information.

**Request Body:**
```json
{
  "full_name": "John Doe",
  "bio": "Full-stack developer with 5 years experience",
  "phone": "+1 555-987-6543",
  "avatar_url": "https://example.com/avatar.jpg"
}
```

**Note:** All fields are optional. Only provided fields will be updated.

**Phone Validation:**
- Must match pattern: `^\+?[\d\s\-\(\)]+$`
- Examples: "+1 555-123-4567", "(555) 123-4567", "555-123-4567"

**Response:** `200 OK`
```json
{
  "id": 1,
  "username": "johndoe",
  "email": "john@example.com",
  "full_name": "John Doe",
  "bio": "Full-stack developer with 5 years experience",
  "phone": "+1 555-987-6543",
  "avatar_url": "https://example.com/avatar.jpg",
  "created_at": "2026-01-09T14:30:00",
  "updated_at": "2026-01-09T16:20:00"
}
```

---

## Notes Endpoints

### Get All Notes
**GET** `/notes/`

🔒 **Protected** - Requires authentication

Retrieve all notes for the authenticated user.

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "title": "Breakout Strategy",
    "content": "Entered long position on BTC/USD...",
    "symbol": "BTC/USD",
    "ai_analysis": null,
    "user_id": 1,
    "created_at": "2026-01-09T10:00:00"
  }
]
```

---

### Create Note
**POST** `/notes/`

🔒 **Protected** - Requires authentication

Create a new note.

**Request Body:**
```json
{
  "title": "New Trade Setup",
  "content": "Identified support level at $45,000...",
  "symbol": "BTC/USD"
}
```

**Response:** `201 Created`
```json
{
  "id": 2,
  "title": "New Trade Setup",
  "content": "Identified support level at $45,000...",
  "symbol": "BTC/USD",
  "ai_analysis": null,
  "user_id": 1,
  "created_at": "2026-01-09T16:30:00"
}
```

---

### Update Note
**PUT** `/notes/{note_id}`

🔒 **Protected** - Requires authentication

Update an existing note.

**Path Parameters:**
- `note_id` (integer): ID of the note to update

**Request Body:**
```json
{
  "title": "Updated Title",
  "content": "Updated content...",
  "symbol": "ETH/USD"
}
```

**Response:** `200 OK`
```json
{
  "id": 2,
  "title": "Updated Title",
  "content": "Updated content...",
  "symbol": "ETH/USD",
  "ai_analysis": null,
  "user_id": 1,
  "created_at": "2026-01-09T16:30:00"
}
```

---

### Delete Note
**DELETE** `/notes/{note_id}`

🔒 **Protected** - Requires authentication

Delete a note.

**Path Parameters:**
- `note_id` (integer): ID of the note to delete

**Response:** `200 OK`
```json
{
  "message": "Note deleted successfully"
}
```

---

### Analyze Note with AI
**POST** `/notes/{note_id}/analyze`

🔒 **Protected** - Requires authentication

Get AI analysis for a note (mock implementation).

**Path Parameters:**
- `note_id` (integer): ID of the note to analyze

**Response:** `200 OK`
```json
{
  "analysis": "This trade setup shows good risk-reward ratio. Consider monitoring volume for confirmation..."
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "detail": "Validation error message"
}
```

### 401 Unauthorized
```json
{
  "detail": "Could not validate credentials"
}
```

### 404 Not Found
```json
{
  "detail": "Note not found"
}
```

### 422 Unprocessable Entity
```json
{
  "detail": [
    {
      "loc": ["body", "email"],
      "msg": "value is not a valid email address",
      "type": "value_error.email"
    }
  ]
}
```

---

## Testing with cURL

### Register
```bash
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"Test123!@#"}'
```

### Login
```bash
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=testuser&password=Test123!@#"
```

### Get Profile (with token)
```bash
curl -X GET http://localhost:8000/profile/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Update Profile
```bash
curl -X PUT http://localhost:8000/profile/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"full_name":"Test User","bio":"Developer","phone":"+1234567890"}'
```

---

## Interactive API Documentation

FastAPI provides interactive API documentation:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

Use these interfaces to:
- View all endpoints
- Test API calls directly in browser
- See request/response schemas
- Authenticate with JWT token
