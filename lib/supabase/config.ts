// =============================================================================
// Supabase configuration gate.
// -----------------------------------------------------------------------------
// The presence of a public URL + anon key is what flips the data layer from the
// bundled local seed dataset to a live Supabase Postgres backend.
// =============================================================================

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/** True when a real Supabase project is configured. */
export const isSupabaseConfigured: boolean = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
