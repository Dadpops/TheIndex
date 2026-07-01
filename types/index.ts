// =============================================================================
// The Index — Shared TypeScript types
// -----------------------------------------------------------------------------
// These mirror the Supabase Postgres schema exactly (see supabase/migrations).
// They are the single source of truth shared by the data layer, hooks, server
// components, and client components. No `any` is permitted anywhere downstream.
// =============================================================================

export type EntityType = "character" | "team";

export type EntityRole = "hero" | "villain" | "antihero" | "neutral";

export type ArcType =
  | "origin"
  | "flagship"
  | "crossover"
  | "elseworlds"
  | "annual"
  | "miniseries"
  | "tie-in"
  | "retcon";

export type ReadingFormat =
  | "trade"
  | "omnibus"
  | "single_issues"
  | "digital"
  | "hardcover";

export type RelationshipType = "ally" | "enemy" | "member" | "rival";

export type MediaType =
  | "animated_series"
  | "live_action"
  | "film"
  | "video_game"
  | "podcast"
  | "audio_drama";

export type TeamRole = "founder" | "leader" | "member" | "honorary";

export type PublisherSlug = "dc" | "marvel" | "image" | "boom";

// -----------------------------------------------------------------------------
// Row types — one per table.
// -----------------------------------------------------------------------------

export interface Publisher {
  id: string;
  slug: PublisherSlug;
  name: string;
  color_hex: string | null;
  logo_url: string | null;
  created_at: string;
}

export interface Entity {
  id: string;
  slug: string;
  name: string;
  entity_type: EntityType;
  role: EntityRole;
  publisher_id: string;
  real_name: string | null;
  first_appearance: string | null;
  logo_url: string | null;
  cover_image_url: string | null;
  short_bio: string | null;
  created_at: string;
}

export interface Era {
  id: string;
  entity_id: string;
  slug: string;
  title: string;
  start_year: number | null;
  end_year: number | null;
  order_index: number;
  summary: string | null;
  created_at: string;
}

export interface Arc {
  id: string;
  era_id: string;
  slug: string;
  title: string;
  logline: string;
  summary: string;
  spoiler: string | null;
  arc_type: ArcType;
  start_year: number | null;
  end_year: number | null;
  order_index: number;
  created_at: string;
}

export interface ReadingEntry {
  id: string;
  arc_id: string;
  title: string;
  format: ReadingFormat;
  issue_range: string | null;
  reading_order: number;
  publication_order: number;
  reading_order_note: string | null;
  isbn: string | null;
  purchase_url: string | null;
  created_at: string;
}

export interface StartHere {
  id: string;
  entity_id: string;
  arc_id: string | null;
  order_index: number; // 1, 2, or 3
  label: string;
  reason: string;
}

export interface Relationship {
  id: string;
  entity_id: string;
  related_id: string;
  relationship: RelationshipType;
  summary: string;
  notes: string;
}

export interface MediaEntry {
  id: string;
  entity_id: string;
  media_type: MediaType;
  title: string;
  release_year: number | null;
  watch_order: number | null;
  platform: string | null;
  notes: string | null;
  where_to_watch: string | null;
}

export interface TeamMember {
  id: string;
  team_id: string;
  character_id: string;
  era_id: string | null; // null = all eras
  role: TeamRole | null;
  notes: string | null;
}

// -----------------------------------------------------------------------------
// Composite / view types used by the UI layer.
// -----------------------------------------------------------------------------

/** Entity joined with its publisher — used everywhere a card or hero renders. */
export interface EntityWithPublisher extends Entity {
  publisher: Publisher;
}

/** An arc together with its grouped reading entries (used in the Timeline tab). */
export interface ArcWithReading extends Arc {
  reading_entries: ReadingEntry[];
}

/** An era together with its ordered arcs (used in the Timeline tab). */
export interface EraWithArcs extends Era {
  arcs: ArcWithReading[];
}

/** A curated entry point joined with the arc it points at. */
export interface StartHereWithArc extends StartHere {
  arc: Arc | null;
}

/** A relationship joined with the related entity (+ its publisher) for cards. */
export interface RelationshipWithEntity extends Relationship {
  related: EntityWithPublisher;
}

/** A team-member row joined with the character and the era it applies to. */
export interface TeamMemberWithEntity extends TeamMember {
  character: EntityWithPublisher;
  era: Era | null;
}

/** A single reading row flattened for the Bibliography tab. */
export interface BibliographyRow extends ReadingEntry {
  arc_title: string;
  arc_slug: string;
  era_title: string;
}

/** Minimal shape indexed by Fuse.js for global + scoped search. */
export interface SearchRecord {
  id: string;
  slug: string;
  name: string;
  entity_type: EntityType;
  short_bio: string | null;
  publisher_slug: PublisherSlug;
  publisher_name: string;
  publisher_color: string | null;
}

/** Publisher with a derived count of its characters / teams. */
export interface PublisherWithCounts extends Publisher {
  character_count: number;
  team_count: number;
}
