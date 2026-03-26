# Notes for AI agents and automation

This file complements the root [`AGENTS.md`](../AGENTS.md). It tells coding agents what to read first and what to keep in sync when they change behavior.

## Read order

1. [`README.md`](../README.md) — setup, env vars, high-level API list
2. [`docs/architecture.md`](./architecture.md) — where code lives and how layers connect
3. [`docs/api.md`](./api.md) — exact routes and JSON shapes
4. [`docs/frontend-and-styling.md`](./frontend-and-styling.md) — UI stack and tokens

## Mandatory doc updates

When your change affects any of the following, **update the root README** (and this doc set where noted):

| Change | Update |
| ------ | ------ |
| New/changed HTTP route, status code, or JSON field | `README.md` API bullets, **`docs/api.md`**, and if needed `frontend/src/lib/api.ts` / types |
| New or renamed env var (frontend or backend) | `README.md` env tables, **`docs/api.md`** or **`docs/frontend-and-styling.md`** if relevant |
| Startup behavior (migrations, seed admin, new service) | `README.md` Notes / setup |
| New top-level folder or major module | **`docs/architecture.md`** tree and tables |
| Styling system (Tailwind/shadcn/tokens) or primary stack | **`docs/frontend-and-styling.md`** |

Keep **CONTRIBUTING.md** accurate if contribution or review steps change.

## Commands (verify before suggesting)

- Full stack: `pnpm dev:all` (frontend + backend). Database: `pnpm db:up` using `backend/docker-compose.yml`.
- Frontend quality: `pnpm lint:frontend`, `pnpm typecheck:frontend`.
- Backend: `cd backend && go build ./...` (or `go test ./...` when tests exist).
- Event scraper: `pnpm scraper:run` (after `pnpm prepare:scraper` and `pnpm --dir jobs/event-scraper run install:browsers` locally).

## Conventions

- **Go module path**: `parbin/backend` (`backend/go.mod`).
- **Frontend imports**: `@/` → `src/`.
- **Auth**: Session cookie + `credentials: "include"`; do not document API keys for browser calls unless the project adds them.

If unsure about API behavior, prefer reading `backend/internal/httpapi/router.go` and `internal/service` over guessing.
