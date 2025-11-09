# Profile API

Comprehensive reference for the authenticated profile endpoints used by the My3PAI web app. All routes require a valid Sanctum token and live under the `/api/profile` prefix.

---

## 1. Get Profile

**GET** `/api/profile`

Returns a fully-populated creator object plus related collections used by the dashboard.

```json
{
  "success": true,
  "data": {
    "user": {
      "id": 7,
      "firstName": "Alex",
      "lastName": "Johnson",
      "email": "alex@example.com",
      "username": "travelalex",
      "avatar": "https://cdn.my3pai.com/avatars/7.jpg",
      "coverImage": "https://cdn.my3pai.com/covers/7.jpg",
      "bio": "Adventure seeker & travel content creator.",
      "location": "New York, USA",
      "joinedDate": "2023-04-12",
      "verified": true,
      "displayName": "TravelWithAlex",
      "tier": "Gold",
      "specialties": ["Adventure Travel", "Food Tours", "Solo Travel"],
      "rating": { "value": 4.8, "count": 1240 },
      "countriesVisited": ["US", "JP", "FR", "TH", "IS"],
      "languages": [
        { "id": 14, "name": "English", "proficiency": "Native" },
        { "id": 15, "name": "Japanese", "proficiency": "Intermediate" }
      ],
      "partnerships": [
        { "id": 3, "label": "GetYourGuide Tours", "url": "https://www.getyourguide.com/" },
        { "id": 4, "label": "Booking.com", "url": "https://www.booking.com/" }
      ],
      "featuredPlan": {
        "id": 21,
        "title": "Tokyo 3-Day Adventure",
        "thumbnail": "https://cdn.my3pai.com/plans/tokyo.jpg",
        "views": 2300000,
        "likes": 89000
      },
      "recentPlans": [
        { "id": 24, "title": "Kyoto Temples Guide", "thumbnail": "https://cdn.my3pai.com/plans/kyoto.jpg", "views": 1800000 },
        { "id": 21, "title": "Tokyo 3-Day Adventure", "thumbnail": "https://cdn.my3pai.com/plans/tokyo.jpg", "views": 2300000 }
      ],
      "preferences": {
        "currency": "USD",
        "language": "en",
        "timezone": "America/New_York",
        "notifications": {
          "email": true,
          "push": true,
          "marketing": false
        }
      },
      "socialLinks": [
        { "id": 11, "platform": "YouTube", "url": "https://youtube.com/@travelwithemma", "public": true },
        { "id": 12, "platform": "Instagram", "url": "https://instagram.com/travelwithemma", "public": true }
      ]
    },
    "stats": {
      "totalTrips": 47,
      "totalItineraries": 32,
      "savedPlans": 14,
      "followers": 125000,
      "following": 1200,
      "countriesVisited": 5,
      "totalDaysTraveled": 186,
      "totalPlans": 32,
      "totalViews": 4318000,
      "totalLikes": 140800
    },
    "recentTrips": [ /* TripResource[] */ ],
    "itineraries": [ /* Itinerary[] (see Trip API docs) */ ],
    "savedPlans": [ /* Saved plan cards */ ]
  }
}
```

### Notes
- `displayName` falls back to `firstName + lastName` when unset.
- Numeric counters (`views`, `likes`, `followers`, etc.) are returned as integers; let the frontend format them (e.g. `125000 → "125K"`).
- `featuredPlan` is always present (empty object `{}` when missing).
- `recentPlans` contains the 3 most recent itineraries (empty array when none).
- Empty collections (`languages`, `partnerships`, `socialLinks`) are returned as `[]`, never omitted.

---

## 2. Update Profile

**PUT** `/api/profile`

Accepts user-facing profile fields plus the new creator metadata.

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `firstName` | string | Yes | Given name |
| `lastName` | string | Yes | Family name |
| `username` | string | No | Unique handle (`nullable`) |
| `bio` | string | No | Max 1000 chars |
| `location` | string | No | Display location |
| `displayName` | string | No | Public name override |
| `tier` | string | No | Membership tier label (e.g. `Gold`, `Platinum`) |
| `specialties` | array\<string> \| comma string | No | Creator focus areas |
| `countriesVisited` | array\<ISO code> | No | ISO-2/ISO-3 country codes |
| `featuredPlanId` | integer | No | ID of an itinerary owned by the user to highlight |

### Example

```json
{
  "firstName": "Alex",
  "lastName": "Johnson",
  "username": "travelalex",
  "displayName": "TravelWithAlex",
  "tier": "Gold",
  "specialties": ["Adventure Travel", "Food Tours"],
  "countriesVisited": ["US", "JP", "FR"],
  "featuredPlanId": 21
}
```

### Response

Returns the refreshed `user` payload identical to `GET /api/profile`.

### Validation & Guards
- `featuredPlanId` must reference an itinerary owned by the authenticated user.
- `specialties` accepts a CSV string; it is normalized to an array server-side.
- Empty string values are converted to `null` to avoid validation errors.

---

## 3. Manage Languages

**PUT** `/api/profile/languages`

Replace the creator’s visible language list.

```json
{
  "languages": [
    { "name": "English", "proficiency": "Native" },
    { "name": "Spanish", "proficiency": "Intermediate" }
  ]
}
```

Rules:
- `languages` (array) max 10 entries.
- Each entry requires `name` (string ≤ 100) and `proficiency` (string ≤ 100).
- The supplied order is preserved via the `position` column.

Response mirrors the stored list.

---

## 4. Partnerships CRUD

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/profile/partnerships` | Create a new partnership |
| `PUT` | `/api/profile/partnerships/{id}` | Update an existing partnership |
| `DELETE` | `/api/profile/partnerships/{id}` | Remove a partnership |

### Payload

```json
{
  "label": "GetYourGuide Tours",
  "url": "https://www.getyourguide.com/",
  "position": 0
}
```

- `label`: required string ≤ 255.
- `url`: required, validated URL ≤ 500 chars.
- `position`: optional integer (defaults to the next slot).

Update requests use `sometimes|required` rules so you can patch a single attribute.

Responses include the normalized partnership object:

```json
{
  "success": true,
  "data": {
    "partnership": {
      "id": 7,
      "label": "GetYourGuide Tours",
      "url": "https://www.getyourguide.com/",
      "position": 0
    }
  }
}
```

Deleting returns `{ "success": true, "message": "Partnership deleted successfully" }`.

---

## 5. List Creators

**GET** `/api/creators`

Returns a paginated list of creator summaries for discovery surfaces (homepage carousel, explore pages, etc.). Requires authentication.

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `page` | integer | No | Page number (default `1`) |
| `perPage` | integer | No | Page size (default `12`, max `50`) |
| `tier` | string | No | Filter by membership tier (`Gold`, `Platinum`, etc.) |
| `specialty` | string | No | Filter creators whose specialties array contains the given value |
| `search` | string | No | Case-insensitive match against `displayName`, `username`, or `bio` |

### Response

```json
{
  "success": true,
  "data": {
    "creators": [
      {
        "id": 7,
        "displayName": "TravelWithAlex",
        "username": "travelalex",
        "avatar": "https://cdn.my3pai.com/avatars/7.jpg",
        "coverImage": "https://cdn.my3pai.com/covers/7.jpg",
        "bio": "Adventure seeker & travel content creator.",
        "location": "New York, USA",
        "verified": true,
        "tier": "Gold",
        "specialties": ["Adventure Travel", "Food Tours"],
        "rating": { "value": 4.8, "count": 1240 },
        "stats": {
          "followers": 125000,
          "following": 1200,
          "totalPlans": 32,
          "totalViews": 4318000,
          "totalLikes": 140800
        },
        "featuredPlan": {
          "id": 21,
          "title": "Tokyo 3-Day Adventure",
          "thumbnail": "https://cdn.my3pai.com/plans/tokyo.jpg",
          "views": 2300000,
          "likes": 89000
        },
        "recentPlans": [
          { "id": 24, "title": "Kyoto Temples Guide", "thumbnail": "https://cdn.my3pai.com/plans/kyoto.jpg", "views": 1800000 }
        ],
        "partnerships": [
          { "id": 3, "label": "GetYourGuide Tours", "url": "https://www.getyourguide.com/", "position": 0 }
        ],
        "socialLinks": [
          { "id": 11, "platform": "YouTube", "url": "https://youtube.com/@travelwithemma", "public": true }
        ]
      }
    ],
    "meta": {
      "currentPage": 1,
      "perPage": 12,
      "total": 87,
      "hasMorePages": true
    }
  }
}
```

### Notes
- Creators are sorted by `followers_count` descending.
- The authenticated user (when matching the filters) is moved to the top of the list.
- Numeric counters (`followers`, `totalViews`, etc.) are returned as integers; frontends should format them.
- Empty optional collections (`recentPlans`, `partnerships`, `socialLinks`) are returned as empty arrays.

---

## 6. Get Creator By ID

**GET** `/api/creators/{id}`

Returns the public-facing profile for a specific creator. Uses the same payload shape as `/api/profile`, minus sensitive fields (no email/preferences). Requires authentication.

### Example

```json
{
  "success": true,
  "data": {
    "creator": {
      "id": 7,
      "firstName": "Alex",
      "lastName": "Johnson",
      "displayName": "TravelWithAlex",
      "username": "travelalex",
      "avatar": "https://cdn.my3pai.com/avatars/7.jpg",
      "coverImage": "https://cdn.my3pai.com/covers/7.jpg",
      "bio": "Adventure seeker & travel content creator.",
      "location": "New York, USA",
      "verified": true,
      "tier": "Gold",
      "specialties": ["Adventure Travel", "Food Tours"],
      "rating": { "value": 4.8, "count": 1240 },
      "countriesVisited": ["US", "JP", "FR"],
      "languages": [
        { "id": 14, "name": "English", "proficiency": "Native" }
      ],
      "partnerships": [
        { "id": 3, "label": "GetYourGuide Tours", "url": "https://www.getyourguide.com/", "position": 0 }
      ],
      "featuredPlan": {
        "id": 21,
        "title": "Tokyo 3-Day Adventure",
        "thumbnail": "https://cdn.my3pai.com/plans/tokyo.jpg",
        "views": 2300000,
        "likes": 89000
      },
      "recentPlans": [
        { "id": 24, "title": "Kyoto Temples Guide", "thumbnail": "https://cdn.my3pai.com/plans/kyoto.jpg", "views": 1800000 }
      ],
      "stats": {
        "followers": 125000,
        "following": 1200,
        "totalPlans": 32,
        "totalViews": 4318000,
        "totalLikes": 140800
      },
      "socialLinks": [
        { "id": 11, "platform": "YouTube", "url": "https://youtube.com/@travelwithemma", "public": true }
      ]
    }
  }
}
```

### Notes
- Returns `404` if the creator does not exist or is not discoverable.
- The authenticated user may request their own profile through this endpoint; the response matches `/api/profile` minus private fields.
- `recentPlans` contains up to six of the creator’s latest public trips (same visibility rules as `/api/trips`).

---

## 7. Existing Endpoints (unchanged)

- Avatar upload: `POST /api/profile/avatar`
- Cover upload: `POST /api/profile/cover`
- Preferences: `GET/PUT /api/profile/preferences`
- Social links CRUD: `/api/profile/social-links`
- Trip CRUD + thumbnail uploads: `/api/profile/trips/**`
- Account & password management: `/api/profile/change-password`, `/api/profile/account`

All previous behavior remains backwards compatible; new fields appear in addition to the legacy response data (`recentTrips`, `itineraries`, `savedPlans`, etc.).

---

## 8. Data & Serialization Rules

- JSON responses use camelCase.
- Empty relationships => empty arrays; optional objects => `{}`.
- Numeric counters are integers (no string abbreviations).
- `specialties`, `countriesVisited`, `languages`, and `partnerships` are persisted in dedicated tables/columns and returned even when empty.
- `featuredPlan` falls back to the highest-view itinerary when no explicit selection is made.

---

## 9. Testing

Feature tests cover:
- `GET /api/profile` structure & counters
- `PUT /api/profile/languages` happy path
- Partnership create/update/delete flow
- `GET /api/creators` pagination, sorting, filters, and search
- `GET /api/creators/{id}` show endpoint

Run with:

```
php artisan test --filter=ProfileApiTest
php artisan test --filter=CreatorIndexTest
```

---

## Changelog

- **2025-11-09** — Added creator metadata (displayName, tier, specialties, rating, languages, partnerships, plans), languages & partnership endpoints, `/api/creators` discovery index, and `/api/creators/{id}` show endpoint.

