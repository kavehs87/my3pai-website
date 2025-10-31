# Laravel Backend: User Profile API Implementation

## Context
You are working on a Laravel backend for a travel planning application. The frontend (Vue.js) has already implemented a complete user profile interface that expects specific API endpoints. JWT authentication and Google OAuth are already set up and working. The registration expects `first_name`, `last_name`, `email`, `password`, and `password_confirmation`. Login and `getCurrentUser` endpoints exist.

## Required Implementation

### 1. Database Schema

Create migrations for the following tables:

**users table (extend existing):**
- `id` (bigint, primary)
- `first_name` (string)
- `last_name` (string)
- `email` (string, unique)
- `username` (string, nullable, unique) - e.g., "@alexjohnson"
- `avatar` (string, nullable) - URL or path to avatar image
- `cover_image` (string, nullable) - URL or path to cover image
- `bio` (text, nullable)
- `location` (string, nullable)
- `verified` (boolean, default: false)
- `email_verified_at` (timestamp, nullable)
- `password` (string)
- `remember_token` (string, nullable)
- `created_at` (timestamp)
- `updated_at` (timestamp)

**user_preferences table:**
- `id` (bigint, primary)
- `user_id` (bigint, foreign key to users)
- `currency` (string, default: 'USD') - USD, EUR, GBP, JPY
- `language` (string, default: 'en') - en, es, fr, de
- `timezone` (string, default: 'America/Los_Angeles')
- `notifications_email` (boolean, default: true)
- `notifications_push` (boolean, default: true)
- `notifications_marketing` (boolean, default: false)
- `created_at` (timestamp)
- `updated_at` (timestamp)

**user_social_links table:**
- `id` (bigint, primary)
- `user_id` (bigint, foreign key to users)
- `platform` (string) - Instagram, Twitter, Facebook, etc.
- `url` (string)
- `public` (boolean, default: true)
- `created_at` (timestamp)
- `updated_at` (timestamp)

**trips table:**
- `id` (bigint, primary)
- `user_id` (bigint, foreign key to users)
- `title` (string)
- `thumbnail` (string, nullable) - URL or path
- `destination` (string)
- `start_date` (date)
- `end_date` (date)
- `status` (enum: 'planning', 'upcoming', 'completed', 'cancelled')
- `created_at` (timestamp)
- `updated_at` (timestamp)

**itineraries table:**
- `id` (bigint, primary)
- `user_id` (bigint, foreign key to users)
- `title` (string)
- `thumbnail` (string, nullable)
- `days` (integer)
- `views` (integer, default: 0)
- `likes` (integer, default: 0)
- `created_at` (timestamp)
- `updated_at` (timestamp)

**saved_plans table:**
- `id` (bigint, primary)
- `user_id` (bigint, foreign key to users)
- `plan_id` (bigint) - references plans/creators' plans (for now can be placeholder)
- `title` (string)
- `creator` (string)
- `thumbnail` (string, nullable)
- `created_at` (timestamp) - as "saved_at"
- `updated_at` (timestamp)

**Note:** For countries_visited and other stats, these should be calculated from trips data or stored in a separate table if needed.

### 2. Models

Create Eloquent models with relationships:
- `User` model (extend existing) with relationships:
  - `hasOne(UserPreference::class)`
  - `hasMany(UserSocialLink::class)`
  - `hasMany(Trip::class)`
  - `hasMany(Itinerary::class)`
  - `hasMany(SavedPlan::class)`
- `UserPreference`
- `UserSocialLink`
- `Trip`
- `Itinerary`
- `SavedPlan`

### 3. API Endpoints Required

All endpoints should be in `/api/profile/*` route group, protected by JWT authentication middleware.

#### GET `/api/profile`
Get current user's complete profile data including stats.

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "firstName": "Alex",
      "lastName": "Johnson",
      "email": "alex.johnson@example.com",
      "username": "@alexjohnson",
      "avatar": "https://...",
      "coverImage": "https://...",
      "bio": "Travel enthusiast...",
      "location": "San Francisco, CA",
      "joinedDate": "2023-06-15",
      "verified": true,
      "preferences": {
        "currency": "USD",
        "language": "en",
        "timezone": "America/Los_Angeles",
        "notifications": {
          "email": true,
          "push": true,
          "marketing": false
        }
      },
      "socialLinks": [
        {
          "id": 1,
          "platform": "Instagram",
          "url": "https://instagram.com/alexjohnson",
          "public": true
        }
      ]
    },
    "stats": {
      "totalTrips": 12,
      "totalItineraries": 8,
      "savedPlans": 45,
      "followers": 156,
      "following": 89,
      "countriesVisited": 18,
      "totalDaysTraveled": 127
    },
    "recentTrips": [...], // Last 3 trips
    "itineraries": [...], // All user itineraries
    "savedPlans": [...] // User's saved plans
  }
}
```

#### PUT `/api/profile`
Update user profile information.

**Request Body:**
```json
{
  "firstName": "Alex",
  "lastName": "Johnson",
  "username": "@alexjohnson",
  "bio": "Updated bio",
  "location": "New York, NY"
}
```

**Validation Rules:**
- `firstName`: required|string|max:255
- `lastName`: required|string|max:255
- `username`: nullable|string|max:255|unique:users,username,{user_id}
- `bio`: nullable|string|max:1000
- `location`: nullable|string|max:255

**Response:**
```json
{
  "success": true,
  "data": {
    "user": { /* updated user object */ }
  },
  "message": "Profile updated successfully"
}
```

#### POST `/api/profile/avatar`
Upload/update user avatar.

**Request:** multipart/form-data
- `avatar`: required|image|mimes:jpeg,jpg,png,webp|max:2048

**Response:**
```json
{
  "success": true,
  "data": {
    "avatar": "https://storage.app/avatars/user_1_avatar.jpg"
  },
  "message": "Avatar updated successfully"
}
```

**Note:** Store files in `storage/app/public/avatars/` and return public URL.

#### POST `/api/profile/cover`
Upload/update user cover image.

**Request:** multipart/form-data
- `cover`: required|image|mimes:jpeg,jpg,png,webp|max:5120

**Response:**
```json
{
  "success": true,
  "data": {
    "coverImage": "https://storage.app/covers/user_1_cover.jpg"
  },
  "message": "Cover image updated successfully"
}
```

**Note:** Store files in `storage/app/public/covers/` and return public URL.

#### PUT `/api/profile/preferences`
Update user preferences.

**Request Body:**
```json
{
  "currency": "USD",
  "language": "en",
  "timezone": "America/Los_Angeles",
  "notifications": {
    "email": true,
    "push": true,
    "marketing": false
  }
}
```

**Validation Rules:**
- `currency`: required|in:USD,EUR,GBP,JPY
- `language`: required|in:en,es,fr,de
- `timezone`: required|string|max:255
- `notifications.email`: boolean
- `notifications.push`: boolean
- `notifications.marketing`: boolean

**Response:**
```json
{
  "success": true,
  "data": {
    "preferences": { /* updated preferences */ }
  },
  "message": "Preferences updated successfully"
}
```

#### GET `/api/profile/social-links`
Get user's social links.

#### POST `/api/profile/social-links`
Add a social link.

**Request Body:**
```json
{
  "platform": "Instagram",
  "url": "https://instagram.com/alexjohnson",
  "public": true
}
```

**Validation:**
- `platform`: required|string|max:255
- `url`: required|url|max:500
- `public`: boolean

#### PUT `/api/profile/social-links/{id}`
Update a social link.

#### DELETE `/api/profile/social-links/{id}`
Delete a social link.

#### GET `/api/profile/trips`
Get user's trips (with optional filters: status=upcoming|completed|planning).

**Query Parameters:**
- `status`: optional|in:upcoming,completed,planning,all
- `limit`: optional|integer (default: all)
- `page`: optional|integer (for pagination)

#### POST `/api/profile/trips`
Create a new trip.

**Request Body:**
```json
{
  "title": "Tokyo Adventure",
  "thumbnail": "https://...",
  "destination": "Tokyo, Japan",
  "startDate": "2024-03-15",
  "endDate": "2024-03-22",
  "status": "upcoming"
}
```

**Validation:**
- `title`: required|string|max:255
- `thumbnail`: nullable|url|max:500
- `destination`: required|string|max:255
- `startDate`: required|date
- `endDate`: required|date|after:startDate
- `status`: required|in:planning,upcoming,completed,cancelled

#### PUT `/api/profile/trips/{id}`
Update a trip.

#### DELETE `/api/profile/trips/{id}`
Delete a trip.

#### POST `/api/profile/change-password`
Change user password.

**Request Body:**
```json
{
  "currentPassword": "old_password",
  "newPassword": "new_password",
  "newPasswordConfirmation": "new_password"
}
```

**Validation:**
- `currentPassword`: required|string
- `newPassword`: required|string|min:8|confirmed

**Response:**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

#### DELETE `/api/profile/account`
Delete user account (soft delete recommended).

**Request Body:**
```json
{
  "password": "user_password" // Confirm password before deletion
}
```

**Response:**
```json
{
  "success": true,
  "message": "Account deleted successfully"
}
```

### 4. Response Format Standards

All endpoints should follow this structure:

**Success:**
```json
{
  "success": true,
  "data": { /* response data */ },
  "message": "Optional success message"
}
```

**Error:**
```json
{
  "success": false,
  "error": "Error message",
  "errors": { /* validation errors object if applicable */ }
}
```

**HTTP Status Codes:**
- 200: Success
- 201: Created
- 400: Bad Request (validation errors)
- 401: Unauthorized (not authenticated)
- 403: Forbidden (not authorized)
- 404: Not Found
- 422: Unprocessable Entity (validation failed)
- 500: Server Error

### 5. Additional Requirements

1. **File Storage:**
   - Use Laravel's storage system (`Storage::disk('public')`)
   - Create symbolic link: `php artisan storage:link`
   - Store avatars in `storage/app/public/avatars/`
   - Store covers in `storage/app/public/covers/`
   - Return full URLs (use `Storage::url()` or `asset()`)

2. **Stats Calculation:**
   - `totalTrips`: Count from trips table
   - `totalItineraries`: Count from itineraries table
   - `savedPlans`: Count from saved_plans table
   - `followers`: Count from followers/following table (if exists, else return 0)
   - `following`: Count from following table (if exists, else return 0)
   - `countriesVisited`: Extract unique countries from trips (if destination includes country)
   - `totalDaysTraveled`: Sum of days from all completed trips

3. **Username Generation:**
   - On registration, auto-generate username if not provided: `@firstnamelastname` or `@firstnamelastname123` if exists
   - Username should be unique and sanitized (lowercase, no spaces)

4. **Relationships:**
   - When creating UserPreference, create automatically when user is created
   - User can have multiple social links
   - User can have multiple trips
   - Ensure proper cascading deletes or soft deletes

5. **Authorization:**
   - Users can only access/modify their own profile data
   - Add authorization checks in all profile endpoints

6. **Image Handling:**
   - Resize images if needed (use Intervention Image or similar)
   - Validate file types and sizes
   - Generate unique filenames to avoid conflicts

### 6. Testing

Create basic tests for:
- Profile retrieval
- Profile update
- Image uploads
- Password change
- Trip CRUD operations

### 7. Implementation Order

1. Create migrations and models
2. Set up relationships
3. Create UserPreference seeder/migration (auto-create on user creation)
4. Implement GET `/api/profile` endpoint
5. Implement PUT `/api/profile` endpoint
6. Implement file upload endpoints (avatar, cover)
7. Implement preferences endpoint
8. Implement social links CRUD
9. Implement trips CRUD
10. Implement password change
11. Implement account deletion
12. Calculate and return stats in profile endpoint

### 8. Notes

- The frontend expects snake_case in some places and camelCase in others. Be flexible or use API resources/transformers to format responses.
- For now, `itineraries` and `saved_plans` can be basic implementations - full functionality can come later.
- Use Laravel API Resources for consistent response formatting.
- Consider using Form Requests for validation.
- Add rate limiting for file uploads.

---

**Start implementing these endpoints following Laravel best practices. Use JWT authentication middleware, proper validation, and follow RESTful conventions.**

