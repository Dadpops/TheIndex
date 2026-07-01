import Link from "next/link";
import type { EntityWithPublisher, PublisherSlug } from "@/types";
import { entityHref } from "@/lib/ui/href";

/**
 * Card-specific publisher accent colors for the hero treatment. Keyed by
 * publisher slug (intentionally distinct from the stored `color_hex` / theme
 * tokens, which the rest of the app uses).
 */
const PUBLISHER_ACCENT: Record<PublisherSlug, string> = {
  dc: "#0078f0",
  marvel: "#ec1d24",
  image: "#5fad56",
  boom: "#f26522",
};

interface EntityCardProps {
  entity: EntityWithPublisher;
  /** Retained for call-site compatibility; the new design has no image slot. */
  priority?: boolean;
}

/**
 * Card for the publisher / library grids: an accent-tinted hero with the name
 * watermark + label, over a muted 3-line description.
 */
export function EntityCard({ entity }: EntityCardProps) {
  const accent = PUBLISHER_ACCENT[entity.publisher.slug] ?? entity.publisher.color_hex ?? "#2a2a35";

  return (
    <Link
      href={entityHref(entity.entity_type, entity.slug)}
      className="group flex flex-col overflow-hidden rounded-lg border border-border bg-surface transition-colors duration-150 hover:border-text-secondary/50"
    >
      {/* Hero: accent-tinted gradient + name watermark + name label */}
      <div
        className="relative h-[90px] overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(135deg, color-mix(in srgb, ${accent} 30%, var(--color-bg)) 0%, var(--color-surface) 60%)`,
        }}
      >
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 flex items-center justify-center whitespace-nowrap px-2 text-center text-4xl font-black uppercase leading-none tracking-tight"
          style={{ color: accent, opacity: 0.12 }}
        >
          {entity.name}
        </span>
        <h3 className="absolute bottom-0 left-0 max-w-full truncate p-3 text-lg font-medium text-white">
          {entity.name}
        </h3>
      </div>

      {/* Body: thin rule + muted description (3 lines max) */}
      <div className="flex-1 border-t border-border p-4">
        {entity.short_bio ? (
          <p className="line-clamp-3 text-sm leading-snug text-text-secondary">{entity.short_bio}</p>
        ) : null}
      </div>
    </Link>
  );
}
