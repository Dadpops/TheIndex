"use client";

import { useQuery } from "@tanstack/react-query";
import type { StartHereWithArc } from "@/types";
import { fetchJson, queryKeys } from "@/lib/query/fetcher";

/** The 3 curated entry points for an entity. */
export function useStartHere(slug: string, initialData?: StartHereWithArc[]) {
  return useQuery({
    queryKey: queryKeys.startHere(slug),
    queryFn: () => fetchJson<StartHereWithArc[]>(`/api/entities/${slug}/start-here`),
    enabled: Boolean(slug),
    initialData,
  });
}
