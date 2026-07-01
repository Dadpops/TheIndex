import { ExternalLink } from "lucide-react";
import type { ReadingEntry } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { FORMAT_LABELS, FORMAT_ORDER } from "@/lib/ui/labels";

/** Groups reading entries by format (omnibus-first), preserving reading order. */
function groupByFormat(entries: ReadingEntry[]): [string, ReadingEntry[]][] {
  const groups = new Map<string, ReadingEntry[]>();
  for (const e of entries) {
    const list = groups.get(e.format) ?? [];
    list.push(e);
    groups.set(e.format, list);
  }
  return FORMAT_ORDER.filter((f) => groups.has(f)).map((f) => [
    FORMAT_LABELS[f],
    (groups.get(f) ?? []).sort((a, b) => a.reading_order - b.reading_order),
  ]);
}

export function ReadingEntryList({ entries }: { entries: ReadingEntry[] }) {
  if (entries.length === 0) {
    return <p className="text-sm text-text-secondary">No collected editions recorded yet.</p>;
  }
  const grouped = groupByFormat(entries);

  return (
    <div className="space-y-4">
      {grouped.map(([label, items]) => (
        <div key={label}>
          <p className="mb-1.5 font-mono text-[11px] uppercase tracking-wide text-text-secondary/70">
            {label}
          </p>
          <ul className="space-y-1.5">
            {items.map((entry) => (
              <li
                key={entry.id}
                className="flex items-start justify-between gap-3 rounded-md border border-border bg-surface px-3 py-2"
              >
                <div className="min-w-0">
                  <p className="text-sm text-text-primary">{entry.title}</p>
                  <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 font-mono text-[11px] text-text-secondary">
                    {entry.issue_range ? <span>{entry.issue_range}</span> : null}
                    {entry.isbn ? <span>ISBN {entry.isbn}</span> : null}
                    {entry.reading_order_note ? (
                      <span className="text-text-secondary/80">{entry.reading_order_note}</span>
                    ) : null}
                  </div>
                </div>
                {entry.purchase_url ? (
                  <a
                    href={entry.purchase_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-0.5 inline-flex shrink-0 items-center gap-1 text-xs text-text-secondary transition-colors hover:text-text-primary"
                  >
                    Buy <ExternalLink className="size-3" />
                  </a>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
