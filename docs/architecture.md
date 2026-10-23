# Architecture

Parbin is a small full-stack app for listing meetup-style **events**, accepting public **suggestions**, and providing **admin** authentication and moderation. The repository is a **monorepo** with a React SPA and a Go API sharing no runtime code; they communicate over **JSON HTTP** with **cookie-based** admin sessions.

## High-level diagram

```mermaid
flowchart LR
  subgraph client [Browser]
    FE[React SPA\nVite]
  end
  subgraph server [Backend]
    API[Gin HTTP API]
    SVC[Services]
    ST[Postgres stores]
    API --> SVC --> ST
  end
  DB[(PostgreSQL)]
  ST --> DB
  FE -->|HTTPS JSON\ncredentials include| API
```

## Repository layout

```
parbin/
├── .github/workflows/    # event-scraper.yml: manual Actions run
├── package.json          # Root scripts: dev:all, db:up, db:seed, test:e2e, prepare:*
├── playwright.config.ts  # E2E harness (auto-starts the frontend Vite dev server)
├── e2e/                  # Playwright end-to-end specs
├── pnpm-lock.yaml
├── README.md
├── CONTRIBUTING.md
├── LICENSE
├── frontend/             # Vite + React + TypeScript
│   ├── package.json
│   ├── vite.config.ts
│   ├── components.json   # shadcn/ui config
│   ├── docs/history/     # Archived HTML design candidates (Calm Calendar chosen)
│   └── src/
│       ├── App.tsx       # RouterProvider entry
│       ├── main.tsx
│       ├── router.tsx    # TanStack Router tree
│       ├── main-page.tsx # App shell (header, outlet, footer)
│       ├── index.css     # Tailwind + design tokens
│       ├── components/   # Feature + ui/ (shadcn)
│       ├── pages/        # Route-level screens
│       ├── hooks/        # e.g. use-event-manager
│       ├── lib/          # api.ts, utils, calendar helpers
│       └── types/        # Shared TS types (events, admin, dashboard)
├── jobs/
│   └── event-scraper/    # TypeScript + Playwright; POST suggestions + dedupe via API
├── extension/            # MV3 browser extension (Chrome/Brave/Edge/Firefox), esbuild → dist/
│   ├── static/           # manifest.json, popup.html/css, icons
│   └── src/
│       ├── content/      # Injected on click; per-site strategies (meetup.ts, bevy.ts) + registry
│       └── popup/        # Review form, backend URL setting, API client
└── backend/              # Go module: parbin/backend
    ├── cmd/
    │   ├── api/main.go   # Process entry: env, DB, migrations, HTTP server
    │   └── seed/main.go  # Dev seed: admin, 20 tags, 20 events
    ├── docker-compose.yml # Local Postgres
    └── internal/
        ├── auth/         # Password hashing, session token helpers
        ├── config/       # Env → Config
        ├── database/     # Migrations runner + SQL files
        ├── httpapi/      # Gin router, handlers, DTOs
        ├── seed/         # Development catalog used by cmd/seed
        ├── service/      # AuthService, EventService, domain errors
        └── store/        # pgx pool, CRUD for admins, sessions, tags, events, suggestions
```

## Backend modules

| Package | Role |
| ------- | ---- |
| `cmd/api` | Loads `.env`, opens Postgres, runs migrations, wires stores and services, starts `http.Server` with Gin. |
| `cmd/seed` | Development entrypoint invoked by `pnpm db:seed` and `pnpm dev:all`. Loads the same env and migrations, then writes the sample admin, tags, and events. |
| `internal/seed` | Builds that sample from the system clock in `APP_TIMEZONE` and upserts it. |
| `internal/config` | Required: `DATABASE_URL`, `SESSION_SECRET`. Optional: `PORT`, `APP_TIMEZONE`, `FRONTEND_ORIGIN`, `CORS_ALLOW_BROWSER_EXTENSIONS`, session and seed admin settings. |
| `internal/database` | Applies SQL migrations from `internal/database/migrations/` on startup. |
| `internal/httpapi` | Defines routes under `/api`, CORS for `FRONTEND_ORIGIN` (plus extension origins on public suggestion routes), JSON request/response types, maps service errors to HTTP status. |
| `internal/service` | Business logic: login/logout, event CRUD, suggestion workflow, timezone-aware “today” for feeds. |
| `internal/store` | PostgreSQL access via `pgx` pool; models in `models.go`; tags, events, suggestions, dashboard aggregations; `ErrNotFound`, `ErrConflict` for HTTP mapping. |
| `internal/auth` | Password verification and session token handling used by `AuthService`. |

## Frontend modules

| Area | Role |
| ---- | ---- |
| `router.tsx` | Declares routes: `/`, `events/$eventId`, `suggest`, `admin`, `admin/dashboard`, `past-events`; root component is `AppShell`. |
| `main-page.tsx` | Layout shell: `.parbin-backdrop`, `AppHeader`, `Outlet`, `AppFooter`, global banners. |
| `docs/history/` | Archived static design candidates; #04 Calm Calendar is the shipped direction. |
| `hooks/use-event-manager.ts` | Central client state: admin session, events, mutations, talks to `lib/api.ts`. |
| `lib/api.ts` | `fetch` wrapper with `credentials: "include"`, base URL `VITE_API_URL`, typed API functions. |
| `lib/env.ts` | Shared environment flags (`isProduction`) used to gate third-party integrations. |
| `lib/posthog.ts` / `lib/analytics.ts` | Optional PostHog init + product event helpers; enabled only in production with a token. |
| `components/ui/*` | shadcn/Radix primitives (buttons, dialogs, etc.). |
| `components/tanstack-charts.tsx` | TanStack Charts bars for events-by-tag and events-by-month on the admin dashboard. |
| `pages/*` | Screen-level composition for each route. |

## End-to-end tests

Playwright specs live in `e2e/` at the repo root with `playwright.config.ts`. The config boots a dedicated Vite dev server from `frontend/` (HTTP, port 5199) and drives it in Chromium. Run with `pnpm test:e2e`.

## Data model (PostgreSQL)

Defined in `backend/internal/database/migrations/` (`001_init.sql` plus later files):

- **admins** — email + password hash.
- **sessions** — hashed tokens, expiry, FK to admin.
- **tags** — catalog of tag names (`name` unique, case-sensitive). Existing variants are not merged.
- **events** — published events (`starts_at`, `ends_at`, image URL, optional `source_event_page`, etc.).
- **event_tags** — many-to-many between events and tags (`sort_order` preserved).
- **event_suggestions** — public proposals with `pending` / `approved` / `rejected`, optional `source_event_id`, optional `source_event_page`, reviewer metadata.
- **event_suggestion_tags** — many-to-many between suggestions and tags.

## Cross-cutting concerns

- **Timezones**: Backend loads `APP_TIMEZONE` (default `America/Panama`) and uses it for “upcoming vs past” day boundaries and for formatting API `date` / `endDate` strings.
- **CORS + cookies**: API allows the configured frontend origin, methods GET/POST/PUT, `AllowCredentials: true`. Admin routes rely on an HTTP-only session cookie. Browser-extension origins are allowed only on the public tag and suggestion routes (`CORS_ALLOW_BROWSER_EXTENSIONS`).
- **Browser extension**: `extension/` is a standalone client. On click, the popup injects `extract.js` into the active tab. The script picks an `EventPageStrategy` by hostname (Meetup, or Bevy for GDG/CNCF community sites) and returns the event. The user reviews it and the popup POSTs `/api/event-suggestions` to the backend URL saved in extension storage.
- **Local database**: `pnpm db:up` starts Postgres via `backend/docker-compose.yml`. `pnpm db:seed` (also run by `pnpm dev:all`) ensures the dev admin, 20 tags, and 20 events.

## Request path (example)

1. Browser calls `GET /api/events` (no auth).
2. `httpapi` → `EventService.ListEvents` → `EventStore` SQL.
3. Rows mapped to JSON `event` objects with local datetime strings.

For endpoint details, see [API](./api.md).
