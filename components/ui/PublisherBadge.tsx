import { cn } from "@/lib/ui/cn";

interface PublisherBadgeProps {
  name: string;
  color?: string | null;
  className?: string;
  size?: "sm" | "md";
}

/** Publisher pill with the publisher's signature color dot. */
export function PublisherBadge({ name, color, className, size = "sm" }: PublisherBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-sm border border-border bg-surface/80 font-medium uppercase tracking-wide text-text-secondary",
        size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs",
        className,
      )}
    >
      <span
        aria-hidden
        className="size-2 rounded-full"
        style={{ backgroundColor: color ?? "var(--color-border)" }}
      />
      {name}
    </span>
  );
}
