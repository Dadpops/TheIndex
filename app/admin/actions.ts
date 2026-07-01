"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export interface ActionState {
  ok: boolean;
  error?: string;
  message?: string;
  id?: string;
}

// -----------------------------------------------------------------------------
// Typed write surface.
// The @supabase/ssr typed client collapses insert/update payloads to `never`
// in this version, so we cast the client to this minimal, explicitly-typed
// interface for writes. Reads elsewhere cast their results similarly. This is
// the single, documented boundary where the degraded generic is bypassed.
// -----------------------------------------------------------------------------
type Payload = Record<string, string | number | boolean | null>;
type Resp = { error: { message: string; code?: string } | null };
interface InsertResult extends PromiseLike<Resp> {
  select(columns: string): { maybeSingle(): Promise<{ data: { id: string } | null; error: { message: string; code?: string } | null }> };
}
interface UpdateResult extends PromiseLike<Resp> {
  eq(column: string, value: string): PromiseLike<Resp>;
}
interface DeleteResult {
  eq(column: string, value: string): PromiseLike<Resp>;
}
interface WriteBuilder {
  insert(values: Payload): InsertResult;
  update(values: Payload): UpdateResult;
  delete(): DeleteResult;
}
interface WriteClient {
  from(table: string): WriteBuilder;
}

/** Resolve an authenticated, writable client or an error explaining why not. */
async function writable(): Promise<{ db: WriteClient | null; error: string | null }> {
  if (!isSupabaseConfigured) {
    return {
      db: null,
      error: "Editing requires a configured Supabase backend. Add NEXT_PUBLIC_SUPABASE_URL + keys to .env.local.",
    };
  }
  const client = await getServerClient();
  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user) return { db: null, error: "You must be signed in." };
  return { db: client as unknown as WriteClient, error: null };
}

function str(form: FormData, key: string): string {
  return String(form.get(key) ?? "").trim();
}
function optStr(form: FormData, key: string): string | null {
  const v = str(form, key);
  return v.length ? v : null;
}
function optInt(form: FormData, key: string): number | null {
  const v = str(form, key);
  if (!v) return null;
  const n = Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : null;
}
function reqInt(form: FormData, key: string, fallback = 0): number {
  return optInt(form, key) ?? fallback;
}

export async function signOut(): Promise<void> {
  if (isSupabaseConfigured) {
    const client = await getServerClient();
    await client.auth.signOut();
  }
  redirect("/admin/login");
}

export async function saveEntity(_prev: ActionState, form: FormData): Promise<ActionState> {
  const { db, error } = await writable();
  if (!db) return { ok: false, error: error ?? "Unavailable." };

  const id = optStr(form, "id");
  const slug = str(form, "slug");
  const name = str(form, "name");
  const entity_type = str(form, "entity_type");
  const publisher_id = optStr(form, "publisher_id");

  if (!slug || !name) return { ok: false, error: "Slug and name are required." };
  if (!/^[a-z0-9-]+$/.test(slug)) return { ok: false, error: "Slug must be lowercase kebab-case (a-z, 0-9, -)." };
  if (entity_type !== "character" && entity_type !== "team") return { ok: false, error: "Invalid entity type." };

  const payload: Payload = {
    slug,
    name,
    entity_type,
    publisher_id,
    real_name: optStr(form, "real_name"),
    first_appearance: optStr(form, "first_appearance"),
    logo_url: optStr(form, "logo_url"),
    cover_image_url: optStr(form, "cover_image_url"),
    short_bio: optStr(form, "short_bio"),
  };

  let savedId = id ?? undefined;
  if (id) {
    const { error: dbError } = await db.from("entities").update(payload).eq("id", id);
    if (dbError) return { ok: false, error: friendly(dbError, slug) };
  } else {
    const { data, error: dbError } = await db.from("entities").insert(payload).select("id").maybeSingle();
    if (dbError) return { ok: false, error: friendly(dbError, slug) };
    savedId = data?.id ?? undefined;
  }

  revalidatePath("/admin");
  revalidatePath(`/character/${slug}`);
  revalidatePath(`/team/${slug}`);
  return { ok: true, message: "Saved.", id: savedId };
}

function friendly(dbError: { message: string; code?: string }, slug: string): string {
  return dbError.code === "23505" ? `Slug “${slug}” is already taken.` : dbError.message;
}

export async function deleteRow(table: string, id: string): Promise<ActionState> {
  const { db, error } = await writable();
  if (!db) return { ok: false, error: error ?? "Unavailable." };
  const allowed = ["entities", "eras", "arcs", "reading_entries", "start_here", "relationships", "media_entries", "team_members"];
  if (!allowed.includes(table)) return { ok: false, error: "Unknown table." };

  const { error: dbError } = await db.from(table).delete().eq("id", id);
  if (dbError) return { ok: false, error: dbError.message };
  revalidatePath("/admin");
  return { ok: true, message: "Deleted." };
}

async function upsert(
  db: WriteClient,
  table: string,
  id: string | null,
  payload: Payload,
): Promise<Resp> {
  return id ? db.from(table).update(payload).eq("id", id) : db.from(table).insert(payload);
}

export async function saveEra(_prev: ActionState, form: FormData): Promise<ActionState> {
  const { db, error } = await writable();
  if (!db) return { ok: false, error: error ?? "Unavailable." };

  const entity_id = str(form, "entity_id");
  const slug = str(form, "slug");
  const title = str(form, "title");
  if (!entity_id || !slug || !title) return { ok: false, error: "Entity, slug and title are required." };

  const payload: Payload = {
    entity_id,
    slug,
    title,
    start_year: optInt(form, "start_year"),
    end_year: optInt(form, "end_year"),
    order_index: reqInt(form, "order_index", 1),
    summary: optStr(form, "summary"),
  };
  const { error: dbError } = await upsert(db, "eras", optStr(form, "id"), payload);
  if (dbError) return { ok: false, error: dbError.message };

  revalidatePath(`/admin/entities/${entity_id}/eras`);
  return { ok: true, message: "Era saved." };
}

export async function saveArc(_prev: ActionState, form: FormData): Promise<ActionState> {
  const { db, error } = await writable();
  if (!db) return { ok: false, error: error ?? "Unavailable." };

  const era_id = str(form, "era_id");
  const slug = str(form, "slug");
  const title = str(form, "title");
  const logline = str(form, "logline");
  const summary = str(form, "summary");
  if (!era_id || !slug || !title) return { ok: false, error: "Era, slug and title are required." };
  if (!logline || !summary) return { ok: false, error: "Logline and summary are required." };

  const payload: Payload = {
    era_id,
    slug,
    title,
    logline,
    summary,
    spoiler: optStr(form, "spoiler"),
    arc_type: str(form, "arc_type"),
    start_year: optInt(form, "start_year"),
    end_year: optInt(form, "end_year"),
    order_index: reqInt(form, "order_index", 1),
  };
  const { error: dbError } = await upsert(db, "arcs", optStr(form, "id"), payload);
  if (dbError) return { ok: false, error: dbError.message };

  const entity_id = optStr(form, "entity_id");
  if (entity_id) revalidatePath(`/admin/entities/${entity_id}/eras`);
  return { ok: true, message: "Arc saved." };
}

export async function saveMedia(_prev: ActionState, form: FormData): Promise<ActionState> {
  const { db, error } = await writable();
  if (!db) return { ok: false, error: error ?? "Unavailable." };

  const entity_id = str(form, "entity_id");
  const media_type = str(form, "media_type");
  const title = str(form, "title");
  if (!entity_id || !title || !media_type) return { ok: false, error: "Entity, type and title are required." };

  const payload: Payload = {
    entity_id,
    media_type,
    title,
    release_year: optInt(form, "release_year"),
    watch_order: optInt(form, "watch_order"),
    platform: optStr(form, "platform"),
    notes: optStr(form, "notes"),
    where_to_watch: optStr(form, "where_to_watch"),
  };
  const { error: dbError } = await upsert(db, "media_entries", optStr(form, "id"), payload);
  if (dbError) return { ok: false, error: dbError.message };

  revalidatePath(`/admin/entities/${entity_id}/media`);
  return { ok: true, message: "Media saved." };
}

export async function saveRelationship(_prev: ActionState, form: FormData): Promise<ActionState> {
  const { db, error } = await writable();
  if (!db) return { ok: false, error: error ?? "Unavailable." };

  const entity_id = str(form, "entity_id");
  const related_id = str(form, "related_id");
  const summary = str(form, "summary");
  const notes = str(form, "notes");
  if (!entity_id || !related_id) return { ok: false, error: "Both entities are required." };
  if (entity_id === related_id) return { ok: false, error: "An entity cannot relate to itself." };
  if (!summary || !notes) return { ok: false, error: "Summary and notes are required." };

  const payload: Payload = {
    entity_id,
    related_id,
    relationship: str(form, "relationship"),
    summary,
    notes,
  };
  const { error: dbError } = await upsert(db, "relationships", optStr(form, "id"), payload);
  if (dbError) return { ok: false, error: dbError.message };

  revalidatePath(`/admin/entities/${entity_id}/relationships`);
  return { ok: true, message: "Relationship saved." };
}
