# Trip Management API Documentation

Complete API documentation for trip management endpoints in the My3PAI application.

**Base URL:** `/api/profile/trips`

**Authentication:** All endpoints require authentication via Bearer token (`Authorization: Bearer YOUR_TOKEN`)

---

## Endpoints Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/profile/trips` | List user's trips |
| `POST` | `/api/profile/trips` | Create a new trip |
| `GET` | `/api/profile/trips/{id}` | Get a single trip |
| `PUT` | `/api/profile/trips/{id}` | Update a trip |
| `DELETE` | `/api/profile/trips/{id}` | Delete a trip |
| `POST` | `/api/profile/trips/{id}/thumbnail` | Upload/update trip thumbnail |
| `POST` | `/api/profile/trips/{id}/short-thumbnail` | Upload/update short-form thumbnail |

---

## 1. List User's Trips

**GET** `/api/profile/trips`

Get all trips belonging to the authenticated user with optional filtering.

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `status` | string | No | Filter by status: `planning`, `upcoming`, `completed`, `cancelled`, or `all` (default: all) |
| `limit` | integer | No | Limit number of results |
| `page` | integer | No | Page number for pagination |

### Example Request

```bash
GET /api/profile/trips?status=upcoming&page=1
Authorization: Bearer YOUR_TOKEN
```

### Success Response (200)

```json
{
  "success": true,
  "data": [
    {
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
      "thumbnail": "https://api.my3pai.com/storage/trips/trip_1_thumb.jpg",
      "shortThumbnail": "https://api.my3pai.com/storage/trips/trip_1_thumb_vertical.jpg",
      "shortDuration": 42,
      "tags": ["romantic", "europe", "city"],
      "videos": [
        {
          "url": "https://www.youtube.com/watch?v=example",
          "duration": 42,
          "platform": "youtube"
        },
        {
          "url": "https://www.instagram.com/reel/example",
          "platform": "instagram"
        }
      ],
      "views": 12800,
      "likes": 845,
      "comments": 32,
      "owner": {
        "id": 7,
        "name": "Alex Johnson",
        "avatar": "https://api.my3pai.com/storage/avatars/7.jpg",
        "followers": 0
      },
      "createdAt": "2025-11-02T15:30:00.000000Z"
    }
  ]
}
```

---

## 2. Create a New Trip

**POST** `/api/profile/trips`

Create a new trip for the authenticated user.

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | Yes | Trip title (max 255 chars) |
| `destination` | string | Yes | Trip destination (max 255 chars) |
| `startDate` | date | Yes | Trip start date (YYYY-MM-DD) |
| `endDate` | date | Yes | Trip end date (must be after startDate) |
| `budget` | string | Yes | Budget level: `low`, `medium`, or `high` |
| `status` | string | Yes | Trip status: `planning`, `upcoming`, `completed`, or `cancelled` |
| `travelers` | integer | No | Number of travelers (min: 1) |
| `notes` | string | No | Trip notes |
| `thumbnail` | string | No | Thumbnail URL (max 500 chars) |
| `shortThumbnail` | string | No | Optional vertical/short thumbnail URL (max 500 chars) |
| `tags` | array/string | No | Array of tag strings, or comma-separated string |
| `videos` | array | No | Array of video URLs (strings) or objects with `url` property |
| `platform` | string | No | Platform badge: `youtube`, `instagram`, `tiktok`, `other` (default: `other`) |
| `difficulty` | string | No | Trip difficulty: `easy`, `medium`, `hard` (default: `medium`) |
| `shortDuration` | integer | No | Duration in seconds for short-form preview |
| `views` | integer | No | Optional counter override (defaults to `0` if omitted) |
| `likes` | integer | No | Optional counter override (defaults to `0` if omitted) |
| `comments` | integer | No | Optional counter override (defaults to `0` if omitted) |

### Example Request

```javascript
const response = await axios.post('/api/profile/trips', {
  title: "Tokyo Adventure",
  destination: "Tokyo, Japan",
  startDate: "2025-03-15",
  endDate: "2025-03-22",
  budget: "high",
  status: "upcoming",
  travelers: 2,
  notes: "First time visiting Japan!",
  tags: ["japan", "city", "culture"], // or "japan,city,culture"
  videos: [
    "https://youtube.com/watch?v=example",
    // or
    { url: "https://instagram.com/reel/example" }
  ]
}, {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

### Success Response (201)

```json
{
  "success": true,
  "data": {
    "id": 5,
    "title": "Tokyo Adventure",
    "destination": "Tokyo, Japan",
    "startDate": "2025-03-15",
    "endDate": "2025-03-22",
    "platform": "other",
    "difficulty": "medium",
    "budget": "Luxury",
    "status": "upcoming",
    "travelers": 2,
    "notes": "First time visiting Japan!",
    "thumbnail": null,
    "shortThumbnail": null,
    "shortDuration": null,
    "tags": ["japan", "city", "culture"],
    "videos": [
      {
        "url": "https://youtube.com/watch?v=example"
      },
      {
        "url": "https://instagram.com/reel/example"
      }
    ],
    "views": 0,
    "likes": 0,
    "comments": 0,
    "owner": {
      "id": 3,
      "name": "Alex Johnson",
      "avatar": "https://api.my3pai.com/storage/avatars/3.jpg",
      "followers": 0
    },
    "createdAt": "2025-11-02T16:00:00.000000Z"
  },
  "message": "Trip created successfully"
}
```

### Validation Error Response (422)

```json
{
  "success": false,
  "error": "Validation failed",
  "errors": {
    "title": ["The title field is required."],
    "endDate": ["The end date must be a date after or equal to start date."]
  }
}
```

### Notes

- **Field Normalization:**
  - `startDate` / `endDate` can be sent as `startDate`/`endDate` (camelCase) or `start_date`/`end_date` (snake_case)
  - `shortThumbnail` / `short_thumbnail` automatically fall back to the main `thumbnail` when omitted
  - Empty strings for nullable fields (`thumbnail`, `shortThumbnail`, `notes`, `tags`, `videos`, `travelers`) are converted to `null`
  - `tags` can be sent as an array `["tag1", "tag2"]` or comma-separated string `"tag1,tag2"`
  - `videos` can be sent as array of strings `["url1", "url2"]` or array of objects `[{url: "url1", "duration": 45}]`
  - `platform` and `difficulty` values are lower-cased automatically; invalid values will trigger validation
- `videos` objects can include optional `duration` (seconds) and `platform` hints which are preserved in responses
- `shortDuration` falls back to the first video duration when not provided
- `views`, `likes`, and `comments` are optional integers that default to `0` when omitted
  - Each trip response includes an `owner` object with creator metadata (id, name, avatar, followers)

---

## 3. Get Single Trip

**GET** `/api/profile/trips/{id}`

Get details of a specific trip. Only accessible by the trip owner.

### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | integer | Yes | Trip ID |

### Example Request

```bash
GET /api/profile/trips/5
Authorization: Bearer YOUR_TOKEN
```

### Success Response (200)

```json
{
  "success": true,
  "data": {
    "id": 5,
    "title": "Tokyo Adventure",
    "destination": "Tokyo, Japan",
    "startDate": "2025-03-15",
    "endDate": "2025-03-22",
    "platform": "other",
    "difficulty": "medium",
    "budget": "Luxury",
    "status": "upcoming",
    "travelers": 2,
    "notes": "First time visiting Japan!",
    "thumbnail": "https://api.my3pai.com/storage/trips/trip_5_thumb.jpg",
    "shortThumbnail": "https://api.my3pai.com/storage/trips/trip_5_thumb_vertical.jpg",
    "shortDuration": 60,
    "tags": ["japan", "city", "culture"],
    "videos": [
      {
        "url": "https://youtube.com/watch?v=example",
        "duration": 60,
        "platform": "youtube"
      }
    ],
    "views": 4860,
    "likes": 312,
    "comments": 21,
    "owner": {
      "id": 3,
      "name": "Alex Johnson",
      "avatar": "https://api.my3pai.com/storage/avatars/3.jpg",
      "followers": 0
    },
    "createdAt": "2025-11-02T16:00:00.000000Z"
  }
}
```

### Error Responses

**404 Not Found:**
```json
{
  "success": false,
  "error": "Trip not found"
}
```

**403 Forbidden (not trip owner):**
```json
{
  "success": false,
  "error": "Unauthorized access"
}
```

---

## 4. Update Trip

**PUT** `/api/profile/trips/{id}`

Update an existing trip. Only accessible by the trip owner.

### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | integer | Yes | Trip ID |

### Request Body

Same fields as **Create Trip**, but all fields are optional (only include fields you want to update).

### Example Request

```javascript
const response = await axios.put('/api/profile/trips/5', {
  title: "Updated Tokyo Adventure",
  status: "completed",
  notes: "Trip was amazing! We visited all the major temples."
}, {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

### Success Response (200)

```json
{
  "success": true,
  "data": {
    "id": 5,
    "title": "Updated Tokyo Adventure",
    "destination": "Tokyo, Japan",
    "startDate": "2025-03-15",
    "endDate": "2025-03-22",
    "budget": "high",
    "status": "completed",
    "travelers": 2,
    "notes": "Trip was amazing! We visited all the major temples.",
    "thumbnail": "https://api.my3pai.com/storage/trips/trip_5_thumb.jpg",
    "tags": ["japan", "city", "culture"],
    "videos": [
      {
        "url": "https://youtube.com/watch?v=example"
      }
    ],
    "createdAt": "2025-11-02T16:00:00.000000Z"
  },
  "message": "Trip updated successfully"
}
```

---

## 5. Delete Trip

**DELETE** `/api/profile/trips/{id}`

Delete a trip. Only accessible by the trip owner.

### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | integer | Yes | Trip ID |

### Example Request

```bash
DELETE /api/profile/trips/5
Authorization: Bearer YOUR_TOKEN
```

### Success Response (200)

```json
{
  "success": true,
  "message": "Trip deleted successfully"
}
```

### Error Responses

**404 Not Found:**
```json
{
  "success": false,
  "error": "Trip not found"
}
```

**403 Forbidden:**
```json
{
  "success": false,
  "error": "Unauthorized access"
}
```

---

## 6. Upload Trip Thumbnail

**POST** `/api/profile/trips/{id}/thumbnail`

Upload or update a trip thumbnail image. Accepts both multipart file uploads and base64 encoded images.

### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | integer | Yes | Trip ID |

### Request Body (Option 1: Multipart Form Data)

```javascript
const formData = new FormData();
formData.append('thumbnail', file); // File object from input

const response = await axios.post(`/api/profile/trips/${tripId}/thumbnail`, formData, {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'multipart/form-data'
  }
});
```

### Request Body (Option 2: Base64 Image)

```javascript
const response = await axios.post(`/api/profile/trips/${tripId}/thumbnail`, {
  thumbnail: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ..." // Base64 string
}, {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

### Validation Rules

- **File upload:** `image|mimes:jpeg,jpg,png,webp|max:5120` (max 5MB)
- **Base64:** Must be valid base64 image data

### Success Response (200)

```json
{
  "success": true,
  "data": {
    "thumbnail": "https://api.my3pai.com/storage/trips/trip_5_thumb_1234567890.jpg"
  },
  "message": "Thumbnail uploaded successfully"
}
```

### Error Responses

**422 Validation Error:**
```json
{
  "success": false,
  "error": "Validation failed",
  "errors": {
    "thumbnail": ["The thumbnail must be an image.", "The thumbnail must not be greater than 5120 kilobytes."]
  }
}
```

**404 Not Found:**
```json
{
  "success": false,
  "error": "Trip not found"
}
```

### Notes

- Old thumbnail is automatically deleted when a new one is uploaded
- Images are stored in `storage/app/public/trips/`
- Public URL is generated using `Storage::url()`
- Base64 images are automatically decoded and saved (max 5MB after decoding)
- For vertical/short previews use the dedicated endpoint below

---

## 7. Upload Short Trip Thumbnail

**POST** `/api/profile/trips/{id}/short-thumbnail`

Upload or replace the vertical/short form thumbnail for a trip owned by the authenticated user. Accepts both multipart file uploads and base64 encoded images.

### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | integer | Yes | Trip ID |

### Request Body (Option 1: Multipart Form Data)

```javascript
const formData = new FormData();
formData.append('shortThumbnail', file); // File object from input

const response = await axios.post(`/api/profile/trips/${tripId}/short-thumbnail`, formData, {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'multipart/form-data'
  }
});
```

### Request Body (Option 2: Base64 Image)

```javascript
const response = await axios.post(`/api/profile/trips/${tripId}/short-thumbnail`, {
  shortThumbnail: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ..." // Base64 string
}, {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

### Validation Rules

- **File upload:** `image|mimes:jpg,jpeg,png,webp|max:5120` (max 5MB)
- **Base64:** Must be valid base64 image data (max 5MB after decoding)

### Success Response (200)

```json
{
  "success": true,
  "data": {
    "shortThumbnail": "https://api.my3pai.com/storage/trips/3/shorts/trip_5_short_1234567890.jpg"
  },
  "message": "Short thumbnail uploaded successfully"
}
```

### Notes

- Stored under `storage/app/public/trips/{user_id}/shorts/`
- Previous short thumbnail is automatically deleted before saving the new one
- Falls back to the main thumbnail in responses when not set
- Requires the caller to own the trip (regular user access control)

---

## Response Format Standards

### Success Response
```json
{
  "success": true,
  "data": { /* response data */ },
  "message": "Optional success message"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "errors": { /* validation errors object if applicable */ }
}
```

## HTTP Status Codes

| Code | Meaning |
|------|---------|
| `200` | Success |
| `201` | Created |
| `400` | Bad Request |
| `401` | Unauthorized (not authenticated) |
| `403` | Forbidden (not authorized/not owner) |
| `404` | Not Found |
| `422` | Validation Error |
| `500` | Server Error |

---

## Vue.js Integration Examples

### Complete Trip Management Service

```javascript
// api/trips.js
import axios from 'axios';

const API_BASE = '/api/profile/trips';

export const tripService = {
  // Get all trips
  async getTrips(filters = {}) {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.page) params.append('page', filters.page);
    
    const response = await axios.get(`${API_BASE}?${params}`);
    return response.data;
  },

  // Get single trip
  async getTrip(id) {
    const response = await axios.get(`${API_BASE}/${id}`);
    return response.data;
  },

  // Create trip
  async createTrip(tripData) {
    const response = await axios.post(API_BASE, tripData);
    return response.data;
  },

  // Update trip
  async updateTrip(id, tripData) {
    const response = await axios.put(`${API_BASE}/${id}`, tripData);
    return response.data;
  },

  // Delete trip
  async deleteTrip(id) {
    const response = await axios.delete(`${API_BASE}/${id}`);
    return response.data;
  },

  // Upload thumbnail
  async uploadThumbnail(id, thumbnail) {
    let data;
    let headers = {};
    
    // Check if it's a base64 string
    if (typeof thumbnail === 'string' && thumbnail.startsWith('data:')) {
      data = { thumbnail };
      headers['Content-Type'] = 'application/json';
    } else {
      // File upload
      data = new FormData();
      data.append('thumbnail', thumbnail);
      headers['Content-Type'] = 'multipart/form-data';
    }
    
    const response = await axios.post(`${API_BASE}/${id}/thumbnail`, data, { headers });
    return response.data;
  },

  // Upload short thumbnail
  async uploadShortThumbnail(id, thumbnail) {
    let data;
    let headers = {};

    if (typeof thumbnail === 'string' && thumbnail.startsWith('data:')) {
      data = { shortThumbnail: thumbnail };
      headers['Content-Type'] = 'application/json';
    } else {
      data = new FormData();
      data.append('shortThumbnail', thumbnail);
      headers['Content-Type'] = 'multipart/form-data';
    }

    const response = await axios.post(`${API_BASE}/${id}/short-thumbnail`, data, { headers });
    return response.data;
  }
};
```

### Usage in Vue Component

```vue
<script setup>
import { ref, onMounted } from 'vue';
import { tripService } from '@/api/trips';

const trips = ref([]);
const loading = ref(false);
const error = ref(null);

// Load trips
async function loadTrips(status = 'all') {
  loading.value = true;
  error.value = null;
  
  try {
    const response = await tripService.getTrips({ status });
    trips.value = response.data;
  } catch (err) {
    error.value = err.response?.data?.error || 'Failed to load trips';
  } finally {
    loading.value = false;
  }
}

// Create trip
async function createTrip(tripData) {
  try {
    const response = await tripService.createTrip(tripData);
    // After creation, you can upload thumbnail if needed
    if (response.data?.id && tripData.thumbnailFile) {
      await tripService.uploadThumbnail(response.data.id, tripData.thumbnailFile);
    }
    if (response.data?.id && tripData.shortThumbnailFile) {
      await tripService.uploadShortThumbnail(response.data.id, tripData.shortThumbnailFile);
    }
    await loadTrips(); // Reload list
    return response;
  } catch (err) {
    throw err.response?.data || err;
  }
}

// Update trip with thumbnail
async function updateTrip(id, tripData) {
  try {
    const response = await tripService.updateTrip(id, tripData);
    // Upload thumbnail separately if provided
    if (tripData.thumbnailFile) {
      await tripService.uploadThumbnail(id, tripData.thumbnailFile);
    }
    if (tripData.shortThumbnailFile) {
      await tripService.uploadShortThumbnail(id, tripData.shortThumbnailFile);
    }
    return response;
  } catch (err) {
    throw err.response?.data || err;
  }
}

onMounted(() => {
  loadTrips();
});
</script>
```

---

## Tips & Best Practices

1. **Field Names:** Use camelCase (`startDate`, `endDate`) in requests - the API normalizes to snake_case automatically
2. **Tags:** Send as array for better type safety: `["tag1", "tag2"]` instead of `"tag1,tag2"`
3. **Videos:** Send as array of objects with `url` property: `[{url: "..."}]` for consistency
4. **Thumbnail Upload:** For better UX, upload thumbnail after creating/updating trip to avoid blocking the main operation
5. **Short Thumbnail Upload:** Use the dedicated short-thumbnail endpoint for vertical previews; the response URL will map to `shortThumbnail` in subsequent trip payloads
6. **Creator Data:** Use the `owner` object for display name, avatar, and follower counts (defaults to `0` when unavailable)
7. **Error Handling:** Always check `response.data.success` and handle `errors` object for validation errors
8. **Pagination:** Use query parameters for filtering and pagination to improve performance with large datasets

---

## Changelog

- **2025-11-09:** Added short-thumbnail upload endpoint documentation for regular users; documented short-form fields (`platform`, `difficulty`, `shortThumbnail`, `shortDuration`), engagement counters, and 5MB image limit
- **2025-11-02:** Initial API documentation covering trip CRUD, thumbnail uploads (multipart & base64), camelCase normalization, and flexible tag/video formats

