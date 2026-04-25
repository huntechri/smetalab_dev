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
      <div className="space-y-2 p-2 sm:p-2.5">
        <div className="flex min-w-0 items-start gap-2">
          <EditableCell
            type="date"
            value={row.purchaseDate}
            displayValue={formatPurchaseDate(row.purchaseDate)}
            disabled={isPending}
            ariaLabel="Дата закупки"
            className="h-7 w-[92px] shrink-0 justify-center rounded-md border border-slate-200 bg-slate-50 px-1.5 text-[10px] font-semibold text-slate-700 shadow-none focus-visible:ring-1"
            onCommit={async (value: string) => {
              await onPatchAction(row.id, { purchaseDate: value });
            }}
          />

          <div className="min-w-0 flex-1">
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
          </div>

          <div className="shrink-0">
            <DeletePurchaseAction row={row} disabled={isPending} onRemoveAction={onRemoveAction} />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2 pl-0 sm:pl-[100px] xl:grid-cols-[minmax(0,1fr)_auto] xl:items-center">
          <div className="flex min-w-0 flex-wrap items-center gap-1.5">
            <Badge
              variant="outline"
              className="h-5 border-slate-200 bg-slate-50 px-1.5 py-0 text-[10px] font-semibold leading-none text-slate-500 shadow-none"
            >
              {row.source === 'catalog' ? 'Каталог' : 'Ручная'}
            </Badge>
            <div className="max-w-full min-w-[120px] sm:max-w-[240px]">
              <ProjectPicker row={row} projectOptions={projectOptions} disabled={isPending} onPatchAction={onPatchAction} />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 xl:justify-end">
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
              <EditableCell
                value={row.unit}
                disabled={isPending}
                ariaLabel="Единица измерения"
                className="h-4 w-10 border-0 bg-transparent px-0 py-0 text-left text-[10px] font-bold text-slate-700 !shadow-none focus-visible:!ring-0 focus-visible:!ring-offset-0"
                onCommit={async (value: string) => {
                  await onPatchAction(row.id, { unit: value });
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
            <div className="min-w-[150px] max-w-full sm:max-w-[220px]">
              <SupplierPicker row={row} supplierOptions={supplierOptions} disabled={isPending} onPatchAction={onPatchAction} />
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
