import Link from "next/link";
import { Users } from "lucide-react";
import type { SearchRecord } from "@/types";
import { cn } from "@/lib/ui/cn";
import { entityHref } from "@/lib/ui/href";

interface SearchResultRowProps {
  record: SearchRecord;
  active?: boolean;
  onHover?: () => void;
}

/** Single search result row — publisher color dot, name, type, bio snippet. */
export function SearchResultRow({ record, active = false, onHover }: SearchResultRowProps) {
  return (
    <Link
      href={entityHref(record.entity_type, record.slug)}
      onMouseEnter={onHover}
      data-active={active}
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2.5 transition-colors duration-150",
        active ? "bg-surface-alt" : "hover:bg-surface-alt/60",
      )}
    >
      <span
        aria-hidden
        className="size-2.5 shrink-0 rounded-full"
        style={{ backgroundColor: record.publisher_color ?? "var(--color-border)" }}
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate font-medium text-text-primary">{record.name}</span>
          {record.entity_type === "team" ? (
            <Users className="size-3.5 shrink-0 text-text-secondary" aria-label="Team" />
          ) : null}
        </div>
        {record.short_bio ? (
          <p className="truncate text-xs text-text-secondary">{record.short_bio}</p>
        ) : null}
      </div>
      <span className="shrink-0 font-mono text-[10px] uppercase tracking-wide text-text-secondary/70">
        {record.publisher_name}
      </span>
    </Link>
  );
}
