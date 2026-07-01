"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { ArcWithReading } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { SpoilerToggle } from "@/components/entity/SpoilerToggle";
import { ReadingEntryList } from "@/components/entity/ReadingEntryList";
import { cn } from "@/lib/ui/cn";
import { arcTypeLabel, yearRange } from "@/lib/ui/labels";

export function ArcCard({ arc }: { arc: ArcWithReading }) {
  const [open, setOpen] = useState(false);
  const years = yearRange(arc.start_year, arc.end_year);

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-surface/60">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-start gap-3 p-4 text-left transition-colors hover:bg-surface-alt/40"
      >
        <ChevronDown
          className={cn(
            "mt-1 size-4 shrink-0 text-text-secondary transition-transform duration-150",
            open && "rotate-180",
          )}
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="font-semibold text-text-primary">{arc.title}</h4>
            <Badge variant="default">{arcTypeLabel(arc.arc_type)}</Badge>
            {years ? <span className="font-mono text-[11px] text-text-secondary tabular">{years}</span> : null}
          </div>
          <p className="mt-1 text-sm leading-snug text-text-secondary">{arc.logline}</p>
        </div>
      </button>

      {open ? (
        <div className="space-y-4 border-t border-border px-4 py-4 pl-11">
          <div className="space-y-3 text-sm leading-relaxed text-text-primary/90">
            {arc.summary.split(/\n\n+/).map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>

          {arc.spoiler ? <SpoilerToggle spoiler={arc.spoiler} /> : null}

          <div>
            <p className="mb-2 font-mono text-[11px] uppercase tracking-wide text-text-secondary/70">
              How to read it
            </p>
            <ReadingEntryList entries={arc.reading_entries} />
          </div>
        </div>
      ) : null}
    </div>
  );
}
