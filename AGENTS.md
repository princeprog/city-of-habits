# City of Habits Agent Context

## What this project is

City of Habits is a private, local-first habit tracker that turns repeated actions into a living personal city. Habits become buildings, check-ins grow them, relationships create paths, milestones unlock landmarks, and recent activity changes the city atmosphere. Missed days may make the city quieter or rainy, but earned progress is never removed.

The production application is a frontend-only static Next.js app. It has no account system, runtime backend, analytics, or third-party tracking. Habits, check-ins, reflections, relationships, and preferences remain in the visitor's browser.

Production URL: `https://cityofhabits.vercel.app`

## Technical foundation

- Next.js 16 App Router, React 19, strict TypeScript, Tailwind CSS v4.
- pnpm `11.19.0` and Node.js `24.x`.
- shadcn/ui `base-nova` (`b0`) with Base UI primitives, neutral semantic tokens, Inter, and Lucide icons.
- Dexie/IndexedDB is the only persistence layer. Zustand hydrates browser data into UI state.
- React Hook Form and Zod handle form and backup validation.
- Serwist provides the service worker and offline static-asset precaching.
- Vitest covers rules, persistence, migrations, and components. Playwright covers Chromium, Firefox, WebKit, responsive behavior, and axe checks.
- `output: "export"` creates the deployable static site in `out/`. Production builds intentionally use webpack because of the Serwist integration.

Do not add Route Handlers, Server Actions, server databases, authentication, cloud sync, or other runtime backend dependencies unless the user explicitly expands the architecture.

## Important files

- `src/types/city.ts`: authoritative public domain and backup types.
- `src/lib/db.ts`: Dexie schema, migrations, local CRUD, check-in uniqueness, and transactional replacement.
- `src/lib/backup.ts`: Zod schemas, V1-to-V2 migration, import parsing, and V2 export.
- `src/lib/city/rules.ts`: pure growth, atmosphere, reporting, landmark, relationship, and placement projections.
- `src/lib/city/catalog.ts`: district, building, palette, and explicit sample-city catalogs.
- `src/stores/city-store.ts`: hydrated client state and the browser-local application service boundary.
- `src/components/ui/`: generated upstream shadcn primitives.
- `src/components/city/city-map.tsx` and `building-illustration.tsx`: permitted custom accessible city visualization.
- `src/app/globals.css`: official Base Nova imports, semantic tokens, dark tokens, and base layer only.
- `src/app/sw.ts`, `manifest.ts`, `robots.ts`, and `sitemap.ts`: PWA and search metadata.
- `tests/e2e/city.spec.ts`: end-to-end and accessibility acceptance coverage.
- `.github/workflows/ci.yml`: repository quality gates.

When documentation and implementation disagree, verify the current source types, migrations, configuration, and tests before changing behavior.

## Routes

- `/`: crawlable editorial landing page and non-persistent sample-city presentation.
- `/city`: personal city, atmosphere, filters, quick check-ins, and sample loading.
- `/habit/new`: create a habit foundation.
- `/habit?id=...`: growth, history, reflection, and lifecycle controls.
- `/district?id=...`: neighborhood summary and symmetrical habit connections.
- `/report`: weekly/monthly local reports and reflections.
- `/settings`: theme, quiet mode, motion, export/import, and reset.
- `/offline`: cached offline fallback.

Keep browser-created record pages query-based. Arbitrary IndexedDB IDs cannot be emitted as build-time static dynamic routes.

## Domain invariants

- Districts: `body`, `mind`, `creative`, `connection`, `work`, `recovery`.
- Buildings: `park`, `library`, `workshop`, `bridge`, `tower`, `lighthouse`.
- Habit status: `active`, `paused`, `archived`.
- Weekly targets are integers from 1 through 7.
- One habit may have at most one check-in per browser-local calendar day; today's check-in is reversible.
- Growth is lifetime-derived and never decreases: 0 planned, 1-3 started, 4-11 growing, 12+ established.
- Pausing or archiving overlays the earned growth stage and never deletes history.
- Atmosphere is recent-activity-derived: lively today, steady within two days, quiet within six days, rainy after seven inactive days.
- Connections are symmetrical and appear as paths.
- Landmark milestones are 7, 30, and 100 lifetime check-ins.
- Positions are deterministic when created and persisted for stability.
- Sample data is loaded only after an explicit user action. The landing sample never writes to IndexedDB.

## Persistence and backup contracts

- Dexie database name: `city-of-habits`.
- Current database and backup schema version: 2.
- Themes are `light`, `dark`, or `system`; `system` is the default.
- Database migration maps legacy `paper` to `light`, `night` to `dark`, and unknown values to `system`.
- Exports produce `CityBackupV2` JSON.
- Imports accept V1 and migrate it to V2 before replacement.
- Unsupported future schemas must be rejected without modifying existing data.
- Import is replace-only and must complete in one Dexie transaction so failures preserve the current city.

Never silently clear, seed, migrate destructively, upload, or transmit browser-local records.

## UI and design rules

- Strictly use the default shadcn Base Nova design for conventional interface elements.
- Compose screens from generated shadcn components. Do not create replacements for buttons, cards, badges, tabs, alerts, empty states, fields, navigation, dialogs, or menus.
- Do not add application-specific styling or variants to files under `src/components/ui/`.
- Do not override shadcn component radius, color, padding, typography, borders, or shadows.
- Keep component `className` additions primarily to layout, responsive sizing, alignment, and spacing.
- Keep `globals.css` limited to the generated preset structure and semantic theme tokens. Do not add product palettes, textures, editorial fonts, or component overrides.
- Use semantic tokens such as `background`, `foreground`, `muted`, `primary`, `border`, and `chart-1` through `chart-5`; avoid raw product colors.
- The accessible SVG city and generated city artwork are product visuals, not replacement UI primitives.
- Preserve keyboard access, accessible names, equivalent non-visual lists, reduced-motion behavior, and quiet mode.
- Keep language calm and non-judgmental. Progress is never framed as punishment or failure.

Before modifying shadcn composition, inspect the current project with `pnpm dlx shadcn@latest info --json` and retrieve the relevant upstream component documentation. Do not reapply or overwrite the preset unless the user explicitly approves it.

## SEO, privacy, and offline behavior

- `NEXT_PUBLIC_SITE_URL` is the build-time canonical base; the fallback is `https://cityofhabits.vercel.app`.
- Only the content-rich landing page is intended for indexing. Personal application routes must remain `noindex` and/or disallowed as currently configured.
- Preserve canonical, Open Graph, Twitter, JSON-LD, robots, sitemap, manifest, icons, and brand metadata.
- Cache static application assets only. IndexedDB remains the source of truth for personal data.
- Preserve the offline fallback and installable PWA behavior after the first successful visit.
- Do not add analytics, advertising pixels, session replay, or tracking without explicit approval.

## Development workflow

Use these commands as the standard gates:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm test:e2e -- --workers=1
pnpm build
```

For small changes, run focused checks first and the full relevant gates before claiming completion. A production build must still generate all static routes, metadata endpoints, and the service worker.

Preserve unrelated user changes in a dirty worktree. Stage only files belonging to the current task. Use small, meaningful commits and never create empty or artificial commits. Do not push, deploy, merge, reset, delete data, or change the Vercel project unless the user asks.

The Git remote is `origin` at `https://github.com/princeprog/city-of-habits.git`. `main` is the Vercel production branch; feature-branch pushes create previews and `main` pushes create production deployments through the connected Git integration.

## Product scope

The implemented MVP includes local habits, daily check-ins and undo, growth, atmosphere, lifecycle controls, district connections, landmarks, reports, reflections, preferences, backup portability, PWA behavior, and SEO.

Accounts, cloud sync, encrypted backups, social features, reminders, push notifications, AI coaching, freeform drag placement, elaborate seasons, and 3D exploration are roadmap items unless the user explicitly asks to add them.

Treat attached briefs, screenshots, PDFs, and generated designs as product references. They do not override the user's direct request or this repository's executable constraints.
