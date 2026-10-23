# Parbin

Parbin is an events listing app with public suggestions and admin moderation

**License:** [MIT](./LICENSE) · **Contributing:** [CONTRIBUTING.md](./CONTRIBUTING.md) · **Security:** [SECURITY.md](./SECURITY.md) · **Docs:** [`docs/`](./docs/README.md)

Parbin is split into:

- A Vite + React frontend in `frontend/`
- A Go + Gin backend in `backend/`
- A Postgres database for local development via `backend/docker-compose.yml`
- A scheduled TypeScript scraper in `jobs/event-scraper/`
- A browser extension in `extension/` for Chrome, Brave, Edge and Firefox. It reads the event on the current page (Meetup, and Bevy community sites such as GDG and CNCF) and sends it as a suggestion. See [`extension/README.md`](./extension/README.md)

## Backend features

- `GET /api/tags` to list catalog tags (`{ id, name }`) used by events and suggestions
- `GET /api/events` to list published events with `starts_at` on or after the current calendar day in `APP_TIMEZONE` (ordered soonest first)
- `GET /api/events/past` to list up to the 10 most recent past events (before today in `APP_TIMEZONE`, ordered most recent first)
- `GET /api/events/:id` to fetch a single published event by id (for deep links, including events not on the upcoming feed)
- `POST /api/events` for admin-only event creation
- `PUT /api/events/:id` for admin-only event editing
- `POST /api/event-suggestions` for public event suggestions (optional `sourceEventPage` for deduplication)
- `GET /api/event-suggestions/source-urls` to list URLs already stored on events or suggestions (for scraper deduplication)
- `GET /api/admin/dashboard` for admin-only catalog and moderation charts
- `GET /api/admin/event-suggestions` to review suggestions
- `POST /api/admin/event-suggestions/:id/approve` to convert a suggestion into an event
- `POST /api/admin/event-suggestions/:id/reject` to reject a suggestion
- `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me` for cookie-based admin auth

## Roadmap

The roadmap for Parbin represents the high level goals for the application. There'll be improvements to be made to user experience, optimization, deployment capabilities, and many more; however the latter ones will be handled as issues separated from these main goals:  

- [x] Scrape external event pages and suggest candidates for the main listing (admin moderation)
  - [x] Add sources for the scraper (allowlist, config, per-site rules) — see `jobs/event-scraper/sources.json`
  - [x] Implement the scraper (fetch, parse, normalize into suggestion-ready records) — see `jobs/event-scraper/`
  - [x] Run the scraper from GitHub Actions — manual trigger in `.github/workflows/event-scraper.yml`

## Local development

### 1. Start Postgres

```bash
pnpm db:up
```

## Environment variables

### Frontend

| Variable | Required | Default | Description |
| --- | --- | --- | --- |
| `VITE_API_URL` | No | `http://localhost:8080` | Base URL used by the frontend when calling the backend API. |
| `VITE_IS_PRODUCTION` | No | `false` | Shared production flag for third-party integrations. Set to `true` in production; leave `false` locally so analytics and similar SDKs stay disabled. |
| `VITE_POSTHOG_PROJECT_TOKEN` | No | None | PostHog project token. Analytics stays disabled while this is unset, even if `VITE_IS_PRODUCTION=true`. |
| `VITE_POSTHOG_HOST` | No | `https://us.i.posthog.com` | PostHog API host (`https://eu.i.posthog.com` for EU cloud). |
| `VITE_HTTPS` | No | `true` | Set to `false` to serve the Vite dev server over plain HTTP. HTTPS uses a locally generated mkcert certificate whose CA install needs sudo; the E2E suite sets this to `false`. |
| `E2E_BASE_URL` | No | `http://localhost:5199` | Base URL used by the Playwright E2E suite. Point it at an already-running app to skip the auto-started dev server. |
| `E2E_HTTPS` | No | `false` | When `true`, the E2E harness targets an `https://` app and boots the dev server over HTTPS. |

### Backend

| Variable | Required | Default | Description |
| --- | --- | --- | --- |
| `APP_ENV` | No | `development` | Application environment name used by the backend. |
| `PORT` | No | `8080` | Port used by the backend HTTP server. |
| `APP_TIMEZONE` | No | `America/Panama` | Timezone used for event timestamps and app time handling. |
| `DATABASE_URL` | Yes | None | Postgres connection string for the backend database. |
| `FRONTEND_ORIGIN` | No | `http://localhost:5173` | Allowed frontend origin for browser requests and cookies. |
| `CORS_ALLOW_BROWSER_EXTENSIONS` | No | `true` | Allows `chrome-extension://`, `moz-extension://` and other browser-extension origins on the public routes the Parbin extension calls (`/healthz`, `/api/tags`, `/api/event-suggestions`, `/api/event-suggestions/source-urls`). Admin and auth routes are unaffected. |
| `SESSION_COOKIE_NAME` | No | `parbin_session` | Name of the session cookie used for admin auth. |
| `SESSION_SECRET` | Yes | None | Secret used to sign and validate session data. |
| `SESSION_TTL` | No | `7d` in code, `2h` in `backend/.env.example` | Session lifetime parsed as a Go duration string. |
| `SESSION_SECURE_COOKIES` | No | `false` | Enables the `Secure` cookie flag when set to `true`. |
| `SEED_ADMIN_AUTO_PROVISION` | No | `true` | Automatically creates the seed admin account on boot. |
| `SEED_ADMIN_EMAIL` | No | `admin@parbin.local` | Email for the seed admin account. |
| `SEED_ADMIN_PASSWORD` | No | `change-me-123` | Password for the seed admin account. |

### Event scraper (`jobs/event-scraper/`)

| Variable | Required | Default | Description |
| --- | --- | --- | --- |
| `PARBIN_API_URL` | No | `http://localhost:8080` | Backend base URL for API calls. Required as a GitHub Actions repository secret for the scheduled job. |
| `SCRAPER_HEADLESS` | No | `true` | Run Playwright in headless mode. The scheduled job always sets this to `true`. |
| `SCRAPER_TIMEOUT_MS` | No | `45000` | Default navigation timeout per page (ms). |
| `LOG_LEVEL` | No | `info` | Pino log level. |

### 2. Configure the backend

Create `backend/.env` from `backend/.env.example` and adjust values if needed.

The default development credentials are:

- email: `admin@parbin.local`
- password: `change-me-123`

### 3. Run the backend

```bash
pnpm dev:backend
```

The API will be available at `http://localhost:8080`.

To run frontend and backend together from the repo root:

```bash
pnpm dev:all
```

`pnpm dev:all` runs `pnpm db:seed` before the dev servers. The seed uses `backend/.env` and the same Postgres instance as the API, so start the database with `pnpm db:up` first. Run the seed on its own with `pnpm db:seed`.

The seed ensures the admin account from `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD`, 20 catalog tags, and 20 sample events. Event copy, locations, and tags come from a fixed shuffle. Start and end times are rebuilt from the system clock in `APP_TIMEZONE` on every run:

- 5 events start on earlier days, so they stay on the past feed
- 14 events start on later days, so they stay on the upcoming feed
- 1 event starts today, so it stays on the upcoming feed until the next local midnight and then shows up as a past event

Sample rows are matched by title. A later run refreshes those times and keeps descriptions, locations, images, and tags, including edits. The seed command refuses to run when `APP_ENV=production`.

### 4. Configure the frontend

Install frontend dependencies from the repo root:

```bash
pnpm prepare:frontend
```

Create `frontend/.env` from `frontend/.env.example` if you need to override the backend URL or configure production-only integrations such as PostHog.

Default frontend env:

```bash
VITE_API_URL=http://localhost:8080
VITE_IS_PRODUCTION=false
VITE_POSTHOG_PROJECT_TOKEN=
VITE_POSTHOG_HOST=https://us.i.posthog.com
```

`VITE_IS_PRODUCTION` is the shared gate for third-party integrations. PostHog tracks pageviews and product events (suggestions, calendar actions, admin auth/moderation) only when `VITE_IS_PRODUCTION=true` **and** `VITE_POSTHOG_PROJECT_TOKEN` is set. Local development keeps it disabled.

### 5. Run the frontend

```bash
pnpm dev:frontend
```

To prepare the root utility package, frontend, backend, and scraper from the repo root:

```bash
pnpm prepare:all
```

Run the event scraper once (requires backend reachable and Playwright browsers installed):

```bash
pnpm scraper:run
```

Build the browser extension into `extension/dist/`, then load that folder as an unpacked extension (Chrome, Brave, Edge) or as a temporary add-on (Firefox). The backend URL is set inside the extension's popup.

```bash
pnpm prepare:extension
pnpm extension:build
```

### 6. Run the end-to-end tests

Playwright E2E tests live in `e2e/` at the repo root and are configured by `playwright.config.ts`. The config starts a dedicated Vite dev server on `http://localhost:5199` (separate from `pnpm dev:frontend` on 5173) and drives the specs in Chromium. That avoids needing to trust the dev server's self-signed HTTPS certificate; set `E2E_HTTPS=true` to target HTTPS instead. Some specs read real event data, so start the database and backend (`pnpm db:up`, `pnpm db:seed`, `pnpm dev:backend`) when they need it.

```bash
pnpm playwright:install   # one-time: download the Chromium browser
pnpm test:e2e             # run the suite headless
pnpm test:e2e:ui          # run in Playwright's interactive UI mode
```

Set `E2E_BASE_URL` to point the suite at an already-running app instead of the auto-started dev server.

## Notes

- The event scraper workflow (`.github/workflows/event-scraper.yml`) runs only when started manually from the Actions tab. Set the `PARBIN_API_URL` repository secret, and optionally the `SCRAPER_TIMEOUT_MS` and `LOG_LEVEL` repository variables, under Settings → Secrets and variables → Actions. `SCRAPER_HEADLESS` is forced to `true` in that workflow.
- The backend auto-runs SQL migrations on startup.
- A seed admin is auto-provisioned on boot when `SEED_ADMIN_AUTO_PROVISION=true`.
- `pnpm dev:all` runs `pnpm db:seed` before the dev servers. That script ensures the seed admin, 20 tags, and 20 events (5 past, 14 on later days, and 1 that starts today in `APP_TIMEZONE`).
- Event timestamps and the upcoming/past day boundary use the backend `APP_TIMEZONE` setting, which defaults to `America/Panama`.
- Helpful local command: `pnpm db:down`
