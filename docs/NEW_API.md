# My3PAI API Reference

_Last updated: 2025-01-27_

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
  - `auth:sanctum`: Protects user/profile/itinerary/POI/admin routes.
  - `admin`: Additional guard for `/api/admin/*`; user must have `role === 'admin'`.

---

## Public Endpoints

### Healthcheck
- `GET /health`
- Response: `{ "status": "ok", "message": "My3PAI API is running", "timestamp": "<ISO8601>" }`

### Map POI Discovery
- `GET /map/pois`
- **Purpose**: Retrieve published POIs with optional filters and pagination (default `per_page=50`, max 100).
- **Rate limiting**: 60 requests per minute per IP address.
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

## Admin APIs (auth:sanctum + admin)

### Dashboard Stats
- `GET /admin/stats`
- Returns aggregate counts for users (`total`, `verified`, `admins`, `this_month`).

### Recent Activity (placeholder)
- `GET /admin/activity`
- Currently returns `{ "activities": [], "message": "Activity logs coming soon" }`.

### User Directory
- `GET /admin/users`
  - Query params: `search` (validated to prevent SQL injection, alphanumeric + @ . _ - only), `role` (`user|admin|all`), `verified` (`true|false` or `1|0`), `per_page` (1–100, capped at 100 if higher).
  - **Security**: Search input is validated and sanitized to prevent SQL injection attacks.
  - Response includes `users` array plus pagination meta (current page, last page, per page, total).

### Create User
- `POST /admin/users`
- **Body**:
  ```json
  {
    "first_name": "Amy",
    "last_name": "Adams",
    "email": "amy@example.com",
    "password": "secret123",
    "username": "amy",
    "bio": "...",
    "location": "Zurich",
    "verified": true,
    "role": "admin"
  }
  ```
- Auto-creates default preferences. Response 201 returns the full user (with preferences) plus success message.

### Show User
- `GET /admin/users/{id}` → returns user with preferences.

### Update User
- `PUT /admin/users/{id}`
- Accepts partial updates for first/last name, email, username, bio, location, verified, role.

### Delete User
- `DELETE /admin/users/{id}`
- Guard against deleting yourself (`Auth::id()`).

### Toggle Verification
- `POST /admin/users/{id}/verify`
- Flips `verified` flag and aligns `email_verified_at`.

### Change User Password
- `POST /admin/users/{id}/change-password`
- Body: `{ "password": "newSecret", "password_confirmation": "newSecret" }`

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
- **Unauthorized**: 401 when missing/invalid token or when hitting admin routes without a valid user.
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

