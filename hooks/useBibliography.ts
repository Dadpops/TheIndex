"use client";

import { useQuery } from "@tanstack/react-query";
import type { BibliographyRow } from "@/types";
import { fetchJson, queryKeys } from "@/lib/query/fetcher";

/** The full, flattened reading list across every arc for an entity. */
export function useBibliography(slug: string) {
  return useQuery({
    queryKey: queryKeys.bibliography(slug),
    queryFn: () => fetchJson<BibliographyRow[]>(`/api/entities/${slug}/bibliography`),
    enabled: Boolean(slug),
  });
}
