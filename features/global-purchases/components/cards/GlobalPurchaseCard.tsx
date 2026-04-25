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

function CardSectionTitle({
  label,
  tone,
}: {
  label: string;
  tone: 'blue' | 'green' | 'orange';
}) {
  const toneClasses = {
    blue: {
      border: 'border-blue-100/50 dark:border-blue-900/30',
      dot: 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]',
      text: 'text-blue-600',
    },
    green: {
      border: 'border-green-100/50 dark:border-green-900/30',
      dot: 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]',
      text: 'text-green-600',
    },
    orange: {
      border: 'border-orange-100/50 dark:border-orange-900/30',
      dot: 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]',
      text: 'text-orange-600',
    },
  }[tone];

  return (
    <div className={cn('flex items-center gap-2 border-b pb-1.5', toneClasses.border)}>
      <div className={cn('h-1.5 w-1.5 rounded-full', toneClasses.dot)} aria-hidden="true" />
      <span className={cn('text-[9px] font-bold uppercase tracking-widest sm:text-[10px]', toneClasses.text)}>
        {label}
      </span>
    </div>
  );
}

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
      <div className="grid grid-cols-1 gap-4 p-2 sm:p-3 lg:grid-cols-[2.5fr_1fr_1fr_1fr_auto] lg:gap-6">
        <div className="flex min-w-0 flex-col justify-center">
          <div className="flex items-start gap-1.5">
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
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:contents">
          <div className="space-y-2.5">
            <CardSectionTitle label="Дата" tone="blue" />
            <div className="flex flex-wrap gap-2">
              <EditableCell
                type="date"
                value={row.purchaseDate}
                displayValue={formatPurchaseDate(row.purchaseDate)}
                disabled={isPending}
                ariaLabel="Дата закупки"
                className="h-4 rounded-full border border-slate-200 bg-slate-50 px-1.5 py-0 text-[9px] font-semibold leading-none text-slate-600 shadow-none sm:h-5 sm:text-[10px] focus-visible:ring-1"
                onCommit={async (value: string) => {
                  await onPatchAction(row.id, { purchaseDate: value });
                }}
              />
              <ProjectPicker row={row} projectOptions={projectOptions} disabled={isPending} onPatchAction={onPatchAction} />
            </div>
          </div>

          <div className="space-y-2.5">
            <CardSectionTitle label="Закупка" tone="green" />
            <div className="flex flex-wrap gap-2">
              <div className="inline-flex h-4 items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-1 py-0 text-[9px] font-semibold leading-none text-slate-600 sm:h-5 sm:px-1.5 sm:text-[10px]">
                <span className="opacity-70">Кол-во:</span>
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
                  className="h-4 w-9 border-0 bg-transparent px-0 py-0 text-left text-[9px] font-bold text-slate-700 !shadow-none sm:text-[10px] focus-visible:!ring-0 focus-visible:!ring-offset-0"
                  onCommit={async (value: string) => {
                    await onPatchAction(row.id, { unit: value });
                  }}
                />
              </div>
              <div className="inline-flex h-4 items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-1 py-0 text-[9px] font-semibold leading-none text-slate-600 sm:h-5 sm:px-1.5 sm:text-[10px]">
                <span className="opacity-70">Цена:</span>
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
              <PurchaseMetric label="Итого" value={<MoneyCell value={row.amount} />} tone="success" />
            </div>
          </div>

          <div className="col-span-2 space-y-2.5 sm:col-span-1">
            <CardSectionTitle label="Поставщик" tone="orange" />
            <div className="flex flex-wrap gap-2">
              <SupplierPicker row={row} supplierOptions={supplierOptions} disabled={isPending} onPatchAction={onPatchAction} />
            </div>
          </div>
        </div>

        <div className="flex items-start justify-end">
          <DeletePurchaseAction row={row} disabled={isPending} onRemoveAction={onRemoveAction} />
        </div>
      </div>
    </article>
  );
}
