-- =============================================================================
-- The Index — initial schema
-- -----------------------------------------------------------------------------
-- Run in the Supabase SQL editor (or `supabase db push`). Creates every table
-- with UUID primary keys, foreign keys, indexes, and row-level security.
-- Public read access; writes restricted to authenticated users (the admin).
-- =============================================================================

create extension if not exists pgcrypto;

-- ----------------------------------------------------------------------------
-- publishers
-- ----------------------------------------------------------------------------
create table if not exists publishers (
  id         uuid primary key default gen_random_uuid(),
  slug       text unique not null,
  name       text not null,
  color_hex  text,
  logo_url   text,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- entities (characters AND teams)
-- ----------------------------------------------------------------------------
create table if not exists entities (
  id               uuid primary key default gen_random_uuid(),
  slug             text unique not null,
  name             text not null,
  entity_type      text not null check (entity_type in ('character','team')),
  role             text not null default 'hero' check (role in ('hero','villain','antihero','neutral')),
  publisher_id     uuid references publishers(id) on delete set null,
  real_name        text,
  first_appearance text,
  logo_url         text,
  cover_image_url  text,
  short_bio        text,
  created_at       timestamptz not null default now()
);
create index if not exists entities_publisher_idx on entities(publisher_id);
create index if not exists entities_type_idx on entities(entity_type);

-- ----------------------------------------------------------------------------
-- eras
-- ----------------------------------------------------------------------------
create table if not exists eras (
  id          uuid primary key default gen_random_uuid(),
  entity_id   uuid not null references entities(id) on delete cascade,
  slug        text not null,
  title       text not null,
  start_year  int,
  end_year    int,
  order_index int not null,
  summary     text,
  created_at  timestamptz not null default now(),
  unique (entity_id, slug)
);
create index if not exists eras_entity_idx on eras(entity_id);

-- ----------------------------------------------------------------------------
-- arcs
-- ----------------------------------------------------------------------------
create table if not exists arcs (
  id          uuid primary key default gen_random_uuid(),
  era_id      uuid not null references eras(id) on delete cascade,
  slug        text not null,
  title       text not null,
  logline     text not null,
  summary     text not null,
  spoiler     text,
  arc_type    text not null check (arc_type in
                ('origin','flagship','crossover','elseworlds','annual','miniseries','tie-in','retcon')),
  start_year  int,
  end_year    int,
  order_index int not null,
  created_at  timestamptz not null default now(),
  unique (era_id, slug)
);
create index if not exists arcs_era_idx on arcs(era_id);

-- ----------------------------------------------------------------------------
-- reading_entries
-- ----------------------------------------------------------------------------
create table if not exists reading_entries (
  id                 uuid primary key default gen_random_uuid(),
  arc_id             uuid not null references arcs(id) on delete cascade,
  title              text not null,
  format             text not null check (format in
                       ('trade','omnibus','single_issues','digital','hardcover')),
  issue_range        text,
  reading_order      int not null,
  publication_order  int not null,
  reading_order_note text,
  isbn               text,
  purchase_url       text,
  created_at         timestamptz not null default now()
);
create index if not exists reading_entries_arc_idx on reading_entries(arc_id);

-- ----------------------------------------------------------------------------
-- start_here (exactly 3 curated entry points per entity)
-- ----------------------------------------------------------------------------
create table if not exists start_here (
  id          uuid primary key default gen_random_uuid(),
  entity_id   uuid not null references entities(id) on delete cascade,
  arc_id      uuid references arcs(id) on delete set null,
  order_index int not null check (order_index between 1 and 3),
  label       text not null,
  reason      text not null,
  unique (entity_id, order_index)
);
create index if not exists start_here_entity_idx on start_here(entity_id);

-- ----------------------------------------------------------------------------
-- relationships (allies / enemies / members / rivals)
-- ----------------------------------------------------------------------------
create table if not exists relationships (
  id           uuid primary key default gen_random_uuid(),
  entity_id    uuid not null references entities(id) on delete cascade,
  related_id   uuid references entities(id) on delete cascade,
  relationship text not null check (relationship in ('ally','enemy','member','rival')),
  summary      text not null,
  notes        text not null
);
create index if not exists relationships_entity_idx on relationships(entity_id);
create index if not exists relationships_related_idx on relationships(related_id);

-- ----------------------------------------------------------------------------
-- media_entries
-- ----------------------------------------------------------------------------
create table if not exists media_entries (
  id             uuid primary key default gen_random_uuid(),
  entity_id      uuid not null references entities(id) on delete cascade,
  media_type     text not null check (media_type in
                   ('animated_series','live_action','film','video_game','podcast','audio_drama')),
  title          text not null,
  release_year   int,
  watch_order    int,
  platform       text,
  notes          text,
  where_to_watch text
);
create index if not exists media_entries_entity_idx on media_entries(entity_id);

-- ----------------------------------------------------------------------------
-- team_members
-- ----------------------------------------------------------------------------
create table if not exists team_members (
  id           uuid primary key default gen_random_uuid(),
  team_id      uuid not null references entities(id) on delete cascade,
  character_id uuid not null references entities(id) on delete cascade,
  era_id       uuid references eras(id) on delete set null,
  role         text check (role in ('founder','leader','member','honorary')),
  notes        text
);
create index if not exists team_members_team_idx on team_members(team_id);
create index if not exists team_members_character_idx on team_members(character_id);

-- =============================================================================
-- Row-Level Security: public read, authenticated write.
-- =============================================================================
do $$
declare t text;
begin
  foreach t in array array[
    'publishers','entities','eras','arcs','reading_entries',
    'start_here','relationships','media_entries','team_members'
  ]
  loop
    execute format('alter table %I enable row level security;', t);

    execute format($f$
      drop policy if exists "public_read" on %I;
      create policy "public_read" on %I for select using (true);
    $f$, t, t);

    execute format($f$
      drop policy if exists "auth_write" on %I;
      create policy "auth_write" on %I for all
        to authenticated using (true) with check (true);
    $f$, t, t);
  end loop;
end $$;
