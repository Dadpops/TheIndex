// =============================================================================
// Seed authoring schema.
// -----------------------------------------------------------------------------
// Content is authored against these interfaces (no ids — ids are derived).
// `build.ts` transforms these into fully-keyed DB row arrays. The shapes here
// intentionally mirror the DB schema minus generated/foreign-key columns.
// =============================================================================

import type {
  ArcType,
  EntityRole,
  EntityType,
  MediaType,
  PublisherSlug,
  ReadingFormat,
  RelationshipType,
  TeamRole,
} from "@/types";

export interface PublisherSeed {
  slug: PublisherSlug;
  name: string;
  color_hex: string;
  logo_url?: string | null;
}

export interface ReadingEntrySeed {
  title: string;
  format: ReadingFormat;
  issue_range?: string | null;
  reading_order: number;
  publication_order: number;
  reading_order_note?: string | null;
  isbn?: string | null;
  purchase_url?: string | null;
}

export interface ArcSeed {
  slug: string;
  title: string;
  logline: string;
  summary: string;
  spoiler?: string | null;
  arc_type: ArcType;
  start_year?: number | null;
  end_year?: number | null;
  order_index: number;
  reading_entries: ReadingEntrySeed[];
}

export interface EraSeed {
  slug: string;
  title: string;
  start_year?: number | null;
  end_year?: number | null;
  order_index: number;
  summary?: string | null;
  arcs: ArcSeed[];
}

export interface StartHereSeed {
  order_index: 1 | 2 | 3;
  label: string;
  reason: string;
  /** Slug of an arc belonging to this entity. */
  arc_slug: string;
}

export interface RelationshipSeed {
  /** Slug of another seeded entity. */
  related_slug: string;
  relationship: RelationshipType;
  summary: string;
  notes: string;
}

export interface MediaSeed {
  media_type: MediaType;
  title: string;
  release_year?: number | null;
  watch_order?: number | null;
  platform?: string | null;
  notes?: string | null;
  where_to_watch?: string | null;
}

export interface TeamMemberSeed {
  /** Slug of a seeded character entity. */
  character_slug: string;
  /** Slug of one of this team's eras, or null for "all eras". */
  era_slug?: string | null;
  role: TeamRole;
  notes?: string | null;
}

export interface EntitySeed {
  slug: string;
  name: string;
  entity_type: EntityType;
  /** Defaults to 'hero' in the build if omitted. */
  role?: EntityRole;
  publisher_slug: PublisherSlug;
  real_name?: string | null;
  first_appearance: string;
  logo_url?: string | null;
  cover_image_url?: string | null;
  short_bio: string;
  eras: EraSeed[];
  start_here: StartHereSeed[];
  relationships: RelationshipSeed[];
  media: MediaSeed[];
  /** Teams only. */
  team_members?: TeamMemberSeed[];
}
