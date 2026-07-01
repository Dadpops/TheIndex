import "server-only";

import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "./config";
import type { Database } from "./types";

/**
 * Server Supabase client for React Server Components, Route Handlers, and
 * Server Actions. Reads/writes the auth session via Next.js cookies so that
 * admin routes can gate on Supabase Auth.
 */
export async function getServerClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set({ name, value, ...options });
          });
        } catch {
          // `setAll` from a Server Component is a no-op; middleware refreshes
          // the session instead. Safe to ignore.
        }
      },
    },
  });
}

/**
 * Service-role client — SERVER ONLY, bypasses RLS. Used by seed scripts and
 * trusted admin mutations. Returns null when the service key is absent.
 */
export function getServiceClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!SUPABASE_URL || !serviceKey) return null;

  return createServerClient<Database>(SUPABASE_URL, serviceKey, {
    cookies: { getAll: () => [], setAll: () => {} },
  });
}
