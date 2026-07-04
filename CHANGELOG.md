# Changelog — The Index

Dated entries, newest first. Each entry has three sections: **Completed**, **Removed**, **Issues / Open**. Written at session wrap-up from the session's actual work.

---

## 2026-07-04 — Delivery pipeline scaffold

### Completed
- Implemented the dadpopsdev **Delivery Pipeline** file structure on The Index (the pilot): created `docs/sessions/`, `portfolio/screenshots/`, `portfolio/demo/`; populated `docs/ROADMAP.md`, `docs/SESSION_LOG.md`, `portfolio/STORY.md`, `CHANGELOG.md`, `CURRENT_SESSION.md`, and a real `CLAUDE.md`.
- Added the **session wrap-up gate** to `CLAUDE.md` so changelog / roadmap / screenshots generate as a byproduct of building, at a single triggered step before push.
- Backfilled changelog, roadmap, and session log from existing project state (README + prior handoff).

### Removed
- Retired the standalone `SESSION.md` handoff — its content moved into `CURRENT_SESSION.md` + `docs/sessions/2026-06-30-initial-build.md`; `SESSION.md` is now a redirect stub.
- Replaced the Desktop-reorg placeholder files ("fill in as needed") with real content.

### Issues / Open
- No screenshots this session — docs-only change, nothing new to shoot.
- Pipeline still needs to be proven across 2–3 real sessions before templating onto other projects.

---

## 2026-06-30 — Initial build + first content/UX session

### Completed
- Full **Next.js 15 / React 19 / TS-strict / Tailwind v4** app: home, publisher pages, entity pages (6 tabs), global fuzzy search, read-only admin.
- Dual data backend (local seed default / Supabase env-gated) with deterministic UUIDs — the offline app and a real DB hold byte-for-byte identical records.
- **181 entities** (167 characters, 14 teams) across DC, Marvel, Image, BOOM! — zero dangling refs, ~192 pages build clean; `seed.sql` = 2195 rows.
- `role` field (`hero|villain|antihero|neutral`) → publisher-page **filter pills**, sort, and "Showing X of Y" count. Teams section hidden when a publisher has none.
- **Logos & imagery**: `TheIndexLogo` wordmark, publisher logos, `EntityImage` with a generated publisher-tinted duotone + halftone + initials fallback (no copyrighted art). `EntityCard` redesign (accent-gradient hero + name watermark + 3-line bio).
- **Research → ingest pipeline**: `seed:validate` / `seed:ingest` with canonical slug aliases, cross-ref validation, raw-bundle archiving, and the `seed-ingest` skill.
- Seeded Image + BOOM! rosters via subagents.

### Removed
- Media-tab numbering bug fixed (positional 1, 2, 3 instead of raw `watch_order`).

### Issues / Open
- Requires Node 20; the build machine's default Node 18.13 is too old to run `next dev`/`next build`.
- A few villain orgs typed `entity_type: team` appear in Teams sections with empty rosters — reclassification undecided.
- No real character cover art (copyright) — `cover_image_url` stays null and placeholders render until a URL is supplied.
