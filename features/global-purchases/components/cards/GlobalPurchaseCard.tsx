import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DenseCard } from '@/shared/ui/dense-card';
import { MoneyCell } from '@/shared/ui/cells/money-cell';
import { EditableCell } from '@/shared/ui/cells/editable-cell';
import { DeletePurchaseAction } from './DeletePurchaseAction';
import { ProjectPicker } from './ProjectPicker';
import { PurchaseMetric } from './PurchaseMetric';
import { SupplierPicker } from './SupplierPicker';
import {
  formatPurchaseDate,
  inlineDateCellClassName,
  inlinePriceCellClassName,
  inlineQtyCellClassName,
  inlineTextCellClassName,
  inlineUnitCellClassName,
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
    <DenseCard>
      <div className="grid grid-cols-1 gap-2.5 p-2 sm:p-2.5 lg:grid-cols-[92px_minmax(0,1fr)_minmax(300px,auto)_minmax(150px,220px)_auto] lg:items-center lg:gap-3">
        <div className="min-w-0">
          <p className="mb-1 text-[9px] font-bold uppercase tracking-[0.08em] text-slate-400">Дата</p>
          <EditableCell
            type="date"
            value={row.purchaseDate}
            displayValue={formatPurchaseDate(row.purchaseDate)}
            disabled={isPending}
            ariaLabel="Дата закупки"
            className={inlineDateCellClassName}
            onCommit={async (value: string) => {
              await onPatchAction(row.id, { purchaseDate: value });
            }}
          />
        </div>

        <div className="min-w-0 space-y-1.5">
          <div className="flex min-w-0 items-start gap-1.5">
            {isPending ? <Loader2 className="mt-0.5 size-3.5 shrink-0 animate-spin text-muted-foreground" aria-hidden="true" /> : null}
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
            <ProjectPicker row={row} projectOptions={projectOptions} disabled={isPending} onPatchAction={onPatchAction} />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 lg:justify-end">
          <div className="inline-flex h-6 whitespace-nowrap items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-1.5 py-0 text-[11px] font-semibold leading-none text-slate-600 sm:h-5 sm:text-[10px]">
            <span className="shrink-0 opacity-70">Кол-во:</span>
            <EditableCell
              type="number"
              align="right"
              clearOnFocus
              cancelOnEmpty
              value={row.qty}
              disabled={isPending}
              ariaLabel="Количество"
              className={inlineQtyCellClassName}
              onCommit={async (value: string) => {
                await onPatchAction(row.id, { qty: Number(value) });
              }}
            />
            <EditableCell
              value={row.unit}
              disabled={isPending}
              ariaLabel="Единица измерения"
              className={inlineUnitCellClassName}
              onCommit={async (value: string) => {
                await onPatchAction(row.id, { unit: value });
              }}
            />
          </div>
          <div className="inline-flex h-6 whitespace-nowrap items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-1.5 py-0 text-[11px] font-semibold leading-none text-slate-600 sm:h-5 sm:text-[10px]">
            <span className="shrink-0 opacity-70">Цена:</span>
            <EditableCell
              type="number"
              align="right"
              clearOnFocus
              cancelOnEmpty
              value={row.price}
              disabled={isPending}
              ariaLabel="Цена"
              className={cn(inlinePriceCellClassName, 'font-bold')}
              onCommit={async (value: string) => {
                await onPatchAction(row.id, { price: Number(value) });
              }}
            />
            <span className="shrink-0">₽</span>
          </div>
          <PurchaseMetric label="Итого" value={<MoneyCell value={row.amount} />} tone="success" />
        </div>

        <div className="min-w-0">
          <p className="mb-1 text-[9px] font-bold uppercase tracking-[0.08em] text-slate-400 lg:text-right">Поставщик</p>
          <SupplierPicker row={row} supplierOptions={supplierOptions} disabled={isPending} onPatchAction={onPatchAction} />
        </div>

        <div className="flex items-start justify-end lg:items-center">
          <DeletePurchaseAction row={row} disabled={isPending} onRemoveAction={onRemoveAction} />
        </div>
      </div>
    </DenseCard>
  );
}
