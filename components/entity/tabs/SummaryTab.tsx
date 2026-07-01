"use client";

import Link from "next/link";
import type { EntityWithPublisher, StartHereWithArc } from "@/types";
import { useStartHere } from "@/hooks/useStartHere";
import { useTeamMembers } from "@/hooks/useTeamMembers";
import { StartHereCards } from "@/components/entity/StartHereCards";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Skeleton } from "@/components/ui/states";
import { entityHref } from "@/lib/ui/href";
import { ROLE_LABELS } from "@/lib/ui/labels";

interface SummaryTabProps {
  entity: EntityWithPublisher;
  initialStartHere?: StartHereWithArc[];
}

export function SummaryTab({ entity, initialStartHere }: SummaryTabProps) {
  const { data: startHere, isLoading } = useStartHere(entity.slug, initialStartHere);

  return (
    <div className="space-y-10">
      {entity.short_bio ? (
        <p className="max-w-3xl text-lg leading-relaxed text-text-primary/90">{entity.short_bio}</p>
      ) : null}

      <section>
        <SectionHeading>Start Here</SectionHeading>
        {isLoading && !startHere ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-28" />
            ))}
          </div>
        ) : (
          <StartHereCards entries={startHere ?? []} />
        )}
      </section>

      {entity.entity_type === "team" ? (
        <FoundingRoster slug={entity.slug} />
      ) : entity.real_name ? (
        <section>
          <SectionHeading>Identity</SectionHeading>
          <p className="text-text-primary">
            <span className="font-mono text-sm text-text-secondary">Real name</span>{" "}
            <span className="font-medium">{entity.real_name}</span>
          </p>
        </section>
      ) : null}
    </div>
  );
}

/** Founding members roster shown in the team Summary. */
function FoundingRoster({ slug }: { slug: string }) {
  const { data, isLoading } = useTeamMembers(slug);
  const founders = (data ?? []).filter((m) => m.role === "founder" || m.role === "leader");
  const roster = founders.length > 0 ? founders : (data ?? []).slice(0, 6);

  if (isLoading && !data) {
    return (
      <section>
        <SectionHeading>Founding Roster</SectionHeading>
        <Skeleton className="h-10 w-full max-w-md" />
      </section>
    );
  }
  if (roster.length === 0) return null;

  return (
    <section>
      <SectionHeading>Founding Roster</SectionHeading>
      <div className="flex flex-wrap gap-2">
        {roster.map((m) => (
          <Link
            key={m.id}
            href={entityHref(m.character.entity_type, m.character.slug)}
            className="inline-flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-1.5 text-sm text-text-primary transition-colors hover:border-text-secondary/60"
          >
            <span
              className="size-2 rounded-full"
              style={{ backgroundColor: m.character.publisher.color_hex ?? "var(--color-border)" }}
            />
            {m.character.name}
            {m.role ? (
              <span className="font-mono text-[10px] uppercase text-text-secondary">
                {ROLE_LABELS[m.role]}
              </span>
            ) : null}
          </Link>
        ))}
      </div>
    </section>
  );
}
