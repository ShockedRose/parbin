# Parbin

Parbin is an events listing app with public suggestions and admin moderation

**License:** [MIT](./LICENSE) · **Contributing:** [CONTRIBUTING.md](./CONTRIBUTING.md) · **Security:** [SECURITY.md](./SECURITY.md) · **Docs:** [`docs/`](./docs/README.md)

Parbin is split into:

- a Vite + React frontend in `frontend/`
- a Go + Gin backend in `backend/`
- a Postgres database for local development via `backend/docker-compose.yml`

## Backend features

- `GET /api/events` to list published events with `starts_at` on or after the current calendar day in `APP_TIMEZONE` (ordered soonest first)
- `GET /api/events/past` to list up to the 10 most recent past events (before today in `APP_TIMEZONE`, ordered most recent first)
- `GET /api/events/:id` to fetch a single published event by id (for deep links, including events not on the upcoming feed)
- `POST /api/events` for admin-only event creation
- `PUT /api/events/:id` for admin-only event editing
- `POST /api/event-suggestions` for public event suggestions
- `GET /api/admin/event-suggestions` to review suggestions
- `POST /api/admin/event-suggestions/:id/approve` to convert a suggestion into an event
- `POST /api/admin/event-suggestions/:id/reject` to reject a suggestion
- `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me` for cookie-based admin auth

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

### Backend

| Variable | Required | Default | Description |
| --- | --- | --- | --- |
| `APP_ENV` | No | `development` | Application environment name used by the backend. |
| `PORT` | No | `8080` | Port used by the backend HTTP server. |
| `APP_TIMEZONE` | No | `America/Panama` | Timezone used for event timestamps and app time handling. |
| `DATABASE_URL` | Yes | None | Postgres connection string for the backend database. |
| `FRONTEND_ORIGIN` | No | `http://localhost:5173` | Allowed frontend origin for browser requests and cookies. |
| `SESSION_COOKIE_NAME` | No | `parbin_session` | Name of the session cookie used for admin auth. |
| `SESSION_SECRET` | Yes | None | Secret used to sign and validate session data. |
| `SESSION_TTL` | No | `7d` in code, `2h` in `backend/.env.example` | Session lifetime parsed as a Go duration string. |
| `SESSION_SECURE_COOKIES` | No | `false` | Enables the `Secure` cookie flag when set to `true`. |
| `SEED_ADMIN_AUTO_PROVISION` | No | `true` | Automatically creates the seed admin account on boot. |
| `SEED_ADMIN_EMAIL` | No | `admin@parbin.local` | Email for the seed admin account. |
| `SEED_ADMIN_PASSWORD` | No | `change-me-123` | Password for the seed admin account. |

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

### 4. Configure the frontend

Install frontend dependencies from the repo root:

```bash
pnpm prepare:frontend
```

Create `frontend/.env` from `frontend/.env.example` if you need to override the backend URL.

Default frontend API target:

```bash
VITE_API_URL=http://localhost:8080
```

### 5. Run the frontend

```bash
pnpm dev:frontend
```

To prepare the root utility package, frontend, and backend from the repo root:

```bash
pnpm prepare:all
```

## Notes

- The backend auto-runs SQL migrations on startup.
- A seed admin is auto-provisioned on boot when `SEED_ADMIN_AUTO_PROVISION=true`.
- Event timestamps and the upcoming/past day boundary use the backend `APP_TIMEZONE` setting, which defaults to `America/Panama`.
- Helpful local command: `pnpm db:down`
