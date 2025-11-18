# POI Field Inventory

This document summarizes every field that the **Create a point of interest** modal currently collects. Use it as the canonical reference when designing the backend schema.

The POI payload emitted by `POIAccordion` follows this shape:

```
{
  basic: BasicInformation,
  category: CategoryType,
  difficulty: DifficultyEffort,
  pricing: PricingVouchers,
  regions: RegionsTags,
  amenities: AmenitiesServices,
  tips: TravelTips,
  media: MediaCredits,
  experience: PersonalExperience
}
```

Each subsection below maps to the Vue component in `src/components/itinerary-map/components/add-itineraries/components/poi-sections`.

---

## 1. Basic Information (`basic`)

| Field key | UI label | Type | Constraints & notes |
| --- | --- | --- | --- |
| `name` | POI Name | string | **Required**. Free text title. |
| `tagline` | Short title / Tagline | string | **Required**. Short subtitle. |
| `summary` | Brief summary | string (<=400 chars) | **Required**. Textarea with counter and “Polish my text”. |
| `estimatedDuration` | Estimated duration | string | Optional free text (e.g. `2-3h`). |
| `country` | Country | string | **Required**. Autocomplete via `<datalist>` seeded with full country list; also overwritten by Places autocomplete (with user confirmation). |
| `region` | Region / State / Canton | string | **Required**. Options loaded dynamically from `https://countriesnow.space/api/...` based on `country`; falls back to free text if no dataset. |
| `landmark` | Address | string | **Required**. Populated via Google Places predictions; stores formatted address. |
| `pinAccuracy` | Pin accuracy | enum string | Values: `''` (Exact), `'approximate'`, `'estimate'`. |
| `latitude` | Latitude | string (decimal) | **Required**. Filled via Places geometry; stored as 6-decimal string. |
| `longitude` | Longitude | string (decimal) | **Required**. Filled via Places geometry; stored as 6-decimal string. |

> Notes: Selecting an address triggers reverse filling of `country` and `region`. Conflicts prompt the in-app confirmation dialog.

---

## 2. Category & Type (`category`)

| Field key | UI label | Type | Constraints & notes |
| --- | --- | --- | --- |
| `placeType` | Place type (main category) | enum string | **Required**. `nature`, `city`, `culture`, `food`, `adventure`, `other`. |
| `activities` | Activity type | array\<string\> | Multi-select pills. Values include `sightseeing`, `hike`, `trail-run`, `camping`, `swimming`, `boat-trip`, `rail`, `car-viewpoint`, `photography`, `cultural`, `playground`, `food-drinks`, `winter-sports`, `other`. |
| `audience` | Audience type | array\<string\> | Multi-select. Values: `families`, `couples`, `solo`, `groups`, `digital-nomads`, `van-lifers`. |
| `ageRequirement` | Age limitation | enum string | Single-select. Values: `infant`, `kids`, `teens`, `adults`, `none`. |

---

## 3. Difficulty & Physical Effort (`difficulty`)

| Field key | UI label | Type | Constraints & notes |
| --- | --- | --- | --- |
| `difficulty` | Difficulty rating | enum string | Values: `very-easy`, `easy`, `moderate`, `challenging`, `hard`, `extreme`. |
| `fitness` | Required fitness | enum string | Values: `casual`, `active`, `fit`, `athletic`, `elite`. |
| `distance` | Nearest public transport | string | Free text (e.g. “5 min walk to station”). |
| `elevationGain` | Elevation open sea | string | Free text describing elevation (e.g. “1500 m”). |
| `terrain` | Terrain type | array\<string\> | Multi-select. Values: `paved`, `gravel`, `forest-trail`, `rocky`, `exposed`, `narrow-path`, `steps`. |

---

## 4. Pricing & Vouchers (`pricing`)

| Field key | UI label | Type | Constraints & notes |
| --- | --- | --- | --- |
| `costType` | Cost type | enum string | **Required**. Defaults to `free`. Options: `free`, `paid`, `mixed`. Controls visibility of price card. |
| `priceChargedAs` | Price charged as | enum string | Values: `per_person`, `per_group`, `per_day`, `per_activity`, `other`. Only shown when `costType` ∈ {`paid`, `mixed`}. |
| `currency` | Currency | string (ISO 4217 code) | Uppercased (max 3 chars). Datalist provides common codes. |
| `estimatedMinPrice` | Estimated min price | decimal (string input) | Positive numeric input. Consider storing as decimal(10,2). |
| `estimatedMaxPrice` | Estimated max price | decimal (string input) | Same handling as min price. |
| `bookingLink` | Booking link | URL string | Only displayed when `costType === 'paid'` right now; spec suggests enabling for `mixed` too. |
| `priceNotes` | Price notes | text | Free textarea with char counter. |
| `voucher` | Voucher available? | enum string | `yes` / `no`. |
| `voucherCode` | Voucher code | string | Only relevant when `voucher === 'yes'`. |
| `voucherPartner` | Voucher partner | string | Optional. |
| `voucherConditions` | Voucher conditions | text | Optional textarea + counter. |
| `voucherLink` | Voucher link | URL string | Optional. |

---

## 5. Regions & Tags (`regions`)

| Field key | UI label | Type | Constraints & notes |
| --- | --- | --- | --- |
| `primaryRegion` | Primary region | enum string | **Required**. Options: `bern`, `valais`, `ticino`, `other`. (Counts in UI are illustrative.) |
| `tags` | Tags | array\<string\> | Multi-select limited to: `instagrammable`, `hidden-gem`, `pet-friendly`, plus custom entries (see below). |
| *(custom tags)* | Others | array\<string\> subset | User can add arbitrary tags via “Others” pill; 10-character max, stored inside `tags` array alongside predefined values. |

---

## 6. Amenities & Nearby Services (`amenities`)

| Field key | UI label | Type | Constraints & notes |
| --- | --- | --- | --- |
| `amenities` | On-site amenities | array\<string\> | Base values: `restaurant`, `cafe`, `shop`, `wc`, `picnic`, `bbq`, `rental`. “Others” allows custom 10-char tokens appended to the same array. |
| `nearbyServices` | Nearby services | text | Free textarea + counter. |
| `petFriendly` | Pet-friendly? | enum string | `yes` / `no`. |
| `petNotes` | Pet-friendly notes | text | Only collected when `petFriendly === 'yes'`; cleared otherwise. |
| `accessibility` | Accessibility | array\<string\> | Multi-select values: `wheelchair`, `stroller`, `step-free`, `accessible-toilet`. |

---

## 7. Travel Tips (`tips`)

| Field key | UI label | Type | Constraints & notes |
| --- | --- | --- | --- |
| `wearAndTake` | Suggestion to wear and take | text | Optional textarea + counter. |
| `nearby` | Things to do nearby | text | Optional textarea + counter. |
| `insiderTips` | Insider tips | text | Optional textarea + counter. |
| `safetyNotes` | Safety notes | text | Optional textarea + counter. |

---

## 8. Media & Creator Credits (`media`)

| Field key | UI label | Type | Constraints & notes |
| --- | --- | --- | --- |
| `images` | Media uploads | array\<File\> | Up to 10 images (`png`, `jpg`, `gif`, 10 MB each). Backend should expect binary uploads or pre-signed URLs. |
| `imageCredit` | Copyright owner | text | Multiline textarea + counter + “Polish” button. |
| `videoUrl` | YouTube video URL | URL string | Optional. |
| `videoStart` | Time in video (start) | string | e.g. `04:32`. |
| `videoEnd` | Time in video (end) | string | Optional. |
| `videoCaption` | Caption for video box | string | Optional. |
| `socialPosts` | Social showcases | array\<URL string\> | Max 3 entries. Front-end validates host ∈ {Instagram, TikTok, Facebook}. UI prevents duplicates. |

> Backend upload recommendation: persist `media.images` as an array of `{ id, url, mimeType, size }`, because the UI currently keeps raw `File` objects only locally.

---

## 9. Personal Experience (`experience`)

| Field key | UI label | Type | Constraints & notes |
| --- | --- | --- | --- |
| `experience` | Personal experience | text (<=2000 chars) | **Required**. Large textarea with counter + “Polish” helper. |

---

### Additional context

- **Itinerary-level fields** live outside the POI payload (`AddItinerary.vue`):
  - `title` (required string)
  - `thumbnail` (single image via `ThumbnailUpload`)
  - `pointsOfInterest` (array of the POI objects described above)
- Many textareas share the “Polish my text” action but no API wiring yet; backend can expose an AI endpoint later if desired.
- Lat/long, country, and region rely on the Google Places JavaScript API. When Places returns values that conflict with user-entered data, the UI prompts for confirmation before overwriting.

This inventory should give you enough structure to map each field to your backend schema (SQL columns, JSONB blobs, etc.). Let me know if you need normalized lookup tables for the various enum sets.

