# City of Habits

City of Habits is a private, local-first habit tracker that turns repeated actions into a living personal city. Check-ins add windows, paths, landmarks, and atmosphere without removing anything you have already earned.

The v1 MVP is frontend-only. It works without an account or backend and keeps habits, check-ins, reflections, and preferences in the browser’s IndexedDB storage.

## Product surface

- Editorial landing page with an illustrative sample city.
- Empty-state city dashboard with explicit sample-city loading.
- Habit foundations with district, building, color, weekly intention, and reflection.
- One check-in per habit per local calendar day, with undo.
- Lifetime growth stages: planned, started, growing, and established.
- Atmosphere that moves from lively to rainy based on recent activity without deleting progress.
- District views with symmetrical habit-to-habit street connections.
- Landmark milestones at 7, 30, and 100 lifetime check-ins.
- Weekly and monthly local reports with reflections.
- Paper and night themes, quiet mode, motion preference, and optional ambient sound preference.
- Versioned JSON export/import with schema validation, summary confirmation, and transactional replacement.
- Installable static PWA with an offline fallback.

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Product explanation and non-persistent sample city |
| `/city` | Personal map, atmosphere, filters, and quick check-ins |
| `/habit/new` | Habit foundation form |
| `/habit?id=...` | Growth, history, reflection, and lifecycle controls |
| `/district?id=...` | Neighborhood summary and connections |
| `/report` | Weekly/monthly local report |
| `/settings` | Preferences, backup, import, and reset |
| `/offline` | Cached-network fallback |

## Stack and boundaries

- Next.js 16 App Router, React 19, TypeScript strict mode, Tailwind CSS v4, and pnpm 11.19.0.
- shadcn/ui `base-nova` with Base UI primitives and Lucide icons.
- Dexie for the browser-local persistence layer; Zustand for hydrated UI state.
- React Hook Form and Zod for validated habit input and backup parsing.
- Serwist for the production service worker and static asset precaching.
- Motion-ready component boundaries with reduced-motion and quiet-mode preferences.
- Static export (`out/`) with no route handlers, Server Actions, runtime backend, analytics, or third-party tracking.

The browser-local service in `src/lib/db.ts` is the only data API. `src/lib/city/rules.ts` contains pure projections for growth, atmosphere, reports, landmarks, and deterministic placement. Personal routes are marked `noindex,follow`; only the content-rich landing page is intended for search.

## Local development

Node 24.x and pnpm 11.19.0 are pinned in `.nvmrc` and `package.json`.

```bash
pnpm install
pnpm dev
```

Quality gates:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm test:e2e
pnpm build
```

The production build uses `next build --webpack` because the selected Serwist integration injects the service worker through webpack. Development keeps Next.js Turbopack enabled.

## Vercel deployment

1. Import `princeprog/city-of-habits` into Vercel.
2. Keep `main` as the Production Branch.
3. Use the repository’s pnpm lockfile, Node `24.x`, and the build command `pnpm build`.
4. Set `NEXT_PUBLIC_SITE_URL` to the assigned production URL (for example, `https://city-of-habits.vercel.app`) in Preview and Production environments.
5. Push feature branches for previews; merge or fast-forward `main` for production.

`NEXT_PUBLIC_SITE_URL` is read at build time for canonical metadata, Open Graph URLs, JSON-LD, robots, and sitemap output. The app remains fully usable if it is not set because a Vercel fallback URL is provided.

## Privacy and backup

No account is required. City data stays in IndexedDB on the current browser. Exporting creates a readable JSON backup; importing validates schema version `1`, shows a record summary, and replaces the current city only after confirmation. Encryption, cloud sync, social features, reminders, drag placement, rich seasons, and 3D exploration remain roadmap items.
