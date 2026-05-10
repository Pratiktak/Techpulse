import { Skeleton } from "@/components/ui/skeleton";

export function SkeletonCard() {
  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm flex flex-col h-full space-y-4">
      <Skeleton className="aspect-square w-full rounded-md" />
      <div className="space-y-2 flex-grow">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-4 w-1/3" />
      </div>
      <Skeleton className="h-10 w-full mt-auto" />
    </div>
  );
}