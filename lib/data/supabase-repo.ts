// =============================================================================
// Supabase data backend.
// -----------------------------------------------------------------------------
// Implements the repository interface against a live Supabase Postgres backend.
// Mirrors local.ts so the two are interchangeable. Uses a fetch-and-assemble
// strategy (rather than deep PostgREST embeds) for predictable typing and to
// keep each tab's query independently cacheable.
//
// Query results are cast to our domain row types at the boundary via `many`/
// `one`. The hand-written Database generic gives column-name checking on the
// builder; the explicit casts keep result typing exact without depending on
// PostgREST's select-string type inference.
// =============================================================================

import "server-only";

import type {
  Arc,
  BibliographyRow,
  Entity,
  EntityWithPublisher,
  Era,
  EraWithArcs,
  MediaEntry,
  Publisher,
  PublisherWithCounts,
  ReadingEntry,
  Relationship,
  RelationshipWithEntity,
  SearchRecord,
  StartHere,
  StartHereWithArc,
  TeamMember,
  TeamMemberWithEntity,
} from "@/types";
import { getServerClient } from "@/lib/supabase/server";

async function db() {
  return getServerClient();
}

/** Cast a PostgREST result payload to a typed row array. */
function many<T>(data: unknown): T[] {
  return ((data as T[] | null) ?? []);
}
/** Cast a PostgREST single-row payload to a typed row or null. */
function one<T>(data: unknown): T | null {
  return ((data as T | null) ?? null);
}

function attachPublisher(entities: Entity[], publishers: Publisher[]): EntityWithPublisher[] {
  const byId = new Map(publishers.map((p) => [p.id, p]));
  return entities
    .map((e) => {
      const publisher = byId.get(e.publisher_id);
      return publisher ? { ...e, publisher } : null;
    })
    .filter((e): e is EntityWithPublisher => e !== null);
}

// -----------------------------------------------------------------------------

export async function getPublishersWithCounts(): Promise<PublisherWithCounts[]> {
  const supabase = await db();
  const [pubRes, entRes] = await Promise.all([
    supabase.from("publishers").select("*"),
    supabase.from("entities").select("id, publisher_id, entity_type"),
  ]);
  const publishers = many<Publisher>(pubRes.data);
  const entities = many<Pick<Entity, "id" | "publisher_id" | "entity_type">>(entRes.data);

  return publishers.map((p) => {
    const owned = entities.filter((e) => e.publisher_id === p.id);
    return {
      ...p,
      character_count: owned.filter((e) => e.entity_type === "character").length,
      team_count: owned.filter((e) => e.entity_type === "team").length,
    };
  });
}

export async function getPublisherBySlug(slug: string): Promise<Publisher | null> {
  const supabase = await db();
  const { data } = await supabase.from("publishers").select("*").eq("slug", slug).maybeSingle();
  return one<Publisher>(data);
}

export async function getEntitiesByPublisherSlug(slug: string): Promise<EntityWithPublisher[]> {
  const supabase = await db();
  const publisher = await getPublisherBySlug(slug);
  if (!publisher) return [];
  const { data } = await supabase
    .from("entities")
    .select("*")
    .eq("publisher_id", publisher.id)
    .order("name", { ascending: true });
  return many<Entity>(data).map((e) => ({ ...e, publisher }));
}

export async function getAllEntities(): Promise<EntityWithPublisher[]> {
  const supabase = await db();
  const [entRes, pubRes] = await Promise.all([
    supabase.from("entities").select("*").order("name", { ascending: true }),
    supabase.from("publishers").select("*"),
  ]);
  return attachPublisher(many<Entity>(entRes.data), many<Publisher>(pubRes.data));
}

export async function getEntityBySlug(slug: string): Promise<EntityWithPublisher | null> {
  const supabase = await db();
  const { data: entityData } = await supabase.from("entities").select("*").eq("slug", slug).maybeSingle();
  const entity = one<Entity>(entityData);
  if (!entity) return null;
  const { data: pubData } = await supabase
    .from("publishers")
    .select("*")
    .eq("id", entity.publisher_id)
    .maybeSingle();
  const publisher = one<Publisher>(pubData);
  if (!publisher) return null;
  return { ...entity, publisher };
}

async function fetchTimelineRows(entityId: string): Promise<{
  eras: Era[];
  arcs: Arc[];
  reading: ReadingEntry[];
}> {
  const supabase = await db();
  const { data: eraData } = await supabase
    .from("eras")
    .select("*")
    .eq("entity_id", entityId)
    .order("order_index", { ascending: true });
  const eras = many<Era>(eraData);
  const eraIds = eras.map((e) => e.id);
  if (eraIds.length === 0) return { eras: [], arcs: [], reading: [] };

  const { data: arcData } = await supabase
    .from("arcs")
    .select("*")
    .in("era_id", eraIds)
    .order("order_index", { ascending: true });
  const arcs = many<Arc>(arcData);
  const arcIds = arcs.map((a) => a.id);

  let reading: ReadingEntry[] = [];
  if (arcIds.length) {
    const { data: readingData } = await supabase
      .from("reading_entries")
      .select("*")
      .in("arc_id", arcIds)
      .order("reading_order", { ascending: true });
    reading = many<ReadingEntry>(readingData);
  }

  return { eras, arcs, reading };
}

export async function getTimeline(entityId: string): Promise<EraWithArcs[]> {
  const { eras, arcs, reading } = await fetchTimelineRows(entityId);
  return eras.map((era) => ({
    ...era,
    arcs: arcs
      .filter((a) => a.era_id === era.id)
      .map((arc) => ({
        ...arc,
        reading_entries: reading.filter((r) => r.arc_id === arc.id),
      })),
  }));
}

export async function getStartHere(entityId: string): Promise<StartHereWithArc[]> {
  const supabase = await db();
  const { data } = await supabase
    .from("start_here")
    .select("*")
    .eq("entity_id", entityId)
    .order("order_index", { ascending: true });
  const startRows = many<StartHere>(data);
  const arcIds = startRows.map((s) => s.arc_id).filter((x): x is string => Boolean(x));
  let arcs: Arc[] = [];
  if (arcIds.length) {
    const { data: arcData } = await supabase.from("arcs").select("*").in("id", arcIds);
    arcs = many<Arc>(arcData);
  }
  const arcsById = new Map(arcs.map((a) => [a.id, a]));
  return startRows.map((s) => ({ ...s, arc: s.arc_id ? arcsById.get(s.arc_id) ?? null : null }));
}

export async function getRelationships(entityId: string): Promise<RelationshipWithEntity[]> {
  const supabase = await db();
  const { data } = await supabase.from("relationships").select("*").eq("entity_id", entityId);
  const relRows = many<Relationship>(data);
  const relatedIds = [...new Set(relRows.map((r) => r.related_id))];
  if (relatedIds.length === 0) return [];

  const { data: entData } = await supabase.from("entities").select("*").in("id", relatedIds);
  const entities = many<Entity>(entData);
  const publisherIds = [...new Set(entities.map((e) => e.publisher_id))];
  const { data: pubData } = await supabase.from("publishers").select("*").in("id", publisherIds);
  const enriched = attachPublisher(entities, many<Publisher>(pubData));
  const byId = new Map(enriched.map((e) => [e.id, e]));

  return relRows
    .map((rel) => {
      const related = byId.get(rel.related_id);
      return related ? { ...rel, related } : null;
    })
    .filter((r): r is RelationshipWithEntity => r !== null)
    .sort((a, b) => a.related.name.localeCompare(b.related.name));
}

export async function getMedia(entityId: string): Promise<MediaEntry[]> {
  const supabase = await db();
  const { data } = await supabase
    .from("media_entries")
    .select("*")
    .eq("entity_id", entityId)
    .order("watch_order", { ascending: true, nullsFirst: false })
    .order("release_year", { ascending: true });
  return many<MediaEntry>(data);
}

export async function getBibliography(entityId: string): Promise<BibliographyRow[]> {
  const { eras, arcs, reading } = await fetchTimelineRows(entityId);
  const erasById = new Map(eras.map((e) => [e.id, e]));
  const arcsById = new Map(arcs.map((a) => [a.id, a]));
  return reading.map((r) => {
    const arc = arcsById.get(r.arc_id);
    const era = arc ? erasById.get(arc.era_id) : undefined;
    return { ...r, arc_title: arc?.title ?? "", arc_slug: arc?.slug ?? "", era_title: era?.title ?? "" };
  });
}

export async function getTeamMembers(teamId: string): Promise<TeamMemberWithEntity[]> {
  const supabase = await db();
  const { data } = await supabase.from("team_members").select("*").eq("team_id", teamId);
  const memberRows = many<TeamMember>(data);
  if (memberRows.length === 0) return [];

  const charIds = [...new Set(memberRows.map((m) => m.character_id))];
  const eraIds = [...new Set(memberRows.map((m) => m.era_id).filter((x): x is string => Boolean(x)))];

  const [entRes, eraRes] = await Promise.all([
    supabase.from("entities").select("*").in("id", charIds),
    eraIds.length
      ? supabase.from("eras").select("*").in("id", eraIds)
      : Promise.resolve({ data: [] as unknown }),
  ]);
  const entities = many<Entity>(entRes.data);
  const publisherIds = [...new Set(entities.map((e) => e.publisher_id))];
  const { data: pubData } = await supabase.from("publishers").select("*").in("id", publisherIds);

  const byId = new Map(attachPublisher(entities, many<Publisher>(pubData)).map((e) => [e.id, e]));
  const erasById = new Map(many<Era>(eraRes.data).map((e) => [e.id, e]));

  return memberRows
    .map((m) => {
      const character = byId.get(m.character_id);
      if (!character) return null;
      return { ...m, character, era: m.era_id ? erasById.get(m.era_id) ?? null : null };
    })
    .filter((m): m is TeamMemberWithEntity => m !== null);
}

export async function getSearchIndex(): Promise<SearchRecord[]> {
  const supabase = await db();
  const [entRes, pubRes] = await Promise.all([
    supabase.from("entities").select("id, slug, name, entity_type, short_bio, publisher_id"),
    supabase.from("publishers").select("id, slug, name, color_hex"),
  ]);
  const entities = many<
    Pick<Entity, "id" | "slug" | "name" | "entity_type" | "short_bio" | "publisher_id">
  >(entRes.data);
  const publishers = many<Pick<Publisher, "id" | "slug" | "name" | "color_hex">>(pubRes.data);
  const byId = new Map(publishers.map((p) => [p.id, p]));

  return entities
    .map((e) => {
      const publisher = byId.get(e.publisher_id);
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
