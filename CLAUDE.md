# The Index — Claude notes

Comic character/team reference library. **Next.js 15 · React 19 · TypeScript (strict) · Tailwind v4 · TanStack Query · Fuse.js.** Dual data backend: bundled **local seed** (default, `lib/data/seed/content.json`) or **Supabase** (optional, env-gated). No Supabase project is connected — `content.json` is the live datastore.

## Read order at the start of a session
1. `CURRENT_SESSION.md` — where things stand right now, and the next task.
2. `CHANGELOG.md` — what shipped, was removed, or is still open (newest entry first).
3. `docs/ROADMAP.md` — the phased map of the whole project.

Only then open code. `docs/sessions/` holds the full dated write-up of each past session if you need detail.

## Run it (needs Node 20 — system default 18.13 is too old)
```bash
export PATH="/c/Users/chris/AppData/Local/nvm/v20.20.2:$PATH"
npm run dev          # → http://localhost:3000
```
The dev server does not survive across sessions — restart each time. `npm run build` is the definitive check. Always prefix shell commands with the Node 20 PATH export above, or `next`/`build`/`tsx` will fail or pick the wrong Node.

## Build rules
- TypeScript strict, **no `any`**.
- `content.json` is **generated — never hand-edit.** Change `lib/data/seed/generated/*.json` (or run the ingest pipeline), then `npm run seed:assemble`. Regenerate SQL with `npm run seed:sql`.
- Content grows by **data, not code** — new entities come through the ingest pipeline, not new components.
- Design accent `#E8C840` (ink yellow) is used in exactly three places: era-timeline highlights, active nav, selected-name underlines. Nowhere else.

## Research → ingest pipeline (the active content workflow)
User researches a character → gets a `{ primary, supporting }` JSON bundle → drops it in `lib/data/seed/incoming/` → ingest.
- `npm run seed:validate` — read-only report (schema, enums, counts, cross-refs).
- `npm run seed:ingest` — standardize → validate → write `generated/<slug>.json` → archive raw → assemble `content.json` → regenerate `seed.sql`.
- Skill: `.claude/skills/seed-ingest/SKILL.md`. Shared logic + slug aliases live in `scripts/seed-lib.ts`.

## Session wrap-up (run only when I confirm the session is done)
When I confirm implementation is good and the session is complete, before pushing:
1. Capture screenshots of the working state into `portfolio/screenshots/YYYY-MM-DD-<label>/`. One shot per meaningful screen or state.
2. Write a `CHANGELOG.md` entry (dated): **Completed**, **Removed**, **Issues/Open**.
3. Update `docs/ROADMAP.md` from this session's commits: check off done items, add newly discovered work as tasks. **Never expand scope silently.**
4. Update `CURRENT_SESSION.md`, append a line to `docs/SESSION_LOG.md`, and write the dated `docs/sessions/YYYY-MM-DD-<label>.md` file.
5. Show me the generated changelog, roadmap diff, and screenshots. **Wait for my approval before pushing.**

Never run the wrap-up mid-session. Never push without my explicit approval.
