"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { EraWithArcs } from "@/types";
import { ArcCard } from "@/components/entity/ArcCard";
import { cn } from "@/lib/ui/cn";
import { yearRange } from "@/lib/ui/labels";

/**
 * One era strip on the Timeline. The accent yellow rail marks the active
 * (open) era — the one signature accent use on this screen.
 */
export function EraAccordion({ era, defaultOpen = false }: { era: EraWithArcs; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const years = yearRange(era.start_year, era.end_year);

  return (
    <div className="relative">
      <span
        aria-hidden
        className={cn(
          "absolute inset-y-0 left-0 w-0.5 rounded-full transition-colors duration-150",
          open ? "bg-accent" : "bg-border",
        )}
      />
      <div className="pl-4">
        <button
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="flex w-full items-center gap-3 py-3 text-left"
        >
          <ChevronDown
            className={cn(
              "size-4 shrink-0 text-text-secondary transition-transform duration-150",
              open && "rotate-180",
            )}
          />
          <div className="flex flex-1 flex-wrap items-baseline gap-x-3 gap-y-1">
            <h3 className="display text-2xl tracking-wide text-text-primary">{era.title}</h3>
            {years ? <span className="font-mono text-xs text-text-secondary tabular">{years}</span> : null}
            <span className="font-mono text-[11px] text-text-secondary/70">
              {era.arcs.length} {era.arcs.length === 1 ? "arc" : "arcs"}
            </span>
          </div>
        </button>

        {open ? (
          <div className="space-y-3 pb-6 pl-7">
            {era.summary ? (
              <p className="text-sm leading-relaxed text-text-secondary">{era.summary}</p>
            ) : null}
            {era.arcs.map((arc) => (
              <ArcCard key={arc.id} arc={arc} />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
