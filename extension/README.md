# Parbin Event Suggester (browser extension)

A Manifest V3 extension for **Chrome, Brave, Edge and Firefox**. When you open it on an event page, it detects the site, reads the event, and opens a form you can review before sending it to a Parbin backend as a suggestion (`POST /api/event-suggestions`). An admin then approves or rejects it as usual.

Supported sites: **Meetup** (`meetup.com/<group>/events/<id>`).

## Build

```bash
pnpm prepare:extension   # from the repo root (or: pnpm install --dir extension)
pnpm extension:build     # writes extension/dist/
pnpm extension:watch     # rebuilds src/ on change (static/ changes need a rebuild)
```

All four browsers load the same `extension/dist/` folder.

## Load it

| Browser | Steps |
| --- | --- |
| Chrome | `chrome://extensions` → enable **Developer mode** → **Load unpacked** → pick `extension/dist` |
| Brave | `brave://extensions` → **Developer mode** → **Load unpacked** → `extension/dist` |
| Edge | `edge://extensions` → **Developer mode** → **Load unpacked** → `extension/dist` |
| Firefox (140+) | `about:debugging#/runtime/this-firefox` → **Load Temporary Add-on…** → pick `extension/dist/manifest.json` |

Firefox removes temporary add-ons when it restarts. For a permanent install, sign the build through AMO (`npx web-ext sign --source-dir dist`).

## Use it

1. Click the extension icon, then the gear button, and enter your Parbin **backend URL** (default `http://localhost:8080`). **Save & test** stores it in browser sync storage and calls `/healthz`.
2. Open a Meetup event and click the extension icon. The form fills itself with the title, start and end times, location, image, description and source URL.
3. Tags come from the backend catalog (`GET /api/tags`), the same as the web suggest form. The extension preselects catalog tags that match the Meetup topics or appear in the title or description, up to 6.
4. If the event URL is already stored on an event or suggestion (`GET /api/event-suggestions/source-urls`), you'll see a warning before sending.
5. Edit anything you need and click **Send suggestion**.

Times are shown in your browser's time zone and sent as absolute RFC 3339 timestamps, so the backend's `APP_TIMEZONE` doesn't shift them.

## Backend requirements

Extension pages send requests with an `Origin` such as `chrome-extension://<id>` or `moz-extension://<uuid>`. The backend allows these origins only on the public routes the extension calls (`/healthz`, `/api/tags`, `/api/event-suggestions`, `/api/event-suggestions/source-urls`). Admin and auth routes still accept only `FRONTEND_ORIGIN`. To turn this off, set `CORS_ALLOW_BROWSER_EXTENSIONS=false` on the backend.

## Permissions

- `activeTab` + `scripting`: read the current tab, only after you click the extension icon. There are no persistent host permissions.
- `storage`: remember the backend URL.

## Adding a site (strategy pattern)

Each site is an `EventPageStrategy` (`src/content/strategies/types.ts`) that runs inside the page:

```ts
export interface EventPageStrategy {
  id: string                                // e.g. "meetup.com"
  label: string                             // shown in the popup badge
  matchesHost(hostname: string): boolean
  extract(doc: Document, url: URL): StrategyOutcome // { kind: "event", event } | { kind: "not-event", message }
}
```

1. Add `src/content/strategies/<site>.ts`. Shared helpers (JSON-LD, meta tags, canonical URL) live in `src/content/util/page.ts`.
2. Register it in `src/content/strategies/registry.ts`.
3. Return `sourceEventPage` in the same canonical form the scraper uses (no query, hash or trailing slash) so duplicate detection works.

Strategies run in the content-script isolated world. They can read the DOM, including `<script>` tag contents such as `__NEXT_DATA__`, but not the page's JavaScript variables.

## Layout

```
extension/
├── build.mjs            # esbuild: popup (ESM) + extract (IIFE), copies static/ → dist/
├── static/              # manifest.json, popup.html, popup.css, icons/
└── src/
    ├── shared/types.ts  # ExtractedEvent, ExtractionResult, SuggestionPayload
    ├── content/         # injected on demand by the popup
    │   ├── extract.ts   # picks a strategy, returns ExtractionResult
    │   ├── strategies/  # types.ts, registry.ts, meetup.ts
    │   └── util/page.ts
    └── popup/           # main.ts (UI), api.ts, settings.ts, tags.ts, browser.ts (chrome/browser shim)
```
