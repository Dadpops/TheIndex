# The Index — Session Handoff

_Last updated end of session. Read this first; it's the fast catch-up._

## What this is
Comic character/team reference library. **Next.js 15.5.19 · React 19 · TS (strict) · Tailwind v4 · TanStack Query · Fuse.js**. Dual data backend: bundled **local seed (default, `content.json`)** or **Supabase (optional, env-gated)**. No Supabase project is connected — **`content.json` is the live datastore**; `supabase/seed.sql` is kept current for whenever one is.

## ▶ Run it (must use Node 20 — system default 18.13 is too old)
```
export PATH="/c/Users/chris/AppData/Local/nvm/v20.20.2:$PATH"
npm run dev          # → http://localhost:3000
```
Dev server does NOT survive across sessions — restart each time. `npm run build` for the definitive check.

## Current state
- **181 entities** (167 characters, 14 teams), zero dangling refs, builds clean (~192 pages). `seed.sql` = 2195 rows.
- App is functional: home, publisher pages (with role filter), entity pages (6 tabs), search, admin (read-only w/o Supabase).
- Publishers: DC, Marvel, Image, BOOM! — all populated.

## What we built this session
- **Got it running**: installed nvm-windows + Node 20.20.2; fixed Tailwind v4 oxide native binding (clean reinstall under Node 20).
- **`role` field** (`hero|villain|antihero|neutral`) on entities + migration `0002` → powers publisher-page **filter pills** (`useEntityFilter`) + sort + "Showing X of Y" count. **Teams section hidden when a publisher has 0 teams.**
- **Media tab**: numbering bug fixed (positional 1,2,3, not raw `watch_order`).
- **Logos**: `TheIndexLogo` wordmark (nav + home hero). Publisher logos in `public/publishers/*.svg` (official DC/Marvel/Image, original BOOM!), shown via white-chip `PublisherLogo` on home/publisher/hero.
- **Images**: `EntityImage` with generated CSS cover-art fallback (publisher-tinted duotone + halftone + initials). No real character art (copyright) — `cover_image_url` stays null; drop a URL in to override.
- **EntityCard redesign** (current): accent-gradient hero + name watermark + name label + 3-line bio. Per-publisher accents keyed by slug (DC `#0078f0`, Marvel `#ec1d24`, Image `#5fad56`, BOOM `#f26522`). Note: this design has **no cover image and no team glyph** (user aware).
- **Seeded Image + BOOM! rosters** via 12 subagents (Spawn, Invincible, Buffy, Erica Slaughter, Power Rangers, etc.).
- **Research → ingest pipeline** (the big one — see below).

## 🔧 Ingest pipeline (the active workflow)
User researches a character via their own skill → gets a `{ primary, supporting }` JSON bundle → drops it in `lib/data/seed/incoming/` → ingest.
- `npm run seed:validate` — read-only report (schema, enums, counts, cross-refs).
- `npm run seed:ingest` — standardize (canonical slugs via `SLUG_ALIASES`, null images, trim) → validate → write `generated/<slug>.json` → archive raw to `incoming/_processed/` → assemble `content.json` → regenerate `seed.sql`. Bad files stay in `incoming/` with errors reported.
- Skill: `.claude/skills/seed-ingest/SKILL.md` (triggers on "ingest the new characters", "I added more characters", etc.).
- Shared logic: `scripts/seed-lib.ts`. Add slug variants to `SLUG_ALIASES` there.
- Existing-slug files **replace** (not add) — ingest reports "added" vs "replaced".
- Last run: promoted **Batman** as a replacement (richer 5-era version; `ras-al-ghul` auto-normalized to `ra-s-al-ghul`).

## Pending / next
- **Primary ongoing task**: user is uploading more researched character bundles to ingest (just run the pipeline above).
- **Optional**: add `seed:push` to push `seed.sql` straight to Supabase once a project + service key exist.
- **Minor, undecided**: a few villain orgs (cults/orders/leagues, e.g. "The Order of St. George") are typed `entity_type: team` → they appear in Teams sections with empty rosters. Offered to reclassify as characters; user hasn't decided.

## Gotchas
- Always prefix shell cmds with the Node 20 PATH export above (else next/build/tsx fail or use wrong Node).
- The Bash tool on Windows mangles `\n` in `curl -w` format strings — cosmetic only.
- `content.json` is generated — never hand-edit; change `generated/*.json` (or ingest) then `npm run seed:assemble`.
