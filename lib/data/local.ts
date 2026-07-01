// =============================================================================
// Local data backend.
// -----------------------------------------------------------------------------
// In-memory implementation of the repository interface over the built seed
// dataset. This is what powers the app when no Supabase project is configured,
// so every page renders fully offline with zero external setup.
// =============================================================================

import type {
  BibliographyRow,
  Entity,
  EntityWithPublisher,
  EraWithArcs,
  MediaEntry,
  Publisher,
  PublisherWithCounts,
  RelationshipWithEntity,
  SearchRecord,
  StartHereWithArc,
  TeamMemberWithEntity,
} from "@/types";
import { buildDataset, type Dataset } from "./seed/build";

interface Indexes {
  data: Dataset;
  publishersById: Map<string, Publisher>;
  publishersBySlug: Map<string, Publisher>;
  entitiesById: Map<string, Entity>;
  entitiesBySlug: Map<string, Entity>;
  entitiesByPublisher: Map<string, Entity[]>;
}

let cache: Indexes | null = null;

function indexes(): Indexes {
  if (cache) return cache;
  const data = buildDataset();

  const publishersById = new Map(data.publishers.map((p) => [p.id, p]));
  const publishersBySlug = new Map(data.publishers.map((p) => [p.slug, p]));
  const entitiesById = new Map(data.entities.map((e) => [e.id, e]));
  const entitiesBySlug = new Map(data.entities.map((e) => [e.slug, e]));

  const entitiesByPublisher = new Map<string, Entity[]>();
  for (const e of data.entities) {
    const list = entitiesByPublisher.get(e.publisher_id) ?? [];
    list.push(e);
    entitiesByPublisher.set(e.publisher_id, list);
  }

  cache = {
    data,
    publishersById,
    publishersBySlug,
    entitiesById,
    entitiesBySlug,
    entitiesByPublisher,
  };
  return cache;
}

function withPublisher(entity: Entity, ix: Indexes): EntityWithPublisher | null {
  const publisher = ix.publishersById.get(entity.publisher_id);
  if (!publisher) return null;
  return { ...entity, publisher };
}

// -----------------------------------------------------------------------------

export async function getPublishersWithCounts(): Promise<PublisherWithCounts[]> {
  const ix = indexes();
  return ix.data.publishers.map((p) => {
    const owned = ix.entitiesByPublisher.get(p.id) ?? [];
    return {
      ...p,
      character_count: owned.filter((e) => e.entity_type === "character").length,
      team_count: owned.filter((e) => e.entity_type === "team").length,
    };
  });
}

export async function getPublisherBySlug(slug: string): Promise<Publisher | null> {
  return indexes().publishersBySlug.get(slug) ?? null;
}

export async function getEntitiesByPublisherSlug(slug: string): Promise<EntityWithPublisher[]> {
  const ix = indexes();
  const publisher = ix.publishersBySlug.get(slug);
  if (!publisher) return [];
  return (ix.entitiesByPublisher.get(publisher.id) ?? [])
    .map((e) => ({ ...e, publisher }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function getAllEntities(): Promise<EntityWithPublisher[]> {
  const ix = indexes();
  return ix.data.entities
    .map((e) => withPublisher(e, ix))
    .filter((e): e is EntityWithPublisher => e !== null)
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function getEntityBySlug(slug: string): Promise<EntityWithPublisher | null> {
  const ix = indexes();
  const entity = ix.entitiesBySlug.get(slug);
  return entity ? withPublisher(entity, ix) : null;
}

export async function getTimeline(entityId: string): Promise<EraWithArcs[]> {
  const { data } = indexes();
  return data.eras
    .filter((era) => era.entity_id === entityId)
    .sort((a, b) => a.order_index - b.order_index)
    .map((era) => ({
      ...era,
      arcs: data.arcs
        .filter((arc) => arc.era_id === era.id)
        .sort((a, b) => a.order_index - b.order_index)
        .map((arc) => ({
          ...arc,
          reading_entries: data.readingEntries
            .filter((r) => r.arc_id === arc.id)
            .sort((a, b) => a.reading_order - b.reading_order),
        })),
    }));
}

export async function getStartHere(entityId: string): Promise<StartHereWithArc[]> {
  const { data } = indexes();
  const arcsById = new Map(data.arcs.map((a) => [a.id, a]));
  return data.startHere
    .filter((s) => s.entity_id === entityId)
    .sort((a, b) => a.order_index - b.order_index)
    .map((s) => ({ ...s, arc: s.arc_id ? arcsById.get(s.arc_id) ?? null : null }));
}

export async function getRelationships(entityId: string): Promise<RelationshipWithEntity[]> {
  const ix = indexes();
  const out: RelationshipWithEntity[] = [];
  for (const rel of ix.data.relationships) {
    if (rel.entity_id !== entityId) continue;
    const related = ix.entitiesById.get(rel.related_id);
    if (!related) continue; // drop dangling references
    const withPub = withPublisher(related, ix);
    if (!withPub) continue;
    out.push({ ...rel, related: withPub });
  }
  return out.sort((a, b) => a.related.name.localeCompare(b.related.name));
}

export async function getMedia(entityId: string): Promise<MediaEntry[]> {
  const { data } = indexes();
  // null watch_order sorts LAST (to match the Supabase backend's nullsFirst:false).
  const wo = (n: number | null) => n ?? Number.MAX_SAFE_INTEGER;
  return data.media
    .filter((m) => m.entity_id === entityId)
    .sort((a, b) => wo(a.watch_order) - wo(b.watch_order) || (a.release_year ?? 0) - (b.release_year ?? 0));
}

export async function getBibliography(entityId: string): Promise<BibliographyRow[]> {
  const { data } = indexes();
  const erasById = new Map(data.eras.map((e) => [e.id, e]));
  const arcsById = new Map(data.arcs.map((a) => [a.id, a]));
  const entityArcIds = new Set(
    data.arcs.filter((a) => erasById.get(a.era_id)?.entity_id === entityId).map((a) => a.id),
  );

  return data.readingEntries
    .filter((r) => entityArcIds.has(r.arc_id))
    .map((r) => {
      const arc = arcsById.get(r.arc_id);
      const era = arc ? erasById.get(arc.era_id) : undefined;
      return {
        ...r,
        arc_title: arc?.title ?? "",
        arc_slug: arc?.slug ?? "",
        era_title: era?.title ?? "",
      };
    });
}

export async function getTeamMembers(teamId: string): Promise<TeamMemberWithEntity[]> {
  const ix = indexes();
  const erasById = new Map(ix.data.eras.map((e) => [e.id, e]));
  const out: TeamMemberWithEntity[] = [];
  for (const tm of ix.data.teamMembers) {
    if (tm.team_id !== teamId) continue;
    const character = ix.entitiesById.get(tm.character_id);
    if (!character) continue;
    const withPub = withPublisher(character, ix);
    if (!withPub) continue;
    out.push({ ...tm, character: withPub, era: tm.era_id ? erasById.get(tm.era_id) ?? null : null });
  }
  return out;
}

export async function getSearchIndex(): Promise<SearchRecord[]> {
  const ix = indexes();
  return ix.data.entities
    .map((e) => {
      const publisher = ix.publishersById.get(e.publisher_id);
      if (!publisher) return null;
      return {
        id: e.id,
        slug: e.slug,
        name: e.name,
        entity_type: e.entity_type,
        short_bio: e.short_bio,
        publisher_slug: publisher.slug,
        publisher_name: publisher.name,
        publisher_color: publisher.color_hex,
      } satisfies SearchRecord;
    })
    .filter((r): r is SearchRecord => r !== null);
}
