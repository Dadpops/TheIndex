# Seed intake — drop researched entity files here

Drop one JSON file per character/team you've researched into this folder, then ask me to review (or run `npm run seed:validate`).

## File format
- **One file per primary entity**, named `<slug>.json` (e.g. `nightwing.json`).
- Each file contains the full bundle the research prompt produces:
  ```json
  { "primary": { ...full entity... }, "supporting": [ { ...ally/enemy/member... } ] }
  ```
  (A bare entity object without the `{ primary, supporting }` wrapper is also accepted — it's treated as the primary with no supporting cast.)

## Workflow
1. Drop files here.
2. `npm run seed:validate` — checks schema, enum values, required fields, minimum counts, slug format/uniqueness, and that every `related_slug` / `character_slug` / `arc_slug` resolves (within the batch, this folder, or the already-seeded library). Reports errors (must-fix) and warnings (below recommended minimums).
3. Fix anything flagged.
4. When clean: `npm run seed:promote` (copies these files into `../generated/`), then `npm run seed:assemble` and `npm run seed:sql`.

Files in this folder are NOT part of the live app until promoted to `../generated/`.
