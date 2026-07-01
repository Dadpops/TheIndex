"use client";

import { useQuery } from "@tanstack/react-query";
import type { EntityWithPublisher, Publisher } from "@/types";
import { fetchJson, queryKeys } from "@/lib/query/fetcher";

interface PublisherEntitiesResponse {
  publisher: Publisher;
  entities: EntityWithPublisher[];
}

/** All entities for a publisher page (characters + teams). */
export function usePublisherEntities(slug: string, initialData?: PublisherEntitiesResponse) {
  return useQuery({
    queryKey: queryKeys.publisherEntities(slug),
    queryFn: () => fetchJson<PublisherEntitiesResponse>(`/api/publishers/${slug}/entities`),
    enabled: Boolean(slug),
    initialData,
  });
}
