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

---

## The completion plan (decided 2026-07-18)

**End goal:** personal reference tool covering every *recurring* character (>6 issue appearances) at DC, Marvel, Image, BOOM! — est. 2,000–5,000 entities. **Per-character definition of done:** 2–4 flagged "start here" arcs + full arc history grouped by era (arc-level, not issue-level — issue ranges nest under arcs).

### Phase A — Density proof (schema/UI mostly exist already) ✅
- [x] Verify schema gaps for the arc timeline — none needed; eras→arcs→reading entries + start_here already in `schema.ts` (start_here caps at 3 entries by design)
- [x] Deepen Batman to full arc history — 8 eras, 87 arcs, agent-authored, ISBNs null unless verified
- [x] Verify `TimelineTab` + `EraAccordion` UI at that density — holds up; collapsible eras stay navigable, no tuning needed
- [x] Villain-org classification decided: **keep as teams** — empty rosters (Lizard League, The Disciples) are data gaps to fill via ingest, not type errors

### Phase B — Comic Vine bulk pipeline 🔜
- [ ] Register Comic Vine API key (user)
- [ ] `seed:comicvine` scripts: characters filtered by `count_of_issue_appearances > 6` + publisher; story arcs with issue ranges
- [ ] Map API results into the existing generated-JSON format (keep `seed:assemble` as source of truth)
- [ ] Rate-limit-aware resumable batch sync (~200 req/hr)
- [ ] Measure `content.json` size at scale; trigger Phase 4 (Supabase) if it strains

### Phase C — Curation layer 🔜
- [ ] Agent workflows: character summaries + entry-point picks/justifications for the long tail
- [ ] Spot-check workflow for curated output

## Backlog / out of scope (for now)
- [ ] Manga support
- [ ] User accounts / reading progress
- [ ] Character comparison
- [ ] Mobile app
- [ ] Public read API
