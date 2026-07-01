---
name: seed-ingest
description: Ingest researched comic-entity JSON bundles into The Index's dataset. Use when the user has dropped (or says they dropped) research files into the seed validation/incoming folder and wants them processed, standardized, validated, and loaded — e.g. "ingest the new characters", "process the validation folder", "pick up the fresh research files", "load the dropped bundles", "I added more characters".
---

# Seed ingest pipeline

Standardizes and loads researched entity bundles from `lib/data/seed/incoming/` into the live dataset.

## Important environment note
All commands must run under **Node 20** (the system default 18.13 is too old). Prefix shell commands with:
```
export PATH="/c/Users/chris/AppData/Local/nvm/v20.20.2:$PATH"
```

## Procedure

1. **Look first.** `ls lib/data/seed/incoming/*.json` to see the fresh files. Optionally `npm run seed:validate` for a read-only report before touching anything.

2. **Flag replacements.** If `seed:validate` reports any incoming slug "already exists in the live library", that file will **replace** an existing entity (not add a new one). Surface this to the user and confirm intent before ingesting — a replacement can change an entity's relationship graph.

3. **Ingest.** Run:
   ```
   npm run seed:ingest
   ```
   This runs three steps in sequence:
   - `ingest-seed.ts` — for each fresh file: standardize (canonical slugs incl. `SLUG_ALIASES`, null images, trimmed text) → validate → if clean, write `generated/<slug>.json` and move the raw file to `incoming/_processed/`. Files with errors are **left in `incoming/`** and reported.
   - `assemble-seed.ts` — compacts all `generated/*.json` into `content.json` (the live local dataset), de-duping by slug and validating cross-references (must report `dangling refs rel:0 member:0 arc:0`).
   - `generate-seed-sql.ts` — regenerates `supabase/seed.sql`.

4. **Read the output.** Report to the user: which files were ingested (added vs replaced), and any files left in `incoming/` to fix (with the specific errors). Do NOT hand-fix the researcher's content — report the errors so they can re-research; only mechanical issues already covered by normalization are auto-fixed.

5. **Verify.** Rebuild and spot-check the new entity page(s):
   - If the dev server is running, it hot-reloads `content.json`; just `curl` the new page (e.g. `http://localhost:3000/character/<slug>`) for HTTP 200 + expected content.
   - For a definitive check, stop the dev server, `npm run build`, restart, and confirm the page renders.

6. **Report.** Tell the user the final counts (entities added/replaced, total entities) and that the raw files are archived in `incoming/_processed/` (safe to delete anytime). The `incoming/` folder now holds only files that still need fixing.

## Slug consistency
If a researcher used a variant slug for an entity the library already has (e.g. `ras-al-ghul` vs `ra-s-al-ghul`), add the mapping to `SLUG_ALIASES` in `scripts/seed-lib.ts` so future batches normalize automatically.

## Supabase (the "db")
There is no Supabase project connected yet, so **`content.json` is the live datastore** for the running app. When Supabase is configured, push by running `supabase/migrations/*.sql` then `supabase/seed.sql` in the Supabase SQL editor (or via the Supabase CLI). The ingest already keeps `seed.sql` current.
