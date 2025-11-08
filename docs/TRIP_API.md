# Admin Trip API Endpoints

## New Endpoints

### 1. Create Trip
**POST** `/api/admin/trips`

**Headers:**
```
Authorization: Bearer YOUR_ADMIN_TOKEN
Content-Type: application/json
```

**Request Body:**
```json
{
  "user_id": 1,
  "title": "Paris Adventure",
  "destination": "Paris, France",
  "startDate": "2025-12-15",
  "endDate": "2025-12-20",
  "budget": "medium",
  "status": "upcoming",
  "platform": "instagram",
  "difficulty": "easy",
  "shortThumbnail": "https://cdn.example.com/trips/short_paris.jpg",
  "shortDuration": 45,
  "travelers": 2,
  "notes": "Romantic getaway",
  "tags": ["romantic", "europe"],
  "videos": [{"url": "https://youtube.com/watch?v=123"}],
  "thumbnail": "https://example.com/image.jpg"
}
```

**Validation:**
- `user_id`: **required** | exists in users table
- `title`: **required** | string | max 255
- `destination`: **required** | string | max 255
- `startDate`: **required** | date
- `endDate`: **required** | date | after_or_equal to startDate
- `budget`: **required** | enum: low, medium, high
- `status`: **required** | enum: planning, upcoming, completed, cancelled
- `platform`: nullable | enum: youtube, instagram, tiktok, other
- `difficulty`: nullable | enum: easy, medium, hard
- `shortThumbnail`: nullable | url | max 500
- `shortDuration`: nullable | integer | min 0
- `travelers`: nullable | integer | min 1
- `notes`: nullable | string
- `tags`: nullable | array
- `videos`: nullable | array
- `thumbnail`: nullable | url | max 500

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Paris Adventure",
    "destination": "Paris, France",
    "startDate": "2025-12-15",
    "endDate": "2025-12-20",
    "platform": "instagram",
    "difficulty": "easy",
    "budget": "Mid-range",
    "status": "upcoming",
    "travelers": 2,
    "notes": "Romantic getaway",
    "thumbnail": "https://example.com/image.jpg",
    "shortThumbnail": "https://cdn.example.com/trips/short_paris.jpg",
    "shortDuration": 45,
    "tags": ["romantic", "europe"],
    "videos": [{"url": "https://youtube.com/watch?v=123"}],
    "views": 0,
    "likes": 0,
    "comments": 0,
    "createdAt": "2025-11-02T15:30:00.000000Z",
    "owner": {
      "id": 1,
      "name": "John Doe",
      "avatar": "https://example.com/avatars/1.jpg",
      "followers": 0
    },
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "username": "johndoe"
    }
  },
  "message": "Trip created successfully"
}
```

---

### 2. Update Trip
**PUT** `/api/admin/trips/{id}`

**Headers:**
```
Authorization: Bearer YOUR_ADMIN_TOKEN
Content-Type: application/json
```

**Request Body:** (same as create, all fields optional except those marked required)
```json
{
  "title": "Updated Paris Adventure",
  "status": "completed",
  "user_id": 1
}
```

**Validation:** (same as create, but `user_id` is optional)

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    /* same trip object as create response */
  },
  "message": "Trip updated successfully"
}
```

---

### 3. List All Trips
**GET** `/api/admin/trips`

**Query Parameters:**
- `search` - Search by title or destination
- `status` - Filter by status (planning, upcoming, completed, cancelled, all)
- `user_id` - Filter by user ID
- `page` - Page number (default: 1)
- `per_page` - Items per page (default: 15)

**Example:**
```
GET /api/admin/trips?status=upcoming&search=paris&page=1&per_page=10
```

**Response:**
```json
{
  "success": true,
  "data": {
    "trips": [ /* array of trip objects with user info */ ],
    "meta": {
      "current_page": 1,
      "last_page": 2,
      "per_page": 15,
      "total": 25
    }
  }
}
```

---

### 4. Get Single Trip
**GET** `/api/admin/trips/{id}`

**Response:** Single trip object with user info

---

### 5. Delete Trip
**DELETE** `/api/admin/trips/{id}`

**Response:**
```json
{
  "success": true,
  "message": "Trip deleted successfully"
}
```

---

### 6. Upload Trip Thumbnail
**POST** `/api/admin/trips/{id}/thumbnail`

**Headers:**
```
Authorization: Bearer YOUR_ADMIN_TOKEN
```

**Request Body (Option 1: Multipart Form Data):**
```
Content-Type: multipart/form-data

thumbnail: [file upload]
```

**Request Body (Option 2: Base64 Image):**
```
Content-Type: application/json

{
  "thumbnail": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ..."
}
```

**Validation:**
- File upload: `required|image|mimes:jpg,jpeg,png,webp|max:5120` (max 5MB)
- Base64: Must be valid base64 image data (max 5MB)

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "thumbnail": "https://api.my3pai.com/storage/trips/1/trip_1234567890.jpg"
  },
  "message": "Thumbnail uploaded successfully"
}
```

**Error Response (422):**
```json
{
  "success": false,
  "error": "Validation failed",
  "errors": {
    "thumbnail": ["The thumbnail must be an image.", "The thumbnail must not be greater than 5120 kilobytes."]
  }
}
```

**Notes:**
- Supports both multipart file uploads and base64 encoded images
- Old thumbnail is automatically deleted when a new one is uploaded
- Images are stored in `storage/app/public/trips/{user_id}/`
- Admin can upload thumbnails for any trip (not just their own)

---

## Key Features

✅ Admin can create trips for any user  
✅ Admin can update any trip  
✅ All trip responses include user info (id, name, email, username)  
✅ Support for camelCase input (startDate → start_date)  
✅ Empty strings converted to null for nullable fields  
✅ Tags and videos normalization handled automatically  

## Notes

- All endpoints require **admin authentication**
- `user_id` is **required** when creating a trip
- `user_id` is **optional** when updating (can reassign trip to different user)
- Admin can upload trip thumbnails using: `POST /api/admin/trips/{id}/thumbnail`
- Admin endpoints return user information automatically
- Responses now include short-form metadata (`platform`, `difficulty`, `shortThumbnail`, `shortDuration`) and engagement counters (`views`, `likes`, `comments`)

