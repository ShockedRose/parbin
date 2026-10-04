# Parbin event scraper

TypeScript job that uses Playwright to discover tech-related events and submits them to Parbin via `POST /api/event-suggestions` with `sourceEventPage` for deduplication.

Tags are catalog names from `GET /api/tags` (same string-name body the API expects). The job matches JSON-LD keywords and title/description text to existing catalog rows (exact catalog spelling, max 6). Names that are not in the catalog are dropped. Every submission also includes `scraped`; if that name already exists, the catalog spelling is reused so a variant row is not created.

**Strategies:** Meetup **group** home URLs, CNCF / GDG **chapter** pages on Bevy (`community.cncf.io`, `gdg.community.dev`), Eventbrite listings, Luma.

## Setup

```bash
cp .env.example .env   # optional; see comments inside for loading env vars
pnpm install
pnpm run install:browsers   # Chromium for local runs (skipped inside official Playwright Docker image)
```

## Run

Point `PARBIN_API_URL` at a running API (default `http://localhost:8080`):

```bash
pnpm start
```

From repo root: `pnpm scraper:run`

## GitHub Actions

`.github/workflows/event-scraper.yml` runs this job every Monday and Friday at 12:00 America/Panama (17:00 UTC). GitHub cron is UTC.

Set the required repository secret and the optional repository variables (Settings → Secrets and variables → Actions):

| Name | Kind | Scheduled job |
| --- | --- | --- |
| `PARBIN_API_URL` | Secret | Required. Backend base URL. |
| `SCRAPER_TIMEOUT_MS` | Variable | Optional. Defaults to `45000` when unset. |
| `LOG_LEVEL` | Variable | Optional. Defaults to `info` when unset. |

`SCRAPER_HEADLESS` is always `true` in the workflow. The runner has no display.

## Docker

Build from this directory (includes browsers):

```bash
docker build -t parbin-event-scraper .
docker run --rm -e PARBIN_API_URL=https://api.example.com parbin-event-scraper
```

## Configuration

| Env | Default | Description |
| --- | --- | --- |
| `PARBIN_API_URL` | `http://localhost:8080` | Backend base URL |
| `SCRAPER_HEADLESS` | `true` | Set to `false` for headed debugging |
| `SCRAPER_TIMEOUT_MS` | `45000` | Navigation timeout (ms) |
| `LOG_LEVEL` | `info` | Pino log level |

Sources are listed in `sources.json` (allowlisted listing URLs + `domain` key).

| `domain` | Expected `url` |
| --- | --- |
| `meetup.com` | Group home, e.g. `https://www.meetup.com/my-group-slug` (not `/find`) |
| `community.cncf.io` | Chapter home, e.g. `https://community.cncf.io/cloud-native-panama/` |
| `gdg.community.dev` | Chapter home, e.g. `https://gdg.community.dev/gdg-panama` |
| `eventbrite.com` | Search or listing URL |
| `lu.ma` | Discover or listing URL |
