import type { ReactNode } from "react";
import { cn } from "@/lib/ui/cn";

type BadgeVariant = "default" | "outline" | "accent" | "mono";

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
  /** Optional explicit color (e.g. publisher hex) applied as a left dot + text. */
  dotColor?: string | null;
}

const variants: Record<BadgeVariant, string> = {
  default: "bg-surface-alt text-text-secondary border border-border",
  outline: "border border-border text-text-secondary",
  accent: "bg-accent/10 text-accent border border-accent/30",
  mono: "font-mono bg-surface-alt text-text-secondary border border-border tabular",
};

/** Compact label chip used for arc types, formats, roles, metadata. */
export function Badge({ children, variant = "default", className, dotColor }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-sm px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide",
        variants[variant],
        className,
      )}
    >
      {dotColor ? (
        <span
          aria-hidden
          className="size-1.5 rounded-full"
          style={{ backgroundColor: dotColor }}
        />
      ) : null}
      {children}
    </span>
  );
}
