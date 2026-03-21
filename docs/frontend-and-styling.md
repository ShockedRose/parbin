# Frontend & styling

The UI is a **React 19** single-page app built with **Vite 7**, **TypeScript**, and **pnpm** (see `frontend/package.json`). The repo root orchestrates dev and DB commands; the app itself lives under `frontend/`.

## Stack

| Layer | Choice |
| ----- | ------ |
| Bundler / dev server | Vite with `@vitejs/plugin-react` |
| Routing | TanStack Router (`src/router.tsx`), `defaultPreload: "intent"` |
| Server state / caching | TanStack Query (`@tanstack/react-query`) |
| HTTP | Native `fetch` in `src/lib/api.ts` with `credentials: "include"` for cookies |
| Styling | **Tailwind CSS v4** via `@tailwindcss/vite` |
| Component primitives | **shadcn/ui** (style `radix-nova`), **Radix UI**, **lucide-react** icons |
| Class merging | `clsx`, `tailwind-merge`, **CVA** (`class-variance-authority`) for variants |
| Dates | `date-fns`, `react-day-picker` (forms) |
| Fonts | **Inter** and **Syne** from Google Fonts |
| Local HTTPS (dev) | `vite-plugin-mkcert` in `vite.config.ts` |

Path alias: `@/` → `frontend/src/` (see `vite.config.ts` and `tsconfig`).

## Global styles and design tokens

`src/index.css` is the single main stylesheet:

1. Imports **Tailwind** (`@import "tailwindcss"`), **tw-animate-css**, and **shadcn**’s `tailwind.css`.
2. Defines **CSS variables** on `:root` and `.dark` for semantic colors: `background`, `foreground`, `primary` (`#0095ff`), `accent` / destructive rose (`#e11d48`), `card`, `border`, `radius`, sidebar tokens, chart colors, etc.
3. **`@theme inline`** maps those variables to Tailwind theme keys (e.g. `--font-sans: "Inter"`, `--font-display: "Syne"`, color and radius scales, primary/accent ladder using `hsl(from …)`).
4. **`@layer components`** defines Parbin-specific utilities:
   - `.parbin-shell-grid` — subtle grid overlay
   - `.parbin-shell-edges` — edge glows using `color-mix` with `var(--primary)`
   - `.parbin-glow-primary` / `.parbin-glow-primary-sm` — focus/card glows
5. **`@layer base`** applies `border-border`, `bg-background`, `text-foreground`, `antialiased` on `body`.


Dark mode variant: `@custom-variant dark (&:is(.dark *));` — components can use `dark:` prefixes when the root has `.dark`. However, dark mode hasn't been officially implemented, the application currently has styles that mostly comply with a dark mode theme

**Practical guidance for contributors**

- Prefer **semantic tokens** (`bg-card`, `text-muted-foreground`, `border-border`, `text-primary`) over hard-coded hex values so the theme stays consistent.
- Use **`font-display`** (Syne) for marketing-style headings if the design calls for it; body defaults to **Inter** via `font-sans`.
- New primitives should go under `src/components/ui/` following existing shadcn patterns; run shadcn CLI aligned with `components.json` if adding official blocks.

## UI folder structure

| Path | Contents |
| ---- | -------- |
| `src/components/ui/` | Reusable primitives: button, card, dialog, select, tabs, etc. |
| `src/components/` | App chrome and features: `app-header`, `app-footer`, `event-form-panel`, `status-banner`, … |
| `src/pages/` | Route screens: `events-page`, `event-details-page`, `suggest-page`, `admin-page`, `past-events-page` |
| `src/hooks/` | e.g. `use-event-manager.ts` — session, queries, mutations |
| `src/lib/utils.ts` | `cn()` helper (clsx + tailwind-merge) |

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

Copy `frontend/.env.example` to `frontend/.env` when overriding.
