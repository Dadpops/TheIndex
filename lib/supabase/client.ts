"use client";

import { createBrowserClient } from "@supabase/ssr";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "./config";
import type { Database } from "./types";

/**
 * Browser Supabase client (singleton). Only meaningful when Supabase is
 * configured; the data layer guards on `isSupabaseConfigured` before use.
 */
let browserClient: ReturnType<typeof createBrowserClient<Database>> | null = null;

export function getBrowserClient() {
  if (!browserClient) {
    browserClient = createBrowserClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return browserClient;
}
