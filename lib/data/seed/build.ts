// =============================================================================
// Seed build pipeline.
// -----------------------------------------------------------------------------
// Transforms authored content (content.json, no ids) into fully-keyed,
// type-safe DB row arrays. This same module powers BOTH the in-app local data
// backend AND the `seed.sql` generator, guaranteeing the offline app and a real
// Supabase database hold identical, foreign-key-consistent data.
// =============================================================================

import type {
  Arc,
  Entity,
  Era,
  MediaEntry,
  Publisher,
  ReadingEntry,
  Relationship,
  StartHere,
  TeamMember,
} from "@/types";
import { id } from "@/lib/data/ids";
import type { EntitySeed, PublisherSeed } from "./schema";
import contentJson from "./content.json";

const content = contentJson as unknown as {
  publishers: PublisherSeed[];
  entities: EntitySeed[];
};

/** Fixed timestamp keeps generated rows stable across rebuilds. */
const SEEDED_AT = "2024-01-01T00:00:00.000Z";

export interface Dataset {
  publishers: Publisher[];
  entities: Entity[];
  eras: Era[];
  arcs: Arc[];
  readingEntries: ReadingEntry[];
  startHere: StartHere[];
  relationships: Relationship[];
  media: MediaEntry[];
  teamMembers: TeamMember[];
}

/**
 * Build the normalized dataset from authored seed content. Pure and
 * deterministic — same input always yields the same ids and ordering.
 */
export function buildDataset(): Dataset {
  const publishers: Publisher[] = content.publishers.map((p: PublisherSeed) => ({
    id: id.publisher(p.slug),
    slug: p.slug,
    name: p.name,
    color_hex: p.color_hex,
    logo_url: p.logo_url ?? null,
    created_at: SEEDED_AT,
  }));

  const entities: Entity[] = [];
  const eras: Era[] = [];
  const arcs: Arc[] = [];
  const readingEntries: ReadingEntry[] = [];
  const startHere: StartHere[] = [];
  const relationships: Relationship[] = [];
  const media: MediaEntry[] = [];
  const teamMembers: TeamMember[] = [];

  for (const e of content.entities) {
    const entityId = id.entity(e.slug);
    entities.push({
      id: entityId,
      slug: e.slug,
      name: e.name,
      entity_type: e.entity_type,
      role: e.role ?? "hero",
      publisher_id: id.publisher(e.publisher_slug),
      real_name: e.real_name ?? null,
      first_appearance: e.first_appearance ?? null,
      logo_url: e.logo_url ?? null,
      cover_image_url: e.cover_image_url ?? null,
      short_bio: e.short_bio ?? null,
      created_at: SEEDED_AT,
    });

    // Map arc slug -> arc id so start_here can resolve its target arc.
    const arcSlugToId = new Map<string, string>();

    for (const era of e.eras ?? []) {
      const eraId = id.era(e.slug, era.slug);
      eras.push({
        id: eraId,
        entity_id: entityId,
        slug: era.slug,
        title: era.title,
        start_year: era.start_year ?? null,
        end_year: era.end_year ?? null,
        order_index: era.order_index,
        summary: era.summary ?? null,
        created_at: SEEDED_AT,
      });

      for (const arc of era.arcs ?? []) {
        const arcId = id.arc(e.slug, era.slug, arc.slug);
        arcSlugToId.set(arc.slug, arcId);
        arcs.push({
          id: arcId,
          era_id: eraId,
          slug: arc.slug,
          title: arc.title,
          logline: arc.logline,
          summary: arc.summary,
          spoiler: arc.spoiler ?? null,
          arc_type: arc.arc_type,
          start_year: arc.start_year ?? null,
          end_year: arc.end_year ?? null,
          order_index: arc.order_index,
          created_at: SEEDED_AT,
        });

        for (const r of arc.reading_entries ?? []) {
          readingEntries.push({
            id: id.reading(e.slug, era.slug, arc.slug, r.reading_order),
            arc_id: arcId,
            title: r.title,
            format: r.format,
            issue_range: r.issue_range ?? null,
            reading_order: r.reading_order,
            publication_order: r.publication_order,
            reading_order_note: r.reading_order_note ?? null,
            isbn: r.isbn ?? null,
            purchase_url: r.purchase_url ?? null,
            created_at: SEEDED_AT,
          });
        }
      }
    }

    for (const sh of e.start_here ?? []) {
      startHere.push({
        id: id.startHere(e.slug, sh.order_index),
        entity_id: entityId,
        arc_id: arcSlugToId.get(sh.arc_slug) ?? null,
        order_index: sh.order_index,
        label: sh.label,
        reason: sh.reason,
      });
    }

    for (const rel of e.relationships ?? []) {
      relationships.push({
        id: id.relationship(e.slug, rel.related_slug, rel.relationship),
        entity_id: entityId,
        related_id: id.entity(rel.related_slug),
        relationship: rel.relationship,
        summary: rel.summary,
        notes: rel.notes,
      });
    }

    for (const m of e.media ?? []) {
      media.push({
        id: id.media(e.slug, m.media_type, m.title),
        entity_id: entityId,
        media_type: m.media_type,
        title: m.title,
        release_year: m.release_year ?? null,
        watch_order: m.watch_order ?? null,
        platform: m.platform ?? null,
        notes: m.notes ?? null,
        where_to_watch: m.where_to_watch ?? null,
      });
    }

    for (const tm of e.team_members ?? []) {
      teamMembers.push({
        id: id.teamMember(e.slug, tm.character_slug, tm.era_slug ?? null),
        team_id: entityId,
        character_id: id.entity(tm.character_slug),
        era_id: tm.era_slug ? id.era(e.slug, tm.era_slug) : null,
        role: tm.role,
        notes: tm.notes ?? null,
      });
    }
  }

  return { publishers, entities, eras, arcs, readingEntries, startHere, relationships, media, teamMembers };
}
