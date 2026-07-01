import { Compass } from "lucide-react";
import type { StartHereWithArc } from "@/types";

/** The 3 curated entry points. The accent number marks the recommended order. */
export function StartHereCards({ entries }: { entries: StartHereWithArc[] }) {
  if (entries.length === 0) {
    return (
      <p className="text-sm text-text-secondary">No curated entry points recorded yet.</p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {entries.map((entry) => (
        <div
          key={entry.id}
          className="flex flex-col gap-2 rounded-lg border border-border bg-surface p-4"
        >
          <div className="flex items-center gap-2.5">
            <span className="display flex size-7 items-center justify-center rounded-sm border border-border bg-surface-alt text-lg leading-none text-text-primary">
              {entry.order_index}
            </span>
            <span className="text-xs font-semibold uppercase tracking-wide text-text-primary">
              {entry.label}
            </span>
          </div>
          {entry.arc ? (
            <div className="flex items-start gap-1.5 text-sm font-medium text-text-primary">
              <Compass className="mt-0.5 size-3.5 shrink-0 text-text-secondary" />
              {entry.arc.title}
            </div>
          ) : null}
          <p className="text-sm leading-snug text-text-secondary">{entry.reason}</p>
        </div>
      ))}
    </div>
  );
}
