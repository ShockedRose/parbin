# Parbin

Parbin is now split into:

- a Vite + React frontend in the repo root
- a Go + Gin backend in `backend/`
- a Postgres database for local development via `backend/docker-compose.yml`

## Backend features

- `GET /api/events` to list all published events
- `POST /api/events` for admin-only event creation
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

Create `.env` from `.env.example` if you need to override the backend URL.

Default frontend API target:

```bash
VITE_API_URL=http://localhost:8080
```

### 5. Run the frontend

```bash
pnpm dev:frontend
```

## Notes

- The backend auto-runs SQL migrations on startup.
- A seed admin is auto-provisioned on boot when `SEED_ADMIN_AUTO_PROVISION=true`.
- Event timestamps are handled using the backend `APP_TIMEZONE` setting, which defaults to `America/Panama`.
- Helpful local command: `pnpm db:down`
