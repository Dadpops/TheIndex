"use client";

import { useQuery } from "@tanstack/react-query";
import type { EraWithArcs } from "@/types";
import { fetchJson, queryKeys } from "@/lib/query/fetcher";

/**
 * Timeline data — eras with their arcs and grouped reading entries. Loads
 * lazily when the Timeline tab first mounts; cached for the session thereafter.
 */
export function useArcs(slug: string) {
  return useQuery({
    queryKey: queryKeys.timeline(slug),
    queryFn: () => fetchJson<EraWithArcs[]>(`/api/entities/${slug}/timeline`),
    enabled: Boolean(slug),
  });
}
