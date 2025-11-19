# Legacy UI Removal Inventory

_Last updated: 2025-11-19_

The backend now only supports the surfaces documented in `docs/NEW_API.md`. Everything below still targets endpoints or payloads that no longer exist and needs to be removed or redesigned before shipping another build. Nothing has been deleted yet—this file is only an audit of what should go away.

---

## 1. API Client Methods With No Server Backing (`src/services/api.js`)

| Method(s) | Removed endpoint(s) | Currently used by | Notes |
| --- | --- | --- | --- |
| `deletePoi` | `DELETE /pois/{poi}` | `AddItinerary.vue` (pending POI deletion queue) | New API only allows publish/unpublish to toggle POI status; direct delete calls fail. |

Until these helpers disappear (or are reworked to call supported endpoints), any UI that imports them will remain broken.

---

## 2. Itinerary Builder Attempting to Delete POIs

`src/components/itinerary-map/components/AddItinerary.vue` maintains a `pendingPoiDeletions` queue and calls `apiService.deletePoi(poiId)` inside `flushPoiDeletionQueue()`. The new API spec only allows publishing/unpublishing itineraries to toggle POI visibility; there is no `DELETE /pois/{id}` route anymore. The delete queue and any UI affordance that enqueues remote IDs should be stripped to avoid guaranteed 404s during a publish/save cycle.

---

### Next Steps

1. Remove or hide every UI surface listed above (plus associated routes, store fields, helper utilities, and styles).
2. Delete the unused API client methods so new code cannot accidentally reach for deprecated endpoints.
3. Update navigation to only expose the still-supported experiences (auth, profile basics, itinerary + POI management, media uploads).

Once the backend reintroduces any of these features, we can revive them behind new endpoints, but until then they only produce errors in production.

