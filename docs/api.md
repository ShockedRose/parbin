# HTTP API

Base URL: server root (default `http://localhost:8080`). JSON bodies use `Content-Type: application/json`.

Public reads generally omit cookies. **Admin** routes require a valid session cookie (name from `SESSION_COOKIE_NAME`, default `parbin_session`). The frontend sends cookies by using `fetch` with `credentials: "include"` (see `frontend/src/lib/api.ts`).

## Health

| Method | Path | Auth | Description |
| ------ | ---- | ---- | ----------- |
| GET | `/healthz` | No | Liveness: `{ "status": "ok" }` |

## Events (public read; admin write)

| Method | Path | Auth | Description |
| ------ | ---- | ---- | ----------- |
| GET | `/api/events` | No | Published events with `starts_at` on or after **today** in `APP_TIMEZONE`, soonest first. |
| GET | `/api/events/past` | No | Up to **10** most recent past events (before today in `APP_TIMEZONE`), most recent first. |
| GET | `/api/events/:id` | No | Single published event by UUID (for deep links). |
| POST | `/api/events` | Admin | Create event. **201** `{ "event": { ... } }` |
| PUT | `/api/events/:id` | Admin | Update event. **200** `{ "event": { ... } }` |

### Event JSON shape

Responses use the following fields (Go struct tags in `internal/httpapi/router.go`):

| Field | Type | Notes |
| ----- | ---- | ----- |
| `id` | string | UUID |
| `title` | string | |
| `description` | string | |
| `date` | string | Start in app timezone, format `2006-01-02T15:04:05` (no `Z` suffix) |
| `endDate` | string | End, same format |
| `location` | string | |
| `image` | string | Image URL |
| `tags` | string[] | |
| `sourceEventPage` | string \| null | Canonical URL of the external event page (optional) |

**Create / update / suggestion body** (same keys for POST/PUT bodies):

```json
{
  "title": "string",
  "description": "string",
  "date": "string",
  "endDate": "string",
  "location": "string",
  "image": "string",
  "tags": ["string"],
  "sourceEventPage": "string"
}
```

`sourceEventPage` is optional on create/update bodies. Deduplication by URL is left to callers (e.g. the scraper uses `GET /api/event-suggestions/source-urls`); the API does not enforce uniqueness on this field.

List endpoints return `{ "events": [ ... ] }`. Single event returns `{ "event": { ... } }`.

## Admin dashboard

| Method | Path | Auth | Description |
| ------ | ---- | ---- | ----------- |
| GET | `/api/admin/dashboard` | Admin | Timezone-aware aggregations over `events` and `event_suggestions`. |

### Dashboard JSON shape

Top-level object (not wrapped):

| Field | Type | Notes |
| ----- | ---- | ----- |
| `timezone` | string | `APP_TIMEZONE` used for month/weekday buckets |
| `summary` | object | Totals, queue size, approval rate, average review hours |
| `eventsByMonth` | `{ month, count }[]` | Last 12 months of published events by `starts_at` (`YYYY-MM`, zero-filled) |
| `suggestionsByMonth` | `{ month, pending, approved, rejected }[]` | Last 12 months of suggestions by `created_at` |
| `topTags` | `{ label, count }[]` | Up to 10 tags on published events |
| `topLocations` | `{ label, count }[]` | Up to 8 event locations (`Unspecified` when empty) |
| `eventsByWeekday` | `{ label, count }[]` | Sun–Sat start-day counts |
| `eventSourceMix` | `{ label, count }[]` | `Sourced` (has `sourceEventPage`) vs `Manual` |
| `suggestionSourceMix` | `{ label, count }[]` | `Sourced` vs `Community` |
| `suggestionStatusMix` | `{ label, count }[]` | `Pending` / `Approved` / `Rejected` |

`summary` fields:

| Field | Type | Notes |
| ----- | ---- | ----- |
| `totalEvents` | number | All published events |
| `upcomingEvents` | number | `starts_at` on or after today in `APP_TIMEZONE` |
| `pastEvents` | number | Before today |
| `eventsWithSourcePage` / `eventsWithoutSourcePage` | number | Catalog origin |
| `totalSuggestions` | number | All suggestion rows |
| `pendingSuggestions` / `approvedSuggestions` / `rejectedSuggestions` | number | Pipeline counts |
| `sourcedSuggestions` / `communitySuggestions` | number | Suggestion origin |
| `approvalRate` | number \| null | Approved / (approved + rejected); `null` if none reviewed |
| `avgReviewHours` | number \| null | Mean hours from `created_at` to `reviewed_at`; `null` if none reviewed |

## Event suggestions (public create; admin review)

| Method | Path | Auth | Description |
| ------ | ---- | ---- | ----------- |
| GET | `/api/event-suggestions/source-urls` | No | Distinct non-null `source_event_page` values from events and suggestions. **200** `{ "urls": [ "https://..." ] }` |
| POST | `/api/event-suggestions` | No | Submit a suggestion. **201** `{ "suggestion": { ... } }` |
| GET | `/api/admin/event-suggestions` | Admin | List suggestions. **200** `{ "suggestions": [ ... ] }` |
| POST | `/api/admin/event-suggestions/:id/approve` | Admin | Approve: creates/links event. **200** `{ "suggestion": { ... }, "event": { ... } }` |
| POST | `/api/admin/event-suggestions/:id/reject` | Admin | **200** `{ "suggestion": { ... } }` |

### Suggestion JSON shape

Extends event-like fields with:

| Field | Type | Notes |
| ----- | ---- | ----- |
| `status` | string | `pending`, `approved`, or `rejected` |
| `sourceEventId` | string \| null | Present when tied to an existing event |
| `sourceEventPage` | string \| null | External event URL when set |
| `createdAt` | string | Datetime in app timezone format |
| `reviewedAt` | string \| null | |
| `reviewedBy` | string \| null | Admin id |

## Auth (admin)

| Method | Path | Auth | Description |
| ------ | ---- | ---- | ----------- |
| POST | `/api/auth/login` | No | Body: `{ "email": "...", "password": "..." }`. Sets session cookie. **200** `{ "admin": { "id", "email", "createdAt" } }` |
| POST | `/api/auth/logout` | No* | Invalidates session; clears cookie. **204** empty body |
| GET | `/api/auth/me` | Admin | **200** `{ "admin": { ... } }` |

\*Logout uses the session cookie if present.

`createdAt` on admin is RFC3339.

## Error responses

Non-2xx responses are typically JSON:

```json
{ "error": "message" }
```

Common status codes:

| Status | Meaning |
| ------ | ------- |
| 400 | Validation / bad body (`ErrValidation`) |
| 401 | Missing or invalid session, or bad login credentials |
| 404 | Event or suggestion not found |
| 409 | Conflict (e.g. suggestion already processed) |
| 500 | Server error |

## CORS

Configured in `internal/httpapi/router.go`:

- **AllowOrigins**: `FRONTEND_ORIGIN` only
- **Methods**: GET, POST, PUT, OPTIONS
- **Headers**: `Content-Type`
- **AllowCredentials**: true

## Environment (backend)

See [README.md](../README.md) for the full table. Required for the API process: `DATABASE_URL`, `SESSION_SECRET`.

---

If you add or change routes, payloads, or env vars, update this file and the root **README.md** (see [Agents](./agents.md)).
