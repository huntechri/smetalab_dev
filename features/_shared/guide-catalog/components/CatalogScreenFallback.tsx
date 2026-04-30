import { Skeleton } from "@/shared/ui/skeleton";

export function CatalogScreenFallback() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-[420px] w-full" />
    </div>
  );
}
