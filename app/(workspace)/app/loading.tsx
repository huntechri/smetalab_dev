import { Skeleton } from '@/shared/ui/skeleton';
import { LoadingState } from '@/shared/ui/states';
import { PageShell } from '@/shared/ui/page-shell';

export default function AppLoading() {
  return (
    <PageShell spacing="default">
      <Skeleton className="h-8 w-56" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
      <LoadingState height="h-80" />
    </PageShell>
  );
}
