"use client";

import { useQuery } from "@tanstack/react-query";
import type { RelationshipType, RelationshipWithEntity } from "@/types";
import { fetchJson, queryKeys } from "@/lib/query/fetcher";

/** All relationships (allies, enemies, rivals, members) for an entity. */
export function useRelationships(slug: string) {
  return useQuery({
    queryKey: queryKeys.relationships(slug),
    queryFn: () => fetchJson<RelationshipWithEntity[]>(`/api/entities/${slug}/relationships`),
    enabled: Boolean(slug),
  });
}

/** Convenience selector — filters relationships to a single type. */
export function useRelationshipsByType(slug: string, type: RelationshipType) {
  return useQuery({
    queryKey: [...queryKeys.relationships(slug), type] as const,
    queryFn: () => fetchJson<RelationshipWithEntity[]>(`/api/entities/${slug}/relationships`),
    enabled: Boolean(slug),
    select: (data) => data.filter((r) => r.relationship === type),
  });
}
