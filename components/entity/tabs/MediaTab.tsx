"use client";

import { ExternalLink } from "lucide-react";
import type { MediaEntry, MediaType } from "@/types";
import { useMedia } from "@/hooks/useMedia";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { CardGridSkeleton, EmptyState, ErrorState } from "@/components/ui/states";
import { MEDIA_TYPE_LABELS, MEDIA_TYPE_ORDER } from "@/lib/ui/labels";

function group(entries: MediaEntry[]): [MediaType, MediaEntry[]][] {
  const groups = new Map<MediaType, MediaEntry[]>();
  for (const e of entries) {
    const list = groups.get(e.media_type) ?? [];
    list.push(e);
    groups.set(e.media_type, list);
  }
  // null watch_order sorts LAST, consistent with the data layer.
  const wo = (n: number | null) => n ?? Number.MAX_SAFE_INTEGER;
  return MEDIA_TYPE_ORDER.filter((t) => groups.has(t)).map((t) => [
    t,
    (groups.get(t) ?? []).sort(
      (a, b) => wo(a.watch_order) - wo(b.watch_order) || (a.release_year ?? 0) - (b.release_year ?? 0),
    ),
  ]);
}

export function MediaTab({ slug }: { slug: string }) {
  const { data, isLoading, isError, error } = useMedia(slug);

  if (isLoading) return <CardGridSkeleton />;
  if (isError) return <ErrorState message={error instanceof Error ? error.message : undefined} />;
  if (!data || data.length === 0) {
    return <EmptyState title="No media recorded yet." hint="Shows, films, games and more will appear here." />;
  }

  const grouped = group(data);

  return (
    <div className="space-y-10">
      {grouped.map(([type, items]) => (
        <section key={type}>
          <SectionHeading aside={<span className="font-mono text-xs text-text-secondary">{items.length}</span>}>
            {MEDIA_TYPE_LABELS[type]}
          </SectionHeading>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {items.map((m, index) => (
              <div
                key={m.id}
                className="flex items-start justify-between gap-3 rounded-lg border border-border bg-surface p-4"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    {/* Sequential position within this group (1,2,3…), NOT the raw watch_order. */}
                    <span className="display flex size-6 items-center justify-center rounded-sm border border-border bg-surface-alt text-sm leading-none text-text-secondary">
                      {index + 1}
                    </span>
                    <h4 className="font-medium text-text-primary">{m.title}</h4>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 font-mono text-[11px] text-text-secondary">
                    {m.release_year ? <span>{m.release_year}</span> : null}
                    {m.platform ? <span>{m.platform}</span> : null}
                  </div>
                  {m.notes ? <p className="mt-1.5 text-sm leading-snug text-text-secondary">{m.notes}</p> : null}
                </div>
                {m.where_to_watch && /^https?:\/\//.test(m.where_to_watch) ? (
                  <a
                    href={m.where_to_watch}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-0.5 inline-flex shrink-0 items-center gap-1 text-xs text-text-secondary transition-colors hover:text-text-primary"
                  >
                    Watch <ExternalLink className="size-3" />
                  </a>
                ) : m.where_to_watch ? (
                  <span className="mt-0.5 shrink-0 font-mono text-[11px] text-text-secondary/70">
                    {m.where_to_watch}
                  </span>
                ) : null}
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
