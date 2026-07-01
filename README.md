# The Index

A comprehensive comic book character and team library — a one-stop reference for getting into
comics, returning after time away, or exploring a specific era. Find any character or team,
understand their full history across eras and story arcs, and know exactly how to read, watch, or
listen to every connected piece of media.

> **Every character. Every era. Every arc.**

---

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router, RSC) |
| Language | TypeScript (strict, no `any`) |
| Styling | Tailwind CSS v4 (CSS-first `@theme`) |
| Database | Supabase (Postgres) — **optional**, see below |
| Data fetching | TanStack Query v5 |
| Search | Fuse.js (client-side fuzzy search) |
| Icons | Lucide React |

---

## ⚠️ Prerequisites — Node.js 20+

This stack **requires Node.js ≥ 18.18 (Node 20 LTS recommended)**. Next.js 15, Tailwind v4's native
`oxide` engine, and `@supabase/storage-js` all refuse older runtimes.

> The machine this was built on runs **Node 18.13.0**, which is too old to run `next dev`/`next build`.
> The full codebase type-checks cleanly (`npm run typecheck`) and the data pipeline is verified, but
> you must upgrade Node before the app will start.

```bash
# with nvm (an .nvmrc pinning 20 is included)
nvm install 20 && nvm use 20
node -v   # should print v20.x
```

---

## Quick start (zero config — runs on the bundled seed)

The app ships with a complete local seed dataset (81 entities — characters, teams, and their
supporting casts). **No database or accounts are needed to run it.**

```bash
npm install
npm run dev
# open http://localhost:3000
```

The footer shows a **“Local seed”** indicator when running without Supabase.

---

## Switching to Supabase

The data layer (`lib/data/repository.ts`) automatically switches to Supabase the moment
`NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` are present.

1. **Create a project** at [supabase.com](https://supabase.com).
2. **Add env vars** — copy `.env.example` to `.env.local` and fill in:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   SUPABASE_SERVICE_ROLE_KEY=...        # server-only; for scripts/admin
   ```
3. **Run the schema** — paste `supabase/migrations/0001_init.sql` into the Supabase SQL editor.
   It creates every table (UUID PKs, FKs, indexes) and Row-Level Security (public read,
   authenticated write).
4. **Load the seed** — paste `supabase/seed.sql` (1,170 rows, generated from the same data the
   offline app uses, with identical UUIDs).
5. *(optional)* **Regenerate DB types** for end-to-end type safety:
   ```bash
   npx supabase gen types typescript --project-id <id> > lib/supabase/types.ts
   ```
6. **Create the admin user** — in Supabase → Authentication → Users → “Add user” (email/password).
   Then sign in at `/admin/login`.

> Images: real cover/logo art goes in **Supabase Storage** (public bucket). Until an entity has a
> `cover_image_url`, the UI renders an on-brand, publisher-tinted placeholder. `next.config.ts`
> auto-allows your Supabase Storage hostname for `next/image`.

---

## Content administration (`/admin`)

A lightweight CMS so content scales without code changes. Protected by Supabase Auth.

- `/admin` — dashboard: entity counts per publisher + a full entity table
- `/admin/entities/new` — create a character or team
- `/admin/entities/[id]` — edit an entity
- `/admin/entities/[id]/eras` — manage eras and arcs
- `/admin/entities/[id]/media` — manage media entries
- `/admin/entities/[id]/relationships` — manage allies / enemies / members

When Supabase isn’t configured the dashboard is read-only (it shows the local seed) and editing is
disabled with a clear notice.

---

## Scripts

```bash
npm run dev          # start the dev server (needs Node 20+)
npm run build        # production build
npm run typecheck    # tsc --noEmit  (works on Node 18.13 too)
npm run seed:assemble  # rebuild lib/data/seed/content.json from lib/data/seed/generated/*.json
npm run seed:sql       # regenerate supabase/seed.sql from the seed content
```

---

## How the data layer works

```
lib/data/seed/generated/*.json   ← authored per-entity content
        │  npm run seed:assemble
        ▼
lib/data/seed/content.json       ← deduped, reference-validated authoring data
        │  lib/data/seed/build.ts  (deterministic UUIDs via lib/data/ids.ts)
        ├────────────────────────────────────────────┐
        ▼                                             ▼
lib/data/local.ts  (in-memory backend)        npm run seed:sql → supabase/seed.sql
        │                                             │
        └──────────► lib/data/repository.ts ◄─────────┘ (lib/data/supabase-repo.ts)
                     (picks backend by env)
                              │
            RSC pages ────────┤
            app/api/* ────────┘──► TanStack Query hooks (hooks/*.ts) ──► client tabs
```

Because both backends are driven by the same deterministic build, the offline app and a real
Supabase database hold byte-for-byte identical records.

---

## Project structure

```
app/                     routes (home, [publisher], character/team, search, admin, api)
components/ui/           design-system primitives (badges, cards, toggles, states)
components/library/      home + publisher grids and search
components/entity/       hero, tabs, era accordion, arc card, spoiler toggle, …
components/search/       global search + result rows
components/admin/        admin shell, entity form, era/media/relationship managers
hooks/                   TanStack Query hooks + search/debounce
lib/data/                repository, local + supabase backends, seed build pipeline
lib/supabase/            browser/server clients, middleware session, config, types
lib/search/              Fuse.js config
lib/ui/                  labels, sort, placeholder, classnames helpers
types/                   shared TypeScript types matching the DB schema
supabase/                migrations + generated seed.sql
scripts/                 seed assembler + SQL generator (run via tsx)
```

---

## Design

Dark, editorial, cinematic — comic long box meets digital archive. Near-black surfaces, deep ink
navy borders, condensed display type (Bebas Neue), Inter body, JetBrains Mono for numbers/dates.

The signature **ink-yellow accent (`#E8C840`)** is used in exactly three disciplined ways:
era-timeline highlights, active navigation indicators, and selected-name underlines. Everything
else is handled with surface elevation and border contrast.

---

## What’s seeded

- **4 publishers** — DC, Marvel, Image, BOOM! (Image/BOOM are entry points for future content)
- **10 primary characters** — Batman, Superman, Wonder Woman, The Flash, Green Lantern (DC);
  Spider-Man, Iron Man, Captain America, Thor, Wolverine (Marvel)
- **4 teams** — Justice League, Teen Titans, X-Men, Avengers
- **Supporting cast** — each hero’s rogues gallery and each team’s roster are seeded as real,
  navigable entities (81 entities total), so Allies/Enemies/Members tabs link to full pages
- 119 eras · 190 arcs · 221 reading entries · 186 relationships · 255 media entries

---

## Out of scope (roadmap)

Manga support, user accounts / reading progress, community data, character comparison, a mobile app,
and a public read API. See `the-index-claude-code.md` for the full original brief.
