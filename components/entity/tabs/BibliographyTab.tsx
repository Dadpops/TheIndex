"use client";

import { useMemo, useState } from "react";
import { ExternalLink } from "lucide-react";
import type { BibliographyRow, ReadingFormat } from "@/types";
import { useBibliography } from "@/hooks/useBibliography";
import { Badge } from "@/components/ui/Badge";
import { SegmentedToggle } from "@/components/ui/SegmentedToggle";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/states";
import { FORMAT_LABELS, FORMAT_ORDER } from "@/lib/ui/labels";

type SortMode = "reading" | "publication";
type FormatFilter = ReadingFormat | "all";

export function BibliographyTab({ slug }: { slug: string }) {
  const { data, isLoading, isError, error } = useBibliography(slug);
  const [sort, setSort] = useState<SortMode>("reading");
  const [format, setFormat] = useState<FormatFilter>("all");

  const availableFormats = useMemo(() => {
    const present = new Set((data ?? []).map((r) => r.format));
    return FORMAT_ORDER.filter((f) => present.has(f));
  }, [data]);

  const rows = useMemo(() => {
    let list = data ?? [];
    if (format !== "all") list = list.filter((r) => r.format === format);
    return [...list].sort((a, b) =>
      sort === "reading" ? a.reading_order - b.reading_order : a.publication_order - b.publication_order,
    );
  }, [data, format, sort]);

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-12" />
        ))}
      </div>
    );
  }
  if (isError) return <ErrorState message={error instanceof Error ? error.message : undefined} />;
  if (!data || data.length === 0) {
    return <EmptyState title="No reading entries yet." hint="Collected editions will appear here." />;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SegmentedToggle<SortMode>
          aria-label="Sort order"
          size="sm"
          value={sort}
          onChange={setSort}
          options={[
            { value: "reading", label: "Reading Order" },
            { value: "publication", label: "Publication Order" },
          ]}
        />
        <div className="flex flex-wrap items-center gap-1.5">
          <FilterChip active={format === "all"} onClick={() => setFormat("all")}>
            All
          </FilterChip>
          {availableFormats.map((f) => (
            <FilterChip key={f} active={format === f} onClick={() => setFormat(f)}>
              {FORMAT_LABELS[f]}
            </FilterChip>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface text-left font-mono text-[11px] uppercase tracking-wide text-text-secondary">
              <th className="w-12 px-3 py-2 text-right">#</th>
              <th className="px-3 py-2">Edition</th>
              <th className="hidden px-3 py-2 md:table-cell">Arc</th>
              <th className="px-3 py-2">Format</th>
              <th className="hidden px-3 py-2 sm:table-cell">Issues</th>
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <BibRow key={row.id} row={row} order={sort === "reading" ? row.reading_order : row.publication_order} />
            ))}
          </tbody>
        </table>
      </div>
      <p className="font-mono text-xs text-text-secondary tabular">
        {rows.length} {rows.length === 1 ? "edition" : "editions"}
      </p>
    </div>
  );
}

function BibRow({ row, order }: { row: BibliographyRow; order: number }) {
  return (
    <tr className="border-b border-border/60 last:border-0 hover:bg-surface/50">
      <td className="px-3 py-2.5 text-right font-mono text-text-secondary tabular">{order}</td>
      <td className="px-3 py-2.5 text-text-primary">{row.title}</td>
      <td className="hidden px-3 py-2.5 text-text-secondary md:table-cell">{row.arc_title}</td>
      <td className="px-3 py-2.5">
        <Badge>{FORMAT_LABELS[row.format]}</Badge>
      </td>
      <td className="hidden px-3 py-2.5 font-mono text-xs text-text-secondary sm:table-cell">
        {row.issue_range ?? "—"}
      </td>
      <td className="px-3 py-2.5 text-right">
        {row.purchase_url ? (
          <a
            href={row.purchase_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-text-secondary transition-colors hover:text-text-primary"
          >
            Buy <ExternalLink className="size-3" />
          </a>
        ) : null}
      </td>
    </tr>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={
        "rounded-sm border px-2 py-1 text-xs transition-colors duration-150 " +
        (active
          ? "border-text-secondary/50 bg-surface-alt text-text-primary"
          : "border-border bg-surface text-text-secondary hover:text-text-primary")
      }
    >
      {children}
    </button>
  );
}
