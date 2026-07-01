"use client";

import { useArcs } from "@/hooks/useArcs";
import { EraAccordion } from "@/components/entity/EraAccordion";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/states";

export function TimelineTab({ slug }: { slug: string }) {
  const { data, isLoading, isError, error } = useArcs(slug);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-16" />
        ))}
      </div>
    );
  }
  if (isError) return <ErrorState message={error instanceof Error ? error.message : undefined} />;
  if (!data || data.length === 0) {
    return <EmptyState title="No timeline yet." hint="Eras and arcs will appear here once added." />;
  }

  return (
    <div className="divide-y divide-border">
      {data.map((era, i) => (
        <EraAccordion key={era.id} era={era} defaultOpen={i === 0} />
      ))}
    </div>
  );
}
