"use client";

import { useQuery } from "@tanstack/react-query";
import type { MediaEntry } from "@/types";
import { fetchJson, queryKeys } from "@/lib/query/fetcher";

/** All non-comics media entries for an entity. */
export function useMedia(slug: string) {
  return useQuery({
    queryKey: queryKeys.media(slug),
    queryFn: () => fetchJson<MediaEntry[]>(`/api/entities/${slug}/media`),
    enabled: Boolean(slug),
  });
}
