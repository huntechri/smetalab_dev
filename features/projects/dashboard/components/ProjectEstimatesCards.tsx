'use client';

import Link from 'next/link';
import { CalendarDays, FilePlus, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { CompactToken } from '@/shared/ui/compact-token';
import { TableEmptyState } from '@/shared/ui/table-empty-state';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/shared/ui/alert-dialog';
import { EstimateStatusMenu } from '@/features/projects/estimates/components/registry/EstimateStatusMenu';
import type { EstimateMeta, EstimateStatus } from '@/shared/types/domain/estimate';

const moneyFormatter = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

const estimatesListViewportClassName = 'max-h-96 overflow-y-auto sm:pr-1';
const estimateCardRowClassName = 'flex items-center gap-1.5 sm:gap-2';
const estimateCardContentClassName = 'flex min-w-0 flex-nowrap items-center gap-1.5 overflow-hidden sm:gap-2';

interface ProjectEstimatesCardsProps {
  estimates: EstimateMeta[];
  projectSlug: string;
  onCreateEstimate: () => void;
  onChangeStatus: (estimate: EstimateMeta, nextStatus: EstimateStatus) => Promise<void>;
  onDeleteEstimate: (estimate: EstimateMeta) => Promise<void>;
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '—';
  }

  return dateFormatter.format(date);
}

export function ProjectEstimatesCards({
  estimates,
  projectSlug,
  onCreateEstimate,
  onChangeStatus,
  onDeleteEstimate,
}: ProjectEstimatesCardsProps) {
  const total = estimates.reduce((sum, estimate) => sum + estimate.total, 0);
  const approvedCount = estimates.filter((estimate) => estimate.status === 'approved').length;

  return (
    <section className="rounded-lg border bg-card text-card-foreground shadow-none">
      <div className="mb-3 flex min-w-0 items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex min-w-0 items-center gap-2">
            <h2 className="truncate text-sm font-semibold">Сметы</h2>
            <CompactToken variant="neutral">{estimates.length}</CompactToken>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
            <span>Итого: {moneyFormatter.format(total)}</span>
            <span aria-hidden="true">·</span>
            <span>Выполнено: {approvedCount}</span>
          </div>
        </div>

        <Button
          onClick={onCreateEstimate}
          variant="outline"
          size="icon-xs"
          aria-label="Создать смету"
          title="Создать смету"
        >
          <Plus className="size-4" aria-hidden="true" />
        </Button>
      </div>

      {estimates.length > 0 ? (
        <div className={estimatesListViewportClassName}>
          <div className="space-y-2">
            {estimates.map((estimate) => (
              <article
                key={estimate.id}
                className="overflow-hidden rounded-md border bg-card shadow-sm sm:rounded-lg"
              >
                <div className={estimateCardRowClassName}>
                  <div className="min-w-0 flex-1">
                    <div className={estimateCardContentClassName}>
                      <Link
                        href={`/app/projects/${projectSlug}/estimates/${estimate.slug}`}
                        className="min-w-0 shrink truncate text-xs font-semibold leading-snug hover:underline sm:text-sm"
                        title={estimate.name}
                      >
                        {estimate.name}
                      </Link>
                      <EstimateStatusMenu
                        status={estimate.status}
                        onChange={(nextStatus) => onChangeStatus(estimate, nextStatus)}
                        badgeSize="xs"
                        className="min-w-20 md:min-w-24"
                      />
                      <CompactToken variant="success">
                        {moneyFormatter.format(estimate.total)}
                      </CompactToken>
                      <CompactToken variant="neutral">
                        <CalendarDays className="size-3" aria-hidden="true" />
                        {formatDate(estimate.createdAt)}
                      </CompactToken>
                    </div>
                  </div>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon-xs"
                        title="Удалить смету"
                        aria-label={`Удалить смету ${estimate.name}`}
                        className="size-6 sm:size-7"
                      >
                        <Trash2 className="size-3 sm:size-3.5" aria-hidden="true" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Удалить смету?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Смета "{estimate.name}" будет удалена. Это действие можно отменить
                          только через администратора.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Отмена</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          onClick={() => void onDeleteEstimate(estimate)}
                        >
                          Удалить
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </article>
            ))}
          </div>
        </div>
      ) : (
        <TableEmptyState
          title="Нет смет в проекте"
          description="Создайте первую смету, чтобы начать работу"
          icon={FilePlus}
          action={
            <Button onClick={onCreateEstimate} variant="brand">
              Создать смету
            </Button>
          }
        />
      )}
    </section>
  );
}
