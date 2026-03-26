# Event scraper implementation plan

Summary of what was implemented (see repo for current code).

## Backend

- Migration `002_source_event_page.sql`: optional `source_event_page` on `events` and `event_suggestions` (no index on that column; dedupe is via full scans / client-side).
- API: optional `sourceEventPage` on event/suggestion JSON; `GET /api/event-suggestions/source-urls` returns `{ "urls": [...] }` for scraper deduplication.
- Approving a suggestion copies `source_event_page` onto the new event row.

## Scraper (`jobs/event-scraper/`)

- Playwright (Chromium), strategy pattern per domain (Meetup, Eventbrite, Luma).
- Pipeline: load known URLs → discover links from `sources.json` → filter → scrape detail pages → tech keyword filter → append `scraped` tag → POST.
- Dockerfile: `mcr.microsoft.com/playwright` + `pnpm` + one-shot `tsx src/index.ts` (Railway cron).

## Decisions

- Initial sources: Meetup, Eventbrite, and Bevy for community groups (see `sources.json`).
- lu.ma to be considered in the future.
- Auto-tag: `scraped` on all bot submissions.
- Scheduling: external deployment detail.
