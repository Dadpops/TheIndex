"use client";

import { useQuery } from "@tanstack/react-query";
import type { EntityWithPublisher } from "@/types";
import { fetchJson, queryKeys } from "@/lib/query/fetcher";

/** Base entity + publisher. Usually seeded with server data via initialData. */
export function useEntity(slug: string, initialData?: EntityWithPublisher) {
  return useQuery({
    queryKey: queryKeys.entity(slug),
    queryFn: () => fetchJson<EntityWithPublisher>(`/api/entities/${slug}`),
    enabled: Boolean(slug),
    initialData,
  });
}
