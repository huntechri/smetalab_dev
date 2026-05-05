import { Loader2 } from 'lucide-react';
import { DenseCard } from '@/shared/ui/dense-card';
import { MoneyCell } from '@/shared/ui/cells/money-cell';
import { EditableCell } from '@/shared/ui/cells/editable-cell';
import { Badge } from '@/shared/ui/badge';
import {
  DenseListInlineStart,
  DenseListMetaField,
  DenseListMetricGroup,
  DenseListPrimaryCell,
  DenseListRecordGrid,
  DenseListTrailingActions,
  DenseListWrap,
} from '@/shared/ui/dense-list';
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
      <DenseListRecordGrid>
        <DenseListMetaField label="Дата">
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
        </DenseListMetaField>

        <DenseListPrimaryCell>
          <DenseListInlineStart>
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
          </DenseListInlineStart>
          <DenseListWrap>
            <ProjectPicker row={row} projectOptions={projectOptions} disabled={isPending} onPatchAction={onPatchAction} />
          </DenseListWrap>
        </DenseListPrimaryCell>

        <DenseListMetricGroup>
          <Badge variant="outline" size="xs" className="tabular-nums">
            <span>Кол-во:</span>
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
          </Badge>
          <Badge variant="outline" size="xs" className="tabular-nums">
            <span>Цена:</span>
            <EditableCell
              type="number"
              align="right"
              clearOnFocus
              cancelOnEmpty
              value={row.price}
              disabled={isPending}
              ariaLabel="Цена"
              className={inlinePriceCellClassName}
              onCommit={async (value: string) => {
                await onPatchAction(row.id, { price: Number(value) });
              }}
            />
            <span className="shrink-0">₽</span>
          </Badge>
          <PurchaseMetric label="Итого" value={<MoneyCell value={row.amount} />} tone="success" />
        </DenseListMetricGroup>

        <DenseListMetaField label="Поставщик" align="end">
          <SupplierPicker row={row} supplierOptions={supplierOptions} disabled={isPending} onPatchAction={onPatchAction} />
        </DenseListMetaField>

        <DenseListTrailingActions>
          <DeletePurchaseAction row={row} disabled={isPending} onRemoveAction={onRemoveAction} />
        </DenseListTrailingActions>
      </DenseListRecordGrid>
    </DenseCard>
  );
}
