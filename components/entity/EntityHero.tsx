import { Users } from "lucide-react";
import type { EntityWithPublisher } from "@/types";
import { EntityImage } from "@/components/ui/EntityImage";
import { PublisherLogo } from "@/components/ui/PublisherLogo";
import { Badge } from "@/components/ui/Badge";

/** Persistent cinematic hero shown above the entity tabs. */
export function EntityHero({ entity }: { entity: EntityWithPublisher }) {
  return (
    <section className="relative h-72 w-full overflow-hidden rounded-xl border border-border sm:h-80">
      <EntityImage
        coverImageUrl={entity.cover_image_url}
        name={entity.name}
        publisherColor={entity.publisher.color_hex}
        className="size-full"
        showInitials={false}
        priority
        sizes="100vw"
      />
      <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-bg via-bg/50 to-transparent" />

      <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7">
        <div className="mb-3 flex flex-wrap items-center gap-2.5">
          <PublisherLogo publisher={entity.publisher} size={32} className="max-h-8" />
          <span className="text-xs font-medium uppercase tracking-wide text-text-secondary">
            {entity.publisher.name}
          </span>
          <Badge variant="outline" className="gap-1.5">
            {entity.entity_type === "team" ? <Users className="size-3" /> : null}
            {entity.entity_type === "team" ? "Team" : "Character"}
          </Badge>
        </div>

        <h1 className="display text-5xl leading-none tracking-wide text-text-primary drop-shadow-sm sm:text-7xl">
          {entity.name}
        </h1>

        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 font-mono text-xs text-text-secondary">
          {entity.real_name ? (
            <span>
              <span className="text-text-secondary/60">Identity</span> {entity.real_name}
            </span>
          ) : null}
          {entity.first_appearance ? (
            <span>
              <span className="text-text-secondary/60">First appearance</span> {entity.first_appearance}
            </span>
          ) : null}
        </div>
      </div>
    </section>
  );
}
