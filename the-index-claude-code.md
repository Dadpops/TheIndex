# The Index — Claude Code Build Prompt

## Project Overview

Build **The Index** — a comprehensive comic book character and team library. The goal is a one-stop reference for anyone trying to get into comics, return after time away, or explore a specific era or character. Users should be able to find any character or team, understand their full history across eras and story arcs, and know exactly how to read, watch, or listen to every piece of media connected to them.

The app must be fast, scalable to thousands of characters and teams, and easy to expand by adding new entries without touching code.

---

## Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Framework | Next.js 15 (App Router) | Fast navigation, SSG for character pages, SEO |
| Language | TypeScript | Required throughout — no `any` types |
| Styling | Tailwind CSS v4 | Utility-first, fast iteration |
| Database | Supabase (Postgres) | Scalable, easy to populate via dashboard or scripts, real-time capable |
| Data fetching | TanStack Query v5 | Client-side caching, snappy transitions, background refetch |
| Search | Fuse.js | Client-side fuzzy search for character/team names |
| Icons | Lucide React | Consistent, lightweight |

---

## Design Direction

**Aesthetic:** Dark, editorial, cinematic. Think comic long box meets digital archive. Near-black backgrounds (`#0D0D0F`), deep ink navy accents, sharp typography. Not generic "dark mode SaaS" — this should feel like a serious collector's reference tool.

**Typography:**
- Display: `Bebas Neue` (headings, publisher labels, era titles) — tall, condensed, comic-adjacent without being costume-y
- Body: `Inter` (descriptions, metadata, UI labels)
- Mono: `JetBrains Mono` (issue numbers, dates, edition codes)

**Color tokens:**
```css
--color-bg:            #0D0D0F;
--color-surface:       #16161A;
--color-surface-alt:   #1E1E24;
--color-border:        #2A2A35;
--color-accent:        #E8C840;   /* ink yellow — the signature element */
--color-accent-muted:  #A08C20;
--color-text-primary:  #F0F0F0;
--color-text-secondary:#9090A0;
--color-dc:            #0476D0;
--color-marvel:        #E62429;
--color-image:         #1DB954;
--color-boom:          #FF6B35;
```

**Signature element:** The accent yellow (`#E8C840`) is used exactly one way per screen — era timeline strip highlights, active nav indicators, and selected character name underlines. Nowhere else. Everything else is handled with surface elevation and border contrast.

**Motion:** Minimal. Tab switches and accordion opens use 150ms ease-out. No scroll-triggered animations. No ambient motion. Fast and focused.

---

## Database Schema

Build all tables in Supabase with the following structure. Use UUIDs as primary keys throughout.

### `publishers`
```sql
id          uuid primary key
slug        text unique not null        -- 'dc', 'marvel', 'image', 'boom'
name        text not null               -- 'DC Comics', 'Marvel Comics'
color_hex   text                        -- matches design tokens above
logo_url    text
created_at  timestamptz default now()
```

### `entities`
Single table for both characters and teams. `entity_type` differentiates them.

```sql
id              uuid primary key
slug            text unique not null    -- 'batman', 'teen-titans'
name            text not null
entity_type     text not null           -- 'character' | 'team'
publisher_id    uuid references publishers(id)
real_name       text                    -- null for teams
first_appearance text                   -- 'Detective Comics #27 (1939)'
logo_url        text                    -- character symbol / team logo
cover_image_url text                    -- hero image for the page
short_bio       text                    -- 2-3 sentence summary
created_at      timestamptz default now()
```

### `eras`
```sql
id          uuid primary key
entity_id   uuid references entities(id) on delete cascade
slug        text not null               -- 'golden-age', 'knightfall', 'new-52'
title       text not null               -- 'The Knightfall Saga'
start_year  int
end_year    int                         -- null if ongoing
order_index int not null                -- controls display order
summary     text
created_at  timestamptz default now()
```

### `arcs`
```sql
id              uuid primary key
era_id          uuid references eras(id) on delete cascade
slug            text not null
title           text not null
logline         text not null           -- spoiler-free 1-sentence hook
summary         text not null           -- 2-4 paragraph full summary
spoiler         text                    -- story-changing moments only (deaths, identity reveals)
arc_type        text not null           -- enum below
start_year      int
end_year        int
order_index     int not null
created_at      timestamptz default now()
```

**arc_type enum:** `'origin' | 'flagship' | 'crossover' | 'elseworlds' | 'annual' | 'miniseries' | 'tie-in' | 'retcon'`

### `reading_entries`
Each arc's individual reading items (issues, trades, omnibuses).

```sql
id              uuid primary key
arc_id          uuid references arcs(id) on delete cascade
title           text not null           -- 'Batman: Knightfall Vol. 1 (Trade)'
format          text not null           -- 'trade' | 'omnibus' | 'single_issues' | 'digital' | 'hardcover'
issue_range     text                    -- '#492-500' or null
reading_order   int not null
publication_order int not null
reading_order_note text                 -- explains divergence from pub order if any
isbn            text
purchase_url    text                    -- Amazon, Comixology, etc.
created_at      timestamptz default now()
```

### `start_here`
Exactly 3 curated entry points per entity.

```sql
id          uuid primary key
entity_id   uuid references entities(id) on delete cascade
arc_id      uuid references arcs(id)
order_index int not null                -- 1, 2, or 3 only
label       text not null               -- 'Absolute Beginner', 'Classic Fan', 'Modern Era'
reason      text not null               -- why this is the right entry point
```

### `relationships`
Allies and enemies between entities.

```sql
id              uuid primary key
entity_id       uuid references entities(id) on delete cascade
related_id      uuid references entities(id)
relationship    text not null           -- 'ally' | 'enemy' | 'member' | 'rival'
summary         text not null           -- relationship overview
notes           text not null           -- specific story context
```

### `media_entries`
All non-comics media per entity.

```sql
id              uuid primary key
entity_id       uuid references entities(id) on delete cascade
media_type      text not null           -- 'animated_series' | 'live_action' | 'film' | 'video_game' | 'podcast' | 'audio_drama'
title           text not null
release_year    int
watch_order     int                     -- for series with a canonical order
platform        text                    -- 'HBO Max', 'Disney+', 'Netflix', etc.
notes           text
where_to_watch  text                    -- URL or platform name
```

### `team_members`
Tracks which characters belong to which teams and across which eras.

```sql
id          uuid primary key
team_id     uuid references entities(id)
character_id uuid references entities(id)
era_id      uuid references eras(id)   -- null = all eras
role        text                        -- 'founder', 'leader', 'member', 'honorary'
notes       text
```

---

## Application Routes

```
/                           → Library home (publisher grid)
/[publisher-slug]           → Publisher page (character + team grid)
/character/[slug]           → Character page (6 tabs + media)
/team/[slug]                → Team page (same structure as character)
/search                     → Global search across all entities
```

---

## Page Specifications

### `/` — Library Home

- Full-bleed hero with the app name and tagline: *"Every character. Every era. Every arc."*
- Publisher cards in a grid: DC, Marvel, Image, Boom! Each shows publisher logo, color accent, and character count
- Search bar centered, prominent — fuzzy search fires on input with 150ms debounce
- No pagination on the home page — just the four publisher entry points and search

### `/[publisher-slug]` — Publisher Page

- Publisher name + logo header with that publisher's accent color
- Toggle between **Characters** and **Teams** (default: Characters)
- Card grid — each card shows: cover image, name, short_bio truncated to 2 lines, first appearance
- Filter bar: sort by name A–Z, first appearance year, recently added
- Client-side search scoped to this publisher using Fuse.js
- Card count shown: "142 Characters · 18 Teams"

### `/character/[slug]` and `/team/[slug]` — Entity Page

Both use the same tab layout. Six tabs:

**Tab 1: Summary**
- Hero image, character/team logo, publisher badge, first appearance
- Short bio (2-3 sentences)
- "Start Here" reading guide — exactly 3 cards with label, arc title, and reason
- Real name (characters only) / founding members roster (teams only)

**Tab 2: Timeline**
- Era strips displayed chronologically using `order_index`
- Each era is an expandable accordion showing its arcs
- Each arc card shows: title, arc_type badge, logline, year range
- Expanding an arc reveals: full summary, spoiler toggle (hidden by default), reading entries
- Spoiler toggle shows/hides the `spoiler` field content only
- Reading entries grouped by format (omnibus first, then trades, then singles)

**Tab 3: Allies** (characters) / **Tab 4: Enemies** (characters)
- For teams: replace with **Members** tab showing team_members roster by era
- Card grid showing related entity name, cover_image_url, relationship summary
- Clicking an ally/enemy navigates to their entity page

**Tab 5: Media**
- Grouped by media_type (Animated Series, Live Action, Films, Video Games, Podcasts)
- Each entry shows title, year, platform, watch_order if applicable, link to where_to_watch
- For series with multiple entries, show them in watch_order sequence

**Tab 6: Bibliography**
- Full list of all reading_entries across all arcs for this entity
- Two sort modes: Reading Order (default) and Publication Order
- Filter by format (trade, omnibus, single issues, etc.)
- Each row: order number, arc title, item title, format badge, issue range, purchase link

### `/search` — Global Search

- Fuse.js search across all entity names, slugs, and short_bios
- Results grouped: Characters first, then Teams
- Publisher color dot next to each result
- Keyboard navigable (arrow keys, Enter to navigate)
- Empty state: "No results for [query]. Try a character name, team, or publisher."

---

## Data Layer

### Supabase Client Setup

```
/lib/supabase/client.ts     → browser client
/lib/supabase/server.ts     → server client for RSC
/lib/supabase/types.ts      → generated Database types (run: npx supabase gen types)
```

### Key Queries to Implement

**Get all entities for a publisher (with count):**
```sql
select * from entities
where publisher_id = $1
order by name asc
```

**Get full character page data (single query with joins):**
```sql
select
  e.*,
  p.name as publisher_name, p.color_hex, p.slug as publisher_slug,
  json_agg(distinct er order by er.order_index) as eras
from entities e
join publishers p on p.id = e.publisher_id
left join eras er on er.entity_id = e.id
where e.slug = $1
group by e.id, p.name, p.color_hex, p.slug
```

Arcs, reading_entries, relationships, and media_entries should be fetched in parallel via TanStack Query — not in one giant nested query. This keeps tab switching fast (each tab's data is independently cached).

### TanStack Query Structure

```
/hooks/useEntity.ts             → base entity + eras
/hooks/useArcs.ts               → arcs for an era (lazy, loads on tab open)
/hooks/useRelationships.ts      → allies + enemies
/hooks/useMedia.ts              → media entries
/hooks/useBibliography.ts       → full reading list
/hooks/useStartHere.ts          → 3 curated entry points
/hooks/usePublisherEntities.ts  → all entities for a publisher page
```

---

## Seed Data — Build These First

Seed the database with enough data to make every page functional and testable before adding more characters.

### Publishers (all 4)
DC Comics, Marvel Comics, Image Comics, Boom! Studios — with slugs, colors, and placeholder logos.

### Characters (10 to start)
**DC:** Batman, Superman, Wonder Woman, The Flash, Green Lantern
**Marvel:** Spider-Man, Iron Man, Captain America, Thor, Wolverine

Each needs:
- At least 3 eras
- At least 2 arcs per era
- At least 1 reading entry per arc
- 3 start_here entries
- At least 4 allies and 4 enemies
- At least 3 media entries

### Teams (4 to start)
**DC:** Justice League, Teen Titans
**Marvel:** X-Men, Avengers

Each needs the same minimum data as characters, plus team_members entries linking to the seeded characters where applicable (e.g. Batman → Justice League member, Superman → Justice League member).

---

## Content Administration

Since content will scale to hundreds of characters without code changes, build a lightweight admin layer:

### `/admin` — Protected Admin Routes

Protect with Supabase Auth (email/password, single user for now).

**Pages:**
- `/admin` — dashboard showing entity counts per publisher
- `/admin/entities/new` — form to create a new character or team
- `/admin/entities/[id]` — edit an existing entity
- `/admin/entities/[id]/eras` — manage eras and arcs for an entity
- `/admin/entities/[id]/media` — manage media entries
- `/admin/entities/[id]/relationships` — manage allies/enemies/members

**Each form should use:** controlled inputs, inline validation, Supabase upsert on submit. No external CMS needed — this is the CMS.

---

## Performance Requirements

- Publisher pages must load in under 1 second on fast connection
- Character page initial load (Summary tab) must be under 800ms
- Tab switching must feel instant — use TanStack Query `staleTime: 5 * 60 * 1000` so cached tab data never refetches during a session
- Images: use `next/image` with lazy loading everywhere. Store all images in Supabase Storage.
- Static generation: use `generateStaticParams` for all entity pages. Rebuild on new entity added.

---

## Project Structure

```
/app
  /page.tsx                         → Library home
  /[publisher]/page.tsx             → Publisher page
  /character/[slug]/page.tsx        → Character page
  /team/[slug]/page.tsx             → Team page
  /search/page.tsx                  → Search page
  /admin/...                        → Admin routes

/components
  /ui/                              → Buttons, badges, tabs, cards, toggles
  /library/PublisherGrid.tsx
  /library/EntityCard.tsx
  /library/EntitySearch.tsx
  /entity/EntityHero.tsx
  /entity/tabs/SummaryTab.tsx
  /entity/tabs/TimelineTab.tsx
  /entity/tabs/AlliesTab.tsx
  /entity/tabs/EnemiesTab.tsx
  /entity/tabs/MembersTab.tsx       → Teams only
  /entity/tabs/MediaTab.tsx
  /entity/tabs/BibliographyTab.tsx
  /entity/EraAccordion.tsx
  /entity/ArcCard.tsx
  /entity/SpoilerToggle.tsx
  /entity/StartHereCards.tsx
  /admin/EntityForm.tsx
  /admin/EraManager.tsx

/hooks
  /useEntity.ts
  /useArcs.ts
  /useRelationships.ts
  /useMedia.ts
  /useBibliography.ts
  /useStartHere.ts
  /usePublisherEntities.ts
  /useSearch.ts

/lib
  /supabase/client.ts
  /supabase/server.ts
  /supabase/types.ts
  /search/fuseConfig.ts             → Fuse.js index config

/types
  /index.ts                         → All shared TypeScript types matching DB schema
```

---

## Build Order

Execute in this sequence to have something testable at every step:

1. **Supabase setup** — create project, run schema migrations, create all tables
2. **Seed publishers** — insert all 4 publishers
3. **Next.js scaffold** — init project, install dependencies, configure Tailwind + fonts
4. **Design tokens** — set up CSS variables and Tailwind config using color tokens above
5. **Seed 2 characters** — Batman and Spider-Man with full data (eras, arcs, reading entries, allies, enemies, media, start_here)
6. **Library home** — publisher grid, basic nav
7. **Publisher page** — entity card grid, character/team toggle, client search
8. **Entity page shell** — hero section + tab navigation (no tab content yet)
9. **Summary tab** — start_here cards, bio, metadata
10. **Timeline tab** — era accordions, arc cards, spoiler toggle, reading entries
11. **Allies + Enemies tabs** (characters) / Members tab (teams)
12. **Media tab**
13. **Bibliography tab** — reading order + publication order toggle
14. **Global search page**
15. **Seed remaining 8 characters + 4 teams**
16. **Admin routes** — entity form, era manager, media manager
17. **Performance pass** — static generation, image optimization, query tuning
18. **Polish pass** — empty states, error boundaries, loading skeletons

---

## Roadmap (Out of Scope for This Build)

- **Manga support** — separate publisher category with volume/chapter conventions, serialization tracking, anime media entries
- **User accounts** — reading progress, personal reading lists, "read" checkmarks per arc
- **Community data** — user-submitted corrections, rating arcs, review threads
- **Character comparison** — side-by-side era timelines for two characters
- **Mobile app** — React Native with shared Supabase backend
- **API** — public read API for third-party integrations
