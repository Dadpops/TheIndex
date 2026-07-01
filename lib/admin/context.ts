import "server-only";

import { getServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getAllEntities } from "@/lib/data/repository";
import type { EntityWithPublisher } from "@/types";

/** Common admin page context: backend status + signed-in user email. */
export async function adminContext(): Promise<{ configured: boolean; userEmail: string | null }> {
  const configured = isSupabaseConfigured;
  let userEmail: string | null = null;
  if (configured) {
    const supabase = await getServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    userEmail = user?.email ?? null;
  }
  return { configured, userEmail };
}

export async function findEntityById(id: string): Promise<EntityWithPublisher | null> {
  const all = await getAllEntities();
  return all.find((e) => e.id === id) ?? null;
}
