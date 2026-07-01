import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { PublisherWithCounts } from "@/types";
import { PublisherLogo } from "@/components/ui/PublisherLogo";

/** The four publisher entry points on the library home. */
export function PublisherGrid({ publishers }: { publishers: PublisherWithCounts[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {publishers.map((p) => (
        <Link
          key={p.id}
          href={`/${p.slug}`}
          className="group relative overflow-hidden rounded-xl border border-border bg-surface p-6 transition-colors duration-150 hover:border-text-secondary/50"
        >
          {/* Publisher color spine */}
          <span
            aria-hidden
            className="absolute inset-y-0 left-0 w-1.5"
            style={{ backgroundColor: p.color_hex ?? "var(--color-border)" }}
          />
          <ArrowUpRight className="absolute right-5 top-5 size-5 text-text-secondary transition-transform duration-150 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-text-primary" />
          <div className="flex flex-col items-center gap-4 py-2 text-center">
            <PublisherLogo publisher={p} size={80} className="max-h-20" />
            <div>
              <h2 className="display text-3xl tracking-wide text-text-primary sm:text-4xl">{p.name}</h2>
              <p className="mt-2 font-mono text-sm text-text-secondary tabular">
                {p.character_count} {p.character_count === 1 ? "Character" : "Characters"}
                <span className="mx-2 text-border">·</span>
                {p.team_count} {p.team_count === 1 ? "Team" : "Teams"}
              </p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
