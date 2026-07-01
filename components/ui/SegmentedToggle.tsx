"use client";

import { cn } from "@/lib/ui/cn";

interface Segment<T extends string> {
  value: T;
  label: string;
  count?: number;
}

interface SegmentedToggleProps<T extends string> {
  value: T;
  options: Segment<T>[];
  onChange: (value: T) => void;
  size?: "sm" | "md";
  "aria-label"?: string;
}

/** Two-or-more state segmented control (Characters/Teams, Reading/Publication). */
export function SegmentedToggle<T extends string>({
  value,
  options,
  onChange,
  size = "md",
  ...rest
}: SegmentedToggleProps<T>) {
  return (
    <div
      role="tablist"
      aria-label={rest["aria-label"]}
      className="inline-flex items-center gap-1 rounded-md border border-border bg-surface p-1"
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(opt.value)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-sm font-medium transition-colors duration-150",
              size === "sm" ? "px-2.5 py-1 text-xs" : "px-3 py-1.5 text-sm",
              active
                ? "bg-surface-alt text-text-primary"
                : "text-text-secondary hover:text-text-primary",
            )}
          >
            {opt.label}
            {typeof opt.count === "number" ? (
              <span className={cn("font-mono text-[11px]", active ? "text-text-primary" : "text-text-secondary/70")}>
                {opt.count}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
