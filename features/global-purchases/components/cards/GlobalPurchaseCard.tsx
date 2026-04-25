import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
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
      <div className="grid grid-cols-1 gap-2 p-2 sm:p-2.5 xl:grid-cols-[92px_180px_minmax(0,1fr)_auto_auto_auto] xl:items-center xl:gap-2.5">
        <EditableCell
          type="date"
          value={row.purchaseDate}
          displayValue={formatPurchaseDate(row.purchaseDate)}
          disabled={isPending}
          ariaLabel="Дата закупки"
          className="h-7 w-[92px] justify-center rounded-md border border-slate-200 bg-slate-50 px-1.5 text-[10px] font-semibold text-slate-700 shadow-none focus-visible:ring-1"
          onCommit={async (value: string) => {
            await onPatchAction(row.id, { purchaseDate: value });
          }}
        />

        <div className="max-w-full min-w-[120px] xl:w-[180px]">
          <ProjectPicker row={row} projectOptions={projectOptions} disabled={isPending} onPatchAction={onPatchAction} />
        </div>

        <div className="flex min-w-0 items-center gap-1.5">
          {isPending ? <Loader2 className="size-3.5 shrink-0 animate-spin text-muted-foreground" aria-hidden="true" /> : null}
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

        <div className="flex flex-wrap items-center gap-1.5 xl:flex-nowrap xl:justify-end">
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
        </div>

        <div className="min-w-[150px] max-w-full xl:w-[170px]">
          <SupplierPicker row={row} supplierOptions={supplierOptions} disabled={isPending} onPatchAction={onPatchAction} />
        </div>

        <div className="flex items-center justify-end">
          <DeletePurchaseAction row={row} disabled={isPending} onRemoveAction={onRemoveAction} />
        </div>
      </div>
    </article>
  );
}
