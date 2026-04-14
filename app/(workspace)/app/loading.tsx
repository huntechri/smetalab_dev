import { Skeleton } from '@/shared/ui/skeleton';

export default function AppLoading() {
  return (
    <div className="space-y-4 p-4 md:p-6 lg:p-8">
      <Skeleton className="h-8 w-56" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
      <Skeleton className="h-[320px] w-full" />
    </div>
  );
}
