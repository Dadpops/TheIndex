import type { ReactNode } from "react";
import { cn } from "@/lib/ui/cn";

interface SectionHeadingProps {
  children: ReactNode;
  /** Right-aligned slot for controls (filters, counts). */
  aside?: ReactNode;
  className?: string;
}

/** Editorial section heading — condensed display type with a hairline rule. */
export function SectionHeading({ children, aside, className }: SectionHeadingProps) {
  return (
    <div className={cn("mb-4 flex items-end justify-between gap-4 border-b border-border pb-2", className)}>
      <h2 className="display text-xl tracking-wide text-text-primary sm:text-2xl">{children}</h2>
      {aside ? <div className="flex items-center gap-2 pb-1">{aside}</div> : null}
    </div>
  );
}
