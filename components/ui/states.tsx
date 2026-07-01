import type { ReactNode } from "react";
import { cn } from "@/lib/ui/cn";

export function EmptyState({
  title,
  hint,
  icon,
}: {
  title: string;
  hint?: string;
  icon?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-surface/40 px-6 py-12 text-center">
      {icon ? <div className="text-text-secondary/60">{icon}</div> : null}
      <p className="text-sm font-medium text-text-primary">{title}</p>
      {hint ? <p className="max-w-sm text-sm text-text-secondary">{hint}</p> : null}
    </div>
  );
}

export function ErrorState({ message }: { message?: string }) {
  return (
    <div className="rounded-lg border border-marvel/30 bg-marvel/5 px-6 py-8 text-center">
      <p className="text-sm font-medium text-text-primary">Something went wrong</p>
      <p className="mt-1 text-sm text-text-secondary">{message ?? "Please try again."}</p>
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-md bg-surface-alt", className)} />;
}

/** A grid of skeleton cards, used while a tab's data loads. */
export function CardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="h-32" />
      ))}
    </div>
  );
}
