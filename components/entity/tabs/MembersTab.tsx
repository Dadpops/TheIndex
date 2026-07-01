"use client";

import { useMemo } from "react";
import type { TeamMemberWithEntity } from "@/types";
import { useTeamMembers } from "@/hooks/useTeamMembers";
import { RelationshipCard } from "@/components/entity/RelationshipCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { CardGridSkeleton, EmptyState, ErrorState } from "@/components/ui/states";
import { ROLE_LABELS } from "@/lib/ui/labels";

/** Groups members by era (era title; null → "All Eras"), preserving order. */
function groupByEra(members: TeamMemberWithEntity[]): [string, number, TeamMemberWithEntity[]][] {
  const groups = new Map<string, { order: number; items: TeamMemberWithEntity[] }>();
  for (const m of members) {
    const key = m.era ? m.era.title : "All Eras";
    const order = m.era ? m.era.order_index : -1;
    const g = groups.get(key) ?? { order, items: [] };
    g.items.push(m);
    groups.set(key, g);
  }
  return [...groups.entries()]
    .sort((a, b) => a[1].order - b[1].order)
    .map(([title, g]) => [title, g.order, g.items]);
}

export function MembersTab({ slug }: { slug: string }) {
  const { data, isLoading, isError, error } = useTeamMembers(slug);
  const grouped = useMemo(() => (data ? groupByEra(data) : []), [data]);

  if (isLoading) return <CardGridSkeleton />;
  if (isError) return <ErrorState message={error instanceof Error ? error.message : undefined} />;
  if (!data || data.length === 0) {
    return <EmptyState title="No roster recorded yet." hint="Members will appear here grouped by era." />;
  }

  return (
    <div className="space-y-10">
      {grouped.map(([title, , items]) => (
        <section key={title}>
          <SectionHeading aside={<span className="font-mono text-xs text-text-secondary">{items.length}</span>}>
            {title}
          </SectionHeading>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {items.map((m) => (
              <RelationshipCard
                key={m.id}
                related={m.character}
                summary={m.notes ?? `${m.character.name} — ${m.role ? ROLE_LABELS[m.role] : "member"}.`}
                tag={m.role ? ROLE_LABELS[m.role] : undefined}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
