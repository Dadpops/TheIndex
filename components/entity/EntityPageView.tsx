import type { EntityWithPublisher, StartHereWithArc } from "@/types";
import { EntityHero } from "@/components/entity/EntityHero";
import { EntityTabs } from "@/components/entity/EntityTabs";

interface EntityPageViewProps {
  entity: EntityWithPublisher;
  startHere: StartHereWithArc[];
}

/** Shared layout for /character/[slug] and /team/[slug]. */
export function EntityPageView({ entity, startHere }: EntityPageViewProps) {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <EntityHero entity={entity} />
      <div className="mt-8">
        <EntityTabs entity={entity} initialStartHere={startHere} />
      </div>
    </div>
  );
}
