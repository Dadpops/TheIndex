# Current session — The Index

**Status:** ✅ App functional — 181 entities (167 characters, 14 teams), builds clean (~192 pages). Delivery pipeline scaffold set up this session.

**Last session:** 2026-07-04 — Delivery pipeline scaffold → [docs/sessions/2026-07-04-delivery-pipeline-scaffold.md](docs/sessions/2026-07-04-delivery-pipeline-scaffold.md)

**Next task:** Ingest the next batch of researched character bundles — drop `{ primary, supporting }` JSON into `lib/data/seed/incoming/` and run `npm run seed:ingest`.

## Blockers / notes
- Needs **Node 20** to run (see [CLAUDE.md](CLAUDE.md) for the PATH export).
- No Supabase project connected — `content.json` is the live datastore.
- Undecided: a few villain orgs (cults/orders/leagues) are typed `entity_type: team`, so they appear in Teams sections with empty rosters. Reclassify as characters?

---
_This is a live pointer, not a log. Full history: [CHANGELOG.md](CHANGELOG.md) · [docs/ROADMAP.md](docs/ROADMAP.md) · [docs/SESSION_LOG.md](docs/SESSION_LOG.md)._
