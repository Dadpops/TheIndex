# The Index — Story

_The narrative version, for presenting. Distilled from the changelog when it's time to show the project._

> **Every character. Every era. Every arc.**

## What it is
The Index is a comic book character and team reference library — a one-stop guide for getting into comics, returning after time away, or exploring a specific era. Find any character or team, understand their full history across eras and story arcs, and know exactly how to read, watch, or listen to every connected piece of media. Dark, editorial, cinematic: comic long box meets digital archive, with a single disciplined ink-yellow accent.

## How it evolved

**The foundation.** Built on Next.js 15 (App Router, React 19), TypeScript strict, and Tailwind v4, with a design system tuned for a serious collector's reference tool rather than generic dark-mode SaaS. A dual data backend — a bundled local seed by default, Supabase the moment env vars appear — means the offline app and a real database hold byte-for-byte identical records, driven by the same deterministic build.

**The library.** Home, publisher pages, and six-tab entity pages, tied together with global fuzzy search and a read-only admin that becomes a full CMS once Supabase is connected. A `role` field turned publisher pages into filterable views (heroes / villains / antiheroes). Custom wordmark and publisher logos, plus generated publisher-tinted placeholder art that keeps every card on-brand without touching copyrighted images. 181 entities across DC, Marvel, Image, and BOOM! — zero dangling references.

**The content engine.** The real unlock: a research → ingest pipeline. A researched `{ primary, supporting }` character bundle is dropped into an incoming folder and a single command validates it, standardizes slugs, assembles the dataset, and regenerates the SQL — so the library grows by adding data, never by touching code.

**The delivery pipeline.** The Index became the pilot for a repeatable build-to-portfolio pipeline: changelog, roadmap, and portfolio capture generate as a byproduct of building at one wrap-up step, so the project is always presentation-ready without a separate step to remember.

## Assets
- Screenshots: `portfolio/screenshots/`
- Demos / recordings: `portfolio/demo/`
