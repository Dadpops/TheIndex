import Link from "next/link";
import type { EntityWithPublisher } from "@/types";
import { EntityImage } from "@/components/ui/EntityImage";
import { PublisherBadge } from "@/components/ui/PublisherBadge";
import { entityHref } from "@/lib/ui/href";

interface RelationshipCardProps {
  related: EntityWithPublisher;
  summary: string;
  notes?: string | null;
  /** Optional badge text (relationship role / type). */
  tag?: string;
}

/** Card linking to a related entity (ally, enemy, rival, or team member). */
export function RelationshipCard({ related, summary, notes, tag }: RelationshipCardProps) {
  return (
    <Link
      href={entityHref(related.entity_type, related.slug)}
      className="group flex gap-3 rounded-lg border border-border bg-surface p-3 transition-colors duration-150 hover:border-text-secondary/50"
    >
      <EntityImage
        coverImageUrl={related.cover_image_url}
        name={related.name}
        publisherColor={related.publisher.color_hex}
        className="size-20 shrink-0 rounded-md"
        sizes="80px"
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <h4 className="display truncate text-lg tracking-wide text-text-primary decoration-accent decoration-2 underline-offset-2 group-hover:underline">
            {related.name}
          </h4>
          {tag ? (
            <span className="shrink-0 rounded-sm border border-border px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-text-secondary">
              {tag}
            </span>
          ) : null}
        </div>
        <p className="mt-0.5 line-clamp-2 text-sm leading-snug text-text-secondary">{summary}</p>
        {notes ? <p className="mt-1 line-clamp-2 text-xs leading-snug text-text-secondary/70">{notes}</p> : null}
        <div className="mt-1.5">
          <PublisherBadge name={related.publisher.name} color={related.publisher.color_hex} />
        </div>
      </div>
    </Link>
  );
}
