# My3PAI API Reference

_Last updated: 2025-01-27 (Updated with itinerary update endpoint and POI publishing behavior)_

This document captures every HTTP endpoint defined in the Laravel API (`routes/api.php` and `routes/web.php`), how they are authenticated, required payloads, and the shapes of the most important responses. The API currently relies on Laravel Sanctum for token-based auth and uses JSON throughout.

---

## Base URL & Versioning

- Local development base URL: `http://localhost:8000/api`
- All routes in this document are relative to `/api` unless explicitly noted.
- Versioning is not yet implemented; breaking changes should be coordinated manually.

## Authentication & Authorization

- **Token acquisition**: `POST /register` or `POST /login` returns a Sanctum token in `token`. Supply it in `Authorization: Bearer <token>`.
- **Token expiration**: Sanctum tokens expire after 30 days (configurable via `SANCTUM_TOKEN_EXPIRATION` env variable, in minutes).
- **Session crossover**: Social login (`/api/auth/google`) uses Laravel sessions/cookies because it is exposed as a web route.
- **Rate limiting**: 
  - Authentication endpoints (`/register`, `/login`): 5 requests per minute per IP
  - Public map endpoint (`/map/pois`): 60 requests per minute per IP
  - Rate limit exceeded returns HTTP 429
- **Middleware**:
  - `auth:sanctum`: Protects user/profile/itinerary/POI routes.

---

## Public Endpoints

### Healthcheck
- `GET /health`
- Response: `{ "status": "ok", "message": "My3PAI API is running", "timestamp": "<ISO8601>" }`

### Map POI Discovery
- `GET /map/pois`
- **Purpose**: Retrieve published POIs with optional filters and pagination (default `per_page=50`, max 100).
- **Rate limiting**: 60 requests per minute per IP address.
- **POI Visibility**: Returns POIs that are either:
  - Published individually (`status='published'`), OR
  - Belong to a published itinerary (even if POI status is draft)
- **Query parameters**:
  | Param | Type | Notes |
  | --- | --- | --- |
  | `bbox` | string | `minLng,minLat,maxLng,maxLat` (comma-separated). Must be valid geographic coordinates (-180 to 180 for longitude, -90 to 90 for latitude). Bounding box size limited to 10 degrees (≈1100km) to prevent DoS. |
  | `country` | string | ISO 2 country code. |
  | `primary_region` | string | Matches `pois.primary_region`. |
  | `place_type` | string | e.g. `nature`, `city`, `culture`, `food`, `adventure`, `other`. |
  | `cost_type` | string | `free`, `paid`, `mixed`. |
  | `difficulty` | string | `very-easy`, `easy`, `moderate`, `challenging`, `hard`, `extreme`. |
  | `activities[]` | array | Activity keys from `activities` table. |
  | `tags[]` | array | Tag keys. |
  | `per_page` | integer | 1–100. |
- **Response**:
  ```json
  {
    "success": true,
    "data": [ { ...PoiResource } ],
    "meta": {
      "filtersApplied": { ... },
      "pagination": {
        "current_page": 1,
        "per_page": 50,
        "total": 123,
        "last_page": 3,
        "has_more_pages": true
      }
    }
  }
  ```
- Each POI matches the schema from [PoiResource](#poiresource).
- **Note**: POIs from published itineraries are included even if their individual `status` is `draft`. This allows publishing entire itineraries at once.

### Google OAuth (browser flow)
- `GET /api/auth/google` – redirects to Google OAuth (web route).
- `GET /api/auth/google/callback` – handles provider response, logs in/creates user, then redirects to `FRONTEND_URL/auth/callback`.

---

## Authentication Endpoints

### Register
- `POST /register`
- **Rate limiting**: 5 requests per minute per IP address.
- **Body**:
  ```json
  {
    "first_name": "Jane",
    "last_name": "Doe",
    "email": "jane@example.com",
    "password": "secret123",
    "password_confirmation": "secret123"
  }
  ```
- **Response 201**:
  ```json
  {
    "success": true,
    "user": { "id": 1, "name": "Jane Doe", "email": "jane@example.com", "avatar": null, "picture": null, "display_name": "Jane Doe", "first_name": "Jane", "last_name": "Doe" },
    "token": "<sanctum_token>",
    "message": "Registration successful"
  }
  ```
- Creates default `UserPreference` record automatically.
- Returns HTTP 429 if rate limit exceeded.

### Login
- `POST /login`
- **Rate limiting**: 5 requests per minute per IP address.
- **Body**: `{ "email": "...", "password": "..." }`
- **Response**: same structure as registration, status 200. Returns 401 on bad credentials.
- Returns HTTP 429 if rate limit exceeded.

### Current User
- `GET /me`
- **Auth**: Bearer token.
- **Response**: raw user payload from `AuthController::formatUserResponse`.

### Logout
- `POST /logout`
- Revokes current token, logs out of `web` guard if a session exists.
- **Response**: `{ "success": true, "message": "Logged out successfully" }`

---

## Profile Management (auth:sanctum)

### Get Profile
- `GET /profile`
- Response:
  ```json
  {
    "success": true,
    "data": {
      "user": { ...profile fields... },
      "stats": { } // placeholder for future metrics
    }
  }
  ```
- Ensures default preferences exist automatically.

### Update Profile
- `PUT /profile`
- **Body fields** (all required unless noted):
  | Field | Type | Notes |
  | --- | --- | --- |
  | `firstName` | string | Required. |
  | `lastName` | string | Required. |
  | `username` | string | Optional, unique. |
  | `bio` | string | Optional, ≤ 1000 chars. |
  | `location` | string | Optional. |
- Returns updated `user` profile.

### Upload Avatar
- `POST /profile/avatar`
- Multipart form-data: `avatar` (jpg/png/webp ≤ 2 MB).
- Automatically crops to square and resizes to 256×256 when GD is available.
- Response includes new `avatar` URL.

### Upload Cover Image
- `POST /profile/cover`
- Multipart: `cover` (jpg/png/webp ≤ 5 MB). Responds with `coverImage` URL.

### Preferences
- `GET /profile/preferences` → returns `preferences` object.
- `PUT /profile/preferences`
  ```json
  {
    "currency": "USD",           // one of USD, EUR, GBP, JPY
    "language": "en",            // one of en, es, fr, de
    "timezone": "America/Los_Angeles",
    "notifications": {
      "email": true,
      "push": true,
      "marketing": false
    }
  }
  ```

### Change Password
- `POST /profile/change-password`
- **Body**:
  ```json
  {
    "currentPassword": "oldPass",    // required if password exists
    "newPassword": "newPass123",
    "newPassword_confirmation": "newPass123"
  }
  ```
- Revokes all tokens on success.

### Delete Account
- `DELETE /profile/account`
- **Body**:
  - Passworded users: `{ "password": "…" }`
  - Social-login-only users: `{ "providerReauthToken": "<google id_token>" }`
- Revokes tokens, logs out, deletes the user.

---

## Itineraries & POIs (auth:sanctum)

### Create Itinerary
- `POST /itineraries`
- Body: `{ "title": "Autumn in Bern" }`
- Response 201: `{ "success": true, "data": { "itinerary": { ...ItineraryResource } } }`

### Fetch Itinerary
- `GET /itineraries/{itinerary}`
- Accessible to owner or to the public if `is_published === true`.
- Loads POIs with associations for activities, audiences, terrains, amenities, accessibilities, tags, media, and social posts.

### Update Itinerary
- `PUT /itineraries/{itinerary}`
- **Auth**: Bearer token. Owner-only.
- **Body** (all fields optional):
  ```json
  {
    "title": "Updated Itinerary Title",
    "isPublished": true
  }
  ```
- **Field naming**: Accepts both `isPublished` (camelCase) and `is_published` (snake_case).
- **POI Publishing Behavior**:
  - When an itinerary is published (`isPublished: true`), all POIs in that itinerary are automatically published (`status='published'`).
  - When an itinerary is unpublished (`isPublished: false`), all POIs are automatically set to draft (`status='draft'`).
- **Response 200**:
  ```json
  {
    "success": true,
    "data": {
      "itinerary": { ...ItineraryResource }
    },
    "message": "Itinerary updated successfully"
  }
  ```

### Add or Update POIs in an Itinerary
- `POST /itineraries/{itinerary}/pois`
- Request is validated by `StorePoiRequest`:
  - `basic` (required): `name`, `tagline`, `summary`, `estimatedDuration`, `country` (ISO-2), `region`, `landmark`, `pinAccuracy`, `latitude`, `longitude`.
  - `category` (required): `placeType` (one of `nature|city|culture|food|adventure|other`), `activities[]` (max 20 items, no duplicates), `audience[]` (max 20 items, no duplicates), `ageRequirement`.
  - `pricing` (required): `costType` (`free|paid|mixed`), optional range, currency, booking link, voucher details (`voucher` `yes|no`, codes, partner, link).
  - `regions` (required): `primaryRegion` (`bern|valais|ticino|other`), `tags[]` (max 20 items, no duplicates).
  - Optional sections: `difficulty` (with `terrain[]` max 20 items, no duplicates), `amenities` (with `amenities[]` and `accessibility[]` max 20 items each, no duplicates), `tips`, `media` (image credit, video info, up to 3 `socialPosts` URLs), and `experience` (required `experience` text up to 2000 chars).
- **Security**: Array inputs are limited to 20 items maximum and duplicate values are rejected to prevent DoS attacks.
- Creates a new POI linked to the itinerary, synchronizes reference tables (activities, audiences, terrains, amenities, accessibilities, tags), and persists up to three social posts.
- Response 201: includes the created POI as `PoiResource`.

### Upload Itinerary Thumbnail
- `POST /itineraries/{itinerary}/thumbnail`
- Multipart: `thumbnail` (jpg/jpeg/png/webp ≤ 10 MB).
- Owner-only; stores under `storage/app/public/itineraries/{id}/thumbnail.*`.
- Response returns refreshed `ItineraryResource` with `thumbnailUrl`.

---

## POI Media Management (auth:sanctum)

### Upload Images
- `POST /pois/{poi}/media`
- Body: multipart array `images[]` (max 10 total per POI, each ≤ 10 MB, jpg/jpeg/png/webp). Optional `type` defaults to `image`.
- Authorization: requester must own the POI or its itinerary.
- Response: `{ "success": true, "data": { "images": [ ...PoiMediaResource ] } }`

### Delete Image
- `DELETE /pois/{poi}/media/{media}`
- Removes file from `public` disk and deletes record.
- Response identical to upload (remaining media collection).

### Reorder Images
- `PATCH /pois/{poi}/media/reorder`
- **Body**: `{ "order": [3,1,2] }` – media IDs in the desired order.
- **Security**: Validates that all IDs belong to the POI and that all media items for the POI are included in the order array.
- Response: updated `images` array.
- Returns HTTP 422 if invalid IDs are provided or if not all items are included.

---

## Data Models

### User Profile Payload
- Fields: `id`, `firstName`, `lastName`, `email`, `username`, `avatar`, `coverImage`, `bio`, `location`, `verified`, `createdAt`, `preferences`.
- Preferences: `currency`, `language`, `timezone`, `notifications.email|push|marketing`.

### ItineraryResource
- `{ "id", "title", "isPublished", "slug", "thumbnailUrl", "pois": [ ...PoiResource ] }`

### PoiResource
- Nested groups:
  - `basic`: name, tagline, summary, estimatedDuration, country, region, landmark, pinAccuracy, latitude, longitude.
  - `category`: placeType, activities[], audience[], ageRequirement.
  - `difficulty`: difficulty, fitness, distance, elevationGain, terrain[].
  - `pricing`: costType, priceChargedAs, currency, estimatedMinPrice, estimatedMaxPrice, bookingLink, priceNotes, voucher details.
  - `regions`: primaryRegion, tags[].
  - `amenities`: amenities[], nearbyServices, petFriendly (`yes|no`), petNotes, accessibility[].
  - `tips`: wearAndTake, nearby, insiderTips, safetyNotes.
  - `media`: imageCredit, video fields, `previewImage`, `images` (PoiMediaResource[]), `socialPosts`.
  - `experience`: { `experience` }.
  - `sortOrder`, `status`.

### PoiMediaResource
- `{ "id", "type", "url", "mime_type", "size_bytes", "sort_order" }`

---

## Error Handling

- **Validation errors**: HTTP 422 with `{ "success": false, "message"|"error": "...", "errors": { field: [messages] } }`.
- **Unauthorized**: 401 when missing/invalid token.
- **Forbidden**: 403 for resource ownership breaches (e.g., editing another user's itinerary/POI).
- **Not Found**: 404 when resource IDs do not match route bindings (e.g., deleting media that does not belong to the POI).
- **Rate limit exceeded**: HTTP 429 when rate limits are exceeded. Includes retry information in headers.

---

## Testing Notes

- `tests/Feature/Map/ExplorePoisTest.php` covers filtering, bounding boxes, and preview media logic for `/api/map/pois`.
- Use `php artisan test --filter=ExplorePoisTest` to verify map discovery behavior after changes.
- Security tests are located in `tests/Feature/Security/` covering rate limiting, SQL injection prevention, mass assignment protection, file upload security, and input validation.
- Regression tests in `tests/Feature/Security/RegressionTest.php` verify that security fixes don't break existing functionality.

---

For questions or clarifications, refer to the relevant controllers (`app/Http/Controllers`) or resources (`app/Http/Resources`) noted above.

