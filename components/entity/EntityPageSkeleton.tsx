import { Skeleton } from "@/components/ui/states";

/** Loading placeholder matching the entity page layout (hero + tabs). */
export function EntityPageSkeleton() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <Skeleton className="h-72 w-full rounded-xl sm:h-80" />
      <div className="mt-8 flex gap-2 border-b border-border pb-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-7 w-20" />
        ))}
      </div>
      <div className="mt-8 space-y-4">
        <Skeleton className="h-6 w-full max-w-2xl" />
        <Skeleton className="h-6 w-full max-w-xl" />
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      </div>
    </div>
  );
}
