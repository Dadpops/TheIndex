import { CardGridSkeleton, Skeleton } from "@/components/ui/states";

export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <Skeleton className="mb-3 h-12 w-64" />
      <Skeleton className="mb-8 h-5 w-full max-w-xl" />
      <div className="mb-6 flex justify-between">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-9 w-64" />
      </div>
      <CardGridSkeleton count={9} />
    </div>
  );
}
