'use client';

import { cn } from '@/lib/utils';
import { Badge } from '@/shared/ui/badge';
import { Skeleton } from '@/shared/ui/skeleton';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { MoneyCell } from '@/shared/ui/cells/money-cell';
import { Download, PackageSearch, Search } from 'lucide-react';
import type { EstimateProcurementRow } from '@/shared/types/estimate-procurement';
import { useEstimateProcurementController } from '@/features/projects/estimates/hooks/use-estimate-procurement-controller';
import { EstimateTotals } from '../EstimateTotals';

const moneyFormatter = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  maximumFractionDigits: 2,
});

const numberFormatter = new Intl.NumberFormat('ru-RU', {
  maximumFractionDigits: 2,
});

const renderDeltaBadge = (value: number, label: string, formatter: Intl.NumberFormat) => {
  const baseClass = 'h-4 sm:h-5 px-1 sm:px-1.5 text-[9px] sm:text-[10px] font-bold normal-case leading-none border shadow-none';

  let toneClass = 'border-slate-300 bg-slate-50 text-slate-600';
  if (value > 0) toneClass = 'border-green-200 bg-green-50 text-green-600';
  if (value < 0) toneClass = 'border-rose-200 bg-rose-50 text-rose-600';

  return (
    <Badge variant="outline" className={cn(baseClass, toneClass)}>
      <span className="opacity-70">{label}:</span>
      <span className="ml-0.5 tabular-nums">
        {value > 0 ? '+' : ''}
        {formatter.format(value)}
      </span>
    </Badge>
  );
};

function ProcurementValue({
  label,
  value,
  tone = 'neutral',
}: {
  label: string;
  value: string | number | React.ReactNode;
  tone?: 'neutral' | 'success' | 'info';
}) {
  const toneClasses = {
    neutral: 'border-slate-200 bg-slate-50 text-slate-600',
    info: 'border-blue-200 bg-blue-50 text-blue-600',
    success: 'border-green-200 bg-green-50 text-green-600',
  };

  return (
    <Badge
      variant="outline"
      className={cn(
        'h-4 sm:h-5 px-1 sm:px-1.5 text-[9px] sm:text-[10px] font-semibold normal-case leading-none tracking-tight border shadow-none',
        toneClasses[tone],
      )}
    >
      <span className="opacity-70">{label}:</span>
      <span className="tabular-nums ml-0.5">{value}</span>
    </Badge>
  );
}

function ProcurementToolbar({
  searchValue,
  onSearchValueChange,
  onExport,
}: {
  searchValue: string;
  onSearchValueChange: (value: string) => void;
  onExport: () => void;
}) {
  return (
    <div className="p-1.5 sm:p-3 pb-0">
      <div className="mb-2 sm:mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input
            value={searchValue}
            onChange={(event) => onSearchValueChange(event.target.value)}
            placeholder="Поиск..."
            size="xs"
            className="rounded-md border-border bg-background pl-8"
            aria-label="Поиск закупок"
          />
        </div>
        <Button variant="outline" size="xs" className="shrink-0" onClick={onExport}>
          <Download className="mr-2 size-3.5" aria-hidden="true" />
          Экспорт Excel
        </Button>
      </div>
    </div>
  );
}

function ProcurementCard({ row }: { row: EstimateProcurementRow }) {
  return (
    <article className="overflow-hidden rounded-md border border-border bg-card shadow-[0_1px_2px_rgba(0,0,0,0.04)] sm:rounded-lg">
      <div className="grid grid-cols-1 gap-4 p-2 sm:p-3 lg:grid-cols-[2.5fr_1fr_1fr_1fr] lg:gap-6">
        <div className="flex flex-col justify-center min-w-0">
          <div className="flex items-start gap-1.5">
            <span className="min-w-0 flex-1 text-[9px] font-semibold leading-tight text-slate-800 sm:text-[11px]" title={row.materialName}>
              {row.materialName}
            </span>
            <Badge
              variant="outline"
              className="h-4 shrink-0 border-slate-200 bg-white px-1 py-0 text-[9px] leading-none text-slate-600 sm:h-5 sm:px-1.5 sm:text-[10px] font-bold normal-case"
            >
              {row.unit}
            </Badge>
          </div>
          {row.source === 'fact_only' && (
            <div className="mt-1.5">
              <Badge variant="warning" className="h-4 sm:h-5 px-1.5 text-[9px] sm:text-[10px] font-bold normal-case leading-none">
                Только факт
              </Badge>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:contents">
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 border-b border-blue-100/50 pb-1.5 dark:border-blue-900/30">
              <div className="h-1.5 w-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
              <span className="text-[9px] font-bold uppercase tracking-widest text-blue-600 sm:text-[10px]">План</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <ProcurementValue label="Кол-во" value={numberFormatter.format(row.plannedQty)} />
              <ProcurementValue label="Цена" value={moneyFormatter.format(row.plannedPrice)} />
              <ProcurementValue label="Итого" value={<MoneyCell value={row.plannedAmount} />} tone="info" />
            </div>
          </div>

          <div className="space-y-2.5">
            <div className="flex items-center gap-2 border-b border-green-100/50 pb-1.5 dark:border-green-900/30">
              <div className="h-1.5 w-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
              <span className="text-[9px] font-bold uppercase tracking-widest text-green-600 sm:text-[10px]">Факт</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <ProcurementValue label="Кол-во" value={numberFormatter.format(row.actualQty)} />
              <ProcurementValue label="Цена" value={moneyFormatter.format(row.actualAvgPrice)} />
              <ProcurementValue label="Итого" value={<MoneyCell value={row.actualAmount} />} tone="success" />
            </div>
          </div>

          <div className="col-span-2 sm:col-span-1 space-y-2.5">
            <div className="flex items-center gap-2 border-b border-orange-100/50 pb-1.5 dark:border-orange-900/30">
              <div className="h-1.5 w-1.5 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]" />
              <span className="text-[9px] font-bold uppercase tracking-widest text-orange-600 sm:text-[10px]">Откл.</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {renderDeltaBadge(row.qtyDelta, 'Кол-во', numberFormatter)}
              {renderDeltaBadge(row.amountDelta, 'Итого', moneyFormatter)}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

function buildProcurementRowKey(row: EstimateProcurementRow, index: number) {
  return `${row.materialName}-${row.unit}-${row.source}-${row.purchaseCount}-${row.lastPurchaseDate ?? 'none'}-${index}`;
}

export function EstimateProcurement({ estimateId, initialRows }: { estimateId: string; initialRows?: EstimateProcurementRow[] }) {
  const {
    rows,
    searchValue,
    setSearchValue,
    isLoading,
    errorMessage,
    totals,
    filteredRows,
    handleExport,
  } = useEstimateProcurementController({ estimateId, initialRows });

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-[420px] w-full" />
      </div>
    );
  }

  if (errorMessage) {
    return <div className="rounded-md border p-4 text-sm text-destructive">{errorMessage}</div>;
  }

  if (rows.length === 0) {
    return <div className="rounded-md border p-4 text-sm text-muted-foreground">В смете и закупках нет материалов для отображения.</div>;
  }

  return (
    <div className="space-y-1.5 sm:space-y-2 [--procurement-height:calc(100vh-250px)] sm:[--procurement-height:calc(100vh-280px)]">
      <section className="flex flex-col rounded-lg border border-border bg-card text-card-foreground shadow-none">
        <ProcurementToolbar
          searchValue={searchValue}
          onSearchValueChange={setSearchValue}
          onExport={handleExport}
        />

        <div className="max-h-[var(--procurement-height)] overflow-y-auto px-1.5 pb-1.5 sm:px-3 sm:pb-3">
          {filteredRows.length > 0 ? (
            <div className="space-y-2">
              {filteredRows.map((row, index) => (
                <ProcurementCard key={buildProcurementRowKey(row, index)} row={row} />
              ))}
            </div>
          ) : (
            <div className="flex min-h-[220px] flex-col items-center justify-center rounded-md border border-dashed border-border bg-muted/30 p-4 text-center text-sm text-muted-foreground">
              <PackageSearch className="mb-2 size-6" aria-hidden="true" />
              По вашему запросу ничего не найдено.
            </div>
          )}
        </div>
      </section>
      <div className="flex justify-end border-t border-border/60 bg-background/95 px-1 pt-1">
        <EstimateTotals planned={totals.planned} actual={totals.actual} />
      </div>
    </div>
  );
}
