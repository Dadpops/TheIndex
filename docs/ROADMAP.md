# Roadmap — The Index

The map. Phased checklists, updated from each session's commits at wrap-up. This is the single place to see project state at a glance.

**Legend:** `[x]` done · `[ ]` open · `[~]` in progress

---

## Phase 0 — Foundation ✅
- [x] Next.js 15 App Router + React 19 + TS strict + Tailwind v4 scaffold
- [x] Data layer with dual backend (local seed / Supabase) and deterministic UUIDs
- [x] Schema + migrations + generated `seed.sql`
- [x] Design system primitives (dark editorial theme, disciplined ink-yellow accent)

## Phase 1 — Core library ✅
- [x] Home, publisher pages, entity pages (6 tabs), global fuzzy search
- [x] Read-only admin (becomes a functional CMS when Supabase is connected)
- [x] `role` field + publisher filter pills + sort + "Showing X of Y" count
- [x] Logos (wordmark + publisher) and `EntityImage` generated fallback art
- [x] `EntityCard` redesign
- [x] 181 entities across DC, Marvel, Image, BOOM! — zero dangling refs

## Phase 2 — Research → ingest pipeline ✅
- [x] `seed:validate` read-only report
- [x] `seed:ingest` standardize → validate → assemble → SQL
- [x] `seed-ingest` skill + slug aliases in `scripts/seed-lib.ts`
- [~] **Ongoing:** ingest incoming researched character bundles (active task)

## Phase 3 — Delivery pipeline (dadpopsdev) 🚧
- [x] File structure + wrap-up gate implemented (this project is the pilot)
- [ ] Prove across 2–3 real sessions (a changelog you'd show, screenshots landing right, a roadmap matching reality)
- [ ] Template the structure + CLAUDE.md wrap-up block for new projects
- [ ] Retrofit onto RIFT PROTOCOL, Storyframe Studio, Cobbies

## Phase 4 — Supabase go-live 🔜
- [ ] Connect a Supabase project + service key
- [ ] Add `seed:push` to push `seed.sql` straight to Supabase
- [ ] Create the admin user; verify the write-enabled admin

## Backlog / out of scope (for now)
- [ ] Decide: reclassify villain orgs (cults/orders/leagues) from `team` → character
- [ ] Manga support
- [ ] User accounts / reading progress
- [ ] Character comparison
- [ ] Mobile app
- [ ] Public read API
