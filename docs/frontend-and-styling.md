# Frontend & styling

The UI is a **React 19** single-page app built with **Vite 7**, **TypeScript**, and **pnpm** (see `frontend/package.json`). The repo root orchestrates dev and DB commands; the app itself lives under `frontend/`.

## Stack

| Layer | Choice |
| ----- | ------ |
| Bundler / dev server | Vite with `@vitejs/plugin-react` |
| Routing | TanStack Router (`src/router.tsx`), `defaultPreload: "intent"` |
| Server state / caching | TanStack Query (`@tanstack/react-query`) |
| HTTP | Native `fetch` in `src/lib/api.ts` with `credentials: "include"` for cookies |
| Analytics | PostHog (`posthog-js` + `@posthog/react`) via `src/lib/posthog.ts` |
| Styling | **Tailwind CSS v4** via `@tailwindcss/vite` |
| Component primitives | **shadcn/ui** (style `radix-nova`), **Radix UI**, **lucide-react** icons |
| Class merging | `clsx`, `tailwind-merge`, **CVA** (`class-variance-authority`) for variants |
| Dates | `date-fns`, `react-day-picker` (forms) |
| Charts | **TanStack Charts** for events-by-tag and events-by-month; **Recharts** for the other admin dashboard charts |
| Fonts | **Schibsted Grotesk** (body) and **Literata** (serif headings) from Google Fonts, loaded in `frontend/index.html` |
| Local HTTPS (dev) | `vite-plugin-mkcert` in `vite.config.ts` |

Path alias: `@/` → `frontend/src/` (see `vite.config.ts` and `tsconfig`).

## Global styles and design tokens

`src/index.css` is the single main stylesheet:

1. Imports **Tailwind** (`@import "tailwindcss"`), **tw-animate-css**, and **shadcn**’s `tailwind.css`.
2. Defines **CSS variables** on `:root` and `.dark` (identical, dark-only palette) for semantic colors: `background` (`#0a0e14`), `card`, `popover`, `muted`, `foreground`, `primary` blue (`#0095ff`, used for events), `accent` / destructive rose (`#e11d48`, used for selection and active states), `border`, `input`, `radius` (`0.75rem`), sidebar tokens, chart colors, etc.
3. **`@theme inline`** maps those variables to Tailwind theme keys (`--font-sans: "Schibsted Grotesk"`, `--font-serif: "Literata"`, color and radius scales).
4. **`@layer components`** defines Parbin-specific utilities:
   - `.parbin-backdrop` — fixed, soft radial blue glow behind the page top (rendered once in `main-page.tsx`)
   - `.parbin-ts-chart` — TanStack Charts tooltip styling
5. **`@layer base`** applies `border-border`, `bg-background`, `text-foreground`, `antialiased` on `body`.

Dark mode variant: `@custom-variant dark (&:is(.dark *));`. The app ships a single dark theme ("Calm Calendar"), so `:root` and `.dark` hold the same values and components don't need `dark:` prefixes.

**Practical guidance for contributors**

- Prefer **semantic tokens** (`bg-card`, `text-muted-foreground`, `border-border`, `text-primary`) over hard-coded hex values so the theme stays consistent.
- Use **`font-serif`** (Literata) for page and card headings; body defaults to **Schibsted Grotesk** via `font-sans`.
- Start route screens with `PageHeader` (serif title, description, actions slot) and use `StatePanel` for loading / empty / error states so pages stay in sync.
- Event lists use `EventCard` in a `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` grid; tags use the `tag` badge variant.
- New primitives should go under `src/components/ui/` following existing shadcn patterns; run shadcn CLI aligned with `components.json` if adding official blocks.

## UI folder structure

| Path | Contents |
| ---- | -------- |
| `src/components/ui/` | Reusable primitives: button, card, dialog, select, tabs, etc. |
| `src/components/` | App chrome and features: `app-header`, `app-footer`, `page-header`, `state-panel`, `event-card`, `event-calendar` (sliding/swipeable month calendar shown below the upcoming feed), `event-form-panel`, `tag-input`, `status-banner`, … |
| `src/pages/` | Route screens: `events-page`, `event-details-page`, `suggest-page`, `admin-page`, `admin-dashboard-page`, `past-events-page` |
| `src/hooks/` | e.g. `use-event-manager.ts` — session, queries, mutations |
| `src/lib/utils.ts` | `cn()` helper (clsx + tailwind-merge) |
| `src/lib/event-days.ts` | `toDayKey` / `getEventDayKeys` — maps events to local calendar days |
| `src/lib/posthog.ts` / `analytics.ts` | PostHog init (optional) and typed product-event helpers |

Global event/admin state is provided via **`EventManagerContext`** from `event-manager-context.ts`, populated by `useEventManager()`.

## Tooling

From repo root:

- `pnpm dev:frontend` — Vite dev server (default port 5173)
- `pnpm build:frontend` — `tsc -b` + `vite build`
- `pnpm lint:frontend`, `pnpm format:frontend`, `pnpm typecheck:frontend`

Prettier includes **prettier-plugin-tailwindcss** for class sorting.

## Environment

| Variable | Default | Purpose |
| -------- | ------- | ------- |
| `VITE_API_URL` | `http://localhost:8080` | Backend base URL for `lib/api.ts` |
| `VITE_POSTHOG_PROJECT_TOKEN` | _(empty)_ | PostHog project token; omit locally to disable analytics |
| `VITE_POSTHOG_HOST` | `https://us.i.posthog.com` | PostHog ingestion host |

Copy `frontend/.env.example` to `frontend/.env` when overriding.

## Design history

Archived HTML/CSS design candidates live under [`frontend/docs/history/`](../frontend/docs/history/). Candidate **04 Calm Calendar** was chosen and adapted into the React app (dark theme, no hero, large sliding calendar below the upcoming event grid).
