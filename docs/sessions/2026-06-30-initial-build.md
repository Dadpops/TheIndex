# Session — 2026-06-30 — Initial build + first content/UX session

_Backfilled from the prior `SESSION.md` handoff when the delivery pipeline was set up (2026-07-04)._

## What this is
Comic character/team reference library. **Next.js 15.5.19 · React 19 · TS (strict) · Tailwind v4 · TanStack Query · Fuse.js.** Dual data backend: bundled **local seed** (default, `content.json`) or **Supabase** (optional, env-gated). No Supabase project connected — `content.json` is the live datastore; `supabase/seed.sql` is kept current for whenever one is.

## State at end of session
- **181 entities** (167 characters, 14 teams), zero dangling refs, builds clean (~192 pages). `seed.sql` = 2195 rows.
- App functional: home, publisher pages (with role filter), entity pages (6 tabs), search, admin (read-only without Supabase).
- Publishers DC, Marvel, Image, BOOM! — all populated.

## What was built
- **Got it running**: installed nvm-windows + Node 20.20.2; fixed the Tailwind v4 oxide native binding (clean reinstall under Node 20).
- **`role` field** (`hero|villain|antihero|neutral`) on entities + migration `0002` → powers publisher-page **filter pills** (`useEntityFilter`) + sort + "Showing X of Y" count. Teams section hidden when a publisher has 0 teams.
- **Media tab**: numbering bug fixed (positional 1, 2, 3 — not raw `watch_order`).
- **Logos**: `TheIndexLogo` wordmark (nav + home hero). Publisher logos in `public/publishers/*.svg`, shown via white-chip `PublisherLogo`.
- **Images**: `EntityImage` with generated CSS cover-art fallback (publisher-tinted duotone + halftone + initials). No real character art (copyright) — `cover_image_url` stays null; drop a URL in to override.
- **EntityCard redesign**: accent-gradient hero + name watermark + name label + 3-line bio. Per-publisher accents keyed by slug (DC `#0078f0`, Marvel `#ec1d24`, Image `#5fad56`, BOOM `#f26522`). No cover image or team glyph in this design (intentional).
- **Seeded Image + BOOM! rosters** via subagents (Spawn, Invincible, Buffy, Erica Slaughter, Power Rangers, etc.).
- **Research → ingest pipeline** (the big one — see below).

## Ingest pipeline (the active workflow)
User researches a character → gets a `{ primary, supporting }` JSON bundle → drops it in `lib/data/seed/incoming/` → ingest.
- `npm run seed:validate` — read-only report (schema, enums, counts, cross-refs).
- `npm run seed:ingest` — standardize (canonical slugs via `SLUG_ALIASES`, null images, trim) → validate → write `generated/<slug>.json` → archive raw to `incoming/_processed/` → assemble `content.json` → regenerate `seed.sql`. Bad files stay in `incoming/` with errors reported.
- Skill: `.claude/skills/seed-ingest/SKILL.md`. Shared logic: `scripts/seed-lib.ts` (add slug variants to `SLUG_ALIASES`).
- Existing-slug files **replace** (not add) — ingest reports "added" vs "replaced". Last run promoted **Batman** as a replacement (richer 5-era version; `ras-al-ghul` auto-normalized to `ra-s-al-ghul`).

## Pending / next
- **Primary ongoing task**: user is uploading more researched character bundles to ingest (just run the pipeline above).
- **Optional**: add `seed:push` to push `seed.sql` straight to Supabase once a project + service key exist.
- **Undecided**: a few villain orgs (cults/orders/leagues, e.g. "The Order of St. George") are typed `entity_type: team` → they appear in Teams sections with empty rosters. Reclassify as characters?

## Gotchas
- Always prefix shell commands with the Node 20 PATH export (else `next`/`build`/`tsx` fail or use the wrong Node).
- `content.json` is generated — never hand-edit; change `generated/*.json` (or ingest) then `npm run seed:assemble`.
