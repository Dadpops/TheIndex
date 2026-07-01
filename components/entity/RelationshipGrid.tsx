"use client";

import type { RelationshipType } from "@/types";
import { useRelationshipsByType } from "@/hooks/useRelationships";
import { RelationshipCard } from "@/components/entity/RelationshipCard";
import { CardGridSkeleton, EmptyState, ErrorState } from "@/components/ui/states";

interface RelationshipGridProps {
  slug: string;
  type: RelationshipType;
  emptyTitle: string;
  emptyHint?: string;
}

/** Shared grid for the Allies / Enemies tabs. */
export function RelationshipGrid({ slug, type, emptyTitle, emptyHint }: RelationshipGridProps) {
  const { data, isLoading, isError, error } = useRelationshipsByType(slug, type);

  if (isLoading) return <CardGridSkeleton />;
  if (isError) return <ErrorState message={error instanceof Error ? error.message : undefined} />;
  if (!data || data.length === 0) return <EmptyState title={emptyTitle} hint={emptyHint} />;

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {data.map((rel) => (
        <RelationshipCard
          key={rel.id}
          related={rel.related}
          summary={rel.summary}
          notes={rel.notes}
        />
      ))}
    </div>
  );
}
