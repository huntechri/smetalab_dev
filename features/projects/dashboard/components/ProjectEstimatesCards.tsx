'use client';

import Link from 'next/link';
import { CalendarDays, FilePlus, Plus, Trash2 } from 'lucide-react';
import { Badge, Button, TableEmptyState } from '@repo/ui';
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
} from '@repo/ui';
import { EstimateStatusMenu } from '@/features/projects/estimates/components/registry/EstimateStatusMenu';
import type { EstimateMeta, EstimateStatus } from '@/features/projects/estimates/types/dto';

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
    <section className="rounded-lg border border-[#e4e4e7] bg-white p-3 text-[#09090b] shadow-none">
      <div className="mb-3 flex min-w-0 items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex min-w-0 items-center gap-2">
            <h2 className="truncate text-sm font-semibold">Сметы</h2>
            <Badge
              variant="outline"
              size="xs"
              className="h-5 border-[#e4e4e7] bg-[#f4f4f5] px-2 py-0 text-[10px] text-[#71717a]"
            >
              {estimates.length}
            </Badge>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] text-[#71717a]">
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
          className="size-7 rounded-md border-[#e4e4e7] bg-white text-[#71717a] hover:bg-[#f4f4f5]"
        >
          <Plus className="size-4" aria-hidden="true" />
        </Button>
      </div>

      {estimates.length > 0 ? (
        <div className="max-h-[430px] overflow-y-auto pr-0 sm:pr-1">
          <div className="space-y-2">
            {estimates.map((estimate) => (
              <article
                key={estimate.id}
                className="overflow-hidden rounded-md border border-[#e4e4e7] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)] sm:rounded-lg"
              >
                <div className="flex items-center gap-1.5 px-2 py-2 sm:gap-2 sm:px-3 sm:py-2.5">
                  <div className="min-w-0 flex-1">
                    <div className="flex min-w-0 flex-nowrap items-center gap-1.5 overflow-hidden sm:gap-2">
                      <Link
                        href={`/app/projects/${projectSlug}/estimates/${estimate.slug}`}
                        className="min-w-0 shrink truncate text-[12px] font-semibold leading-snug hover:underline sm:text-[13px]"
                        title={estimate.name}
                      >
                        {estimate.name}
                      </Link>
                      <EstimateStatusMenu
                        status={estimate.status}
                        onChange={(nextStatus) => onChangeStatus(estimate, nextStatus)}
                        badgeSize="default"
                        className="h-[18px] min-w-[72px] border border-[#bfdbfe] bg-[#eff6ff] px-1.5 py-0 text-[9px] font-bold leading-none text-[#1d4ed8] sm:h-5 sm:min-w-[88px] sm:px-2 sm:text-[10px] md:min-w-[100px]"
                      />
                      <Badge
                        variant="success"
                        className="h-[18px] shrink-0 border border-green-200 bg-green-100 px-1.5 py-0 text-[10px] font-bold leading-none text-green-700 sm:h-5 sm:px-2 sm:text-[11px]"
                      >
                        {moneyFormatter.format(estimate.total)}
                      </Badge>
                      <span className="inline-flex h-[18px] shrink-0 items-center gap-0.5 rounded-full border border-[#d4d4d8] bg-[#fafafa] px-1.5 text-[9px] font-medium text-[#71717a] sm:h-5 sm:gap-1 sm:px-2 sm:text-[10px]">
                        <CalendarDays className="size-2.5 sm:size-3" aria-hidden="true" />
                        {formatDate(estimate.createdAt)}
                      </span>
                    </div>
                  </div>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon-xs"
                        title="Удалить смету"
                        aria-label={`Удалить смету ${estimate.name}`}
                        className="size-6 rounded-md border-[#e4e4e7] bg-white text-[#71717a] hover:bg-[#f4f4f5] sm:size-7"
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
