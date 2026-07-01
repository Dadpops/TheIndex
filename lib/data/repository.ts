// =============================================================================
// Data repository — backend switch.
// -----------------------------------------------------------------------------
// Server-side data access for the whole app. Selects the live Supabase backend
// when configured, otherwise the bundled local seed. Both implement the same
// async interface, so callers (RSC pages, route handlers) never branch.
// =============================================================================

import "server-only";

import { isSupabaseConfigured } from "@/lib/supabase/config";
import * as local from "./local";
import * as remote from "./supabase-repo";

const backend = isSupabaseConfigured ? remote : local;

export const repository = backend;

/** Which backend is active — surfaced in the UI footer / admin dashboard. */
export const dataSource: "supabase" | "local" = isSupabaseConfigured ? "supabase" : "local";

export const {
  getPublishersWithCounts,
  getPublisherBySlug,
  getEntitiesByPublisherSlug,
  getAllEntities,
  getEntityBySlug,
  getTimeline,
  getStartHere,
  getRelationships,
  getMedia,
  getBibliography,
  getTeamMembers,
  getSearchIndex,
} = backend;
