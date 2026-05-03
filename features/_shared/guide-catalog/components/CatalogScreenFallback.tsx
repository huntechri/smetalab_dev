import { Skeleton } from "@/shared/ui/skeleton";
import { LoadingState } from "@/shared/ui/states";

export function CatalogScreenFallback() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-12 w-full" />
      <LoadingState height="h-96" />
    </div>
  );
}
