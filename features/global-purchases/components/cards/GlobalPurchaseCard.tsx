import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/shared/ui/badge';
import { MoneyCell } from '@/shared/ui/cells/money-cell';
import { EditableCell } from '@/shared/ui/cells/editable-cell';
import { DeletePurchaseAction } from './DeletePurchaseAction';
import { ProjectPicker } from './ProjectPicker';
import { PurchaseMetric } from './PurchaseMetric';
import { SupplierPicker } from './SupplierPicker';
import {
  amountFormatter,
  formatPurchaseDate,
  inlineNumberCellClassName,
  inlineTextCellClassName,
} from './format';
import type { GlobalPurchaseCardProps } from './types';

export function GlobalPurchaseCard({
  row,
  projectOptions,
  supplierOptions,
  pendingIds,
  onPatchAction,
  onRemoveAction,
}: GlobalPurchaseCardProps) {
  const isPending = pendingIds.has(row.id);

  return (
    <article className="overflow-hidden rounded-md border border-border bg-card shadow-[0_1px_2px_rgba(0,0,0,0.04)] sm:rounded-lg">
      <div className="grid grid-cols-1 gap-4 p-2 sm:p-3 lg:grid-cols-[2.2fr_1fr_1.25fr_1.15fr_auto] lg:gap-5">
        <div className="min-w-0 space-y-2">
          <div className="flex min-w-0 items-start gap-1.5">
            {isPending ? <Loader2 className="mt-1 size-3.5 shrink-0 animate-spin text-muted-foreground" aria-hidden="true" /> : null}
            <EditableCell
              value={row.materialName}
              disabled={isPending}
              ariaLabel="Наименование материала"
              title={row.materialName}
              className={inlineTextCellClassName}
              onCommit={async (value: string) => {
                await onPatchAction(row.id, { materialName: value });
              }}
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <Badge
              variant="outline"
              className="h-5 border-slate-200 bg-white px-1.5 py-0 text-[10px] font-bold leading-none text-slate-600 shadow-none"
            >
              <EditableCell
                value={row.unit}
                disabled={isPending}
                ariaLabel="Единица измерения"
                className="h-4 w-14 border-0 bg-transparent px-0 py-0 text-[10px] font-bold !shadow-none focus-visible:!ring-0 focus-visible:!ring-offset-0"
                onCommit={async (value: string) => {
                  await onPatchAction(row.id, { unit: value });
                }}
              />
            </Badge>
            <Badge
              variant="outline"
              className="h-5 border-slate-200 bg-slate-50 px-1.5 py-0 text-[10px] font-semibold leading-none text-slate-500 shadow-none"
            >
              {row.source === 'catalog' ? 'Каталог' : 'Ручная'}
            </Badge>
          </div>
        </div>

        <div className="space-y-2.5">
          <div className="flex items-center gap-2 border-b border-blue-100/50 pb-1.5 dark:border-blue-900/30">
            <div className="h-1.5 w-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" aria-hidden="true" />
            <span className="text-[9px] font-bold uppercase tracking-widest text-blue-600 sm:text-[10px]">Привязка</span>
          </div>
          <div className="grid gap-1.5">
            <ProjectPicker row={row} projectOptions={projectOptions} disabled={isPending} onPatchAction={onPatchAction} />
            <EditableCell
              type="date"
              value={row.purchaseDate}
              displayValue={formatPurchaseDate(row.purchaseDate)}
              disabled={isPending}
              ariaLabel="Дата закупки"
              className="h-6 justify-start rounded-md px-1.5 text-[10px] font-semibold"
              onCommit={async (value: string) => {
                await onPatchAction(row.id, { purchaseDate: value });
              }}
            />
          </div>
        </div>

        <div className="space-y-2.5">
          <div className="flex items-center gap-2 border-b border-green-100/50 pb-1.5 dark:border-green-900/30">
            <div className="h-1.5 w-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" aria-hidden="true" />
            <span className="text-[9px] font-bold uppercase tracking-widest text-green-600 sm:text-[10px]">Закупка</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <div className="inline-flex h-5 items-center gap-1 rounded-full border border-slate-300 bg-slate-50 px-1.5 py-0 text-[10px] text-slate-600">
              <span className="opacity-70">Кол-во</span>
              <EditableCell
                type="number"
                align="right"
                clearOnFocus
                cancelOnEmpty
                value={row.qty}
                disabled={isPending}
                ariaLabel="Количество"
                className={inlineNumberCellClassName}
                onCommit={async (value: string) => {
                  await onPatchAction(row.id, { qty: Number(value) });
                }}
              />
            </div>
            <div className="inline-flex h-5 items-center gap-1 rounded-full border border-slate-300 bg-slate-50 px-1.5 py-0 text-[10px] text-slate-600">
              <span className="opacity-70">Цена</span>
              <EditableCell
                type="number"
                align="right"
                clearOnFocus
                cancelOnEmpty
                value={row.price}
                disabled={isPending}
                ariaLabel="Цена"
                className={cn(inlineNumberCellClassName, 'font-bold')}
                onCommit={async (value: string) => {
                  await onPatchAction(row.id, { price: Number(value) });
                }}
              />
              <span>₽</span>
            </div>
            <PurchaseMetric label="Сумма" value={<MoneyCell value={row.amount} />} tone="success" />
          </div>
        </div>

        <div className="space-y-2.5">
          <div className="flex items-center gap-2 border-b border-orange-100/50 pb-1.5 dark:border-orange-900/30">
            <div className="h-1.5 w-1.5 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]" aria-hidden="true" />
            <span className="text-[9px] font-bold uppercase tracking-widest text-orange-600 sm:text-[10px]">Поставщик</span>
          </div>
          <SupplierPicker row={row} supplierOptions={supplierOptions} disabled={isPending} onPatchAction={onPatchAction} />
          <div className="flex flex-wrap gap-1.5">
            <PurchaseMetric label="Цена" value={`${amountFormatter.format(row.price)} ₽`} />
          </div>
        </div>

        <div className="flex items-start justify-end">
          <DeletePurchaseAction row={row} disabled={isPending} onRemoveAction={onRemoveAction} />
        </div>
      </div>
    </article>
  );
}
