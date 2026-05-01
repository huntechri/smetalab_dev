import Image from 'next/image';
import { Settings } from 'lucide-react';
import { ActionMenu } from '@/shared/ui/action-menu';
import { Button } from '@/shared/ui/button';
import { MoneyCell } from '@/shared/ui/cells/money-cell';
import {
  DenseListMaterialImageFrame,
  DenseListMaterialMeta,
  DenseListMaterialRow,
  DenseListToken,
} from '@/shared/ui/dense-list';
import type { EstimateRow } from '../../../types/dto';
import type { EstimateCardsTableProps } from './types';
import { buildMaterialActions } from './actions';
import {
  ESTIMATE_CARD_ICON_ACTION_CLASS,
  ESTIMATE_MATERIAL_CARD_CLASS,
  INTEGER_FORMATTER,
  MATERIAL_EXPENSE_CLASS,
  MATERIAL_NAME_CLASS,
  MATERIAL_QTY_CLASS,
} from './constants';
import { EstimateInlineNumberCell } from './EstimateInlineNumberCell';
import { EstimateInlineTextCell } from './EstimateInlineTextCell';
import { EstimateMetricPill } from './EstimateMetricPill';

interface EstimateMaterialCardProps {
  material: EstimateRow;
  props: EstimateCardsTableProps;
}

export function EstimateMaterialCard({ material, props }: EstimateMaterialCardProps) {
  return (
    <div className={ESTIMATE_MATERIAL_CARD_CLASS}>
      <DenseListMaterialRow>
        <div className="min-w-0 overflow-hidden">
          <div className="flex min-w-0 items-start gap-1.5">
            <span className="mt-1 shrink-0 text-xs font-semibold text-muted-foreground">
              {material.code}
            </span>
            <EstimateInlineTextCell
              value={material.name}
              onCommit={(value) => props.onPatch(material.id, 'name', value)}
              ariaLabel={`Наименование: ${material.name}`}
              title={material.name}
              className={MATERIAL_NAME_CLASS}
            />
          </div>

          <DenseListMaterialMeta>
            <div className="flex items-center gap-1.5 shrink-0">
              <DenseListMaterialImageFrame>
                {material.imageUrl ? (
                  <Image
                    src={material.imageUrl}
                    alt={material.name}
                    width={28}
                    height={28}
                    className="h-full w-full object-cover"
                    unoptimized
                  />
                ) : (
                  <span className="text-xs font-medium text-muted-foreground">
                    —
                  </span>
                )}
              </DenseListMaterialImageFrame>
              <DenseListToken variant="neutral">{material.unit}</DenseListToken>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <EstimateMetricPill density="material">
                <span className="opacity-70 text-xs">Кол:</span>
                <EstimateInlineNumberCell
                  value={material.qty}
                  onCommit={(value) => props.onPatch(material.id, 'qty', value)}
                  ariaLabel={`Количество: ${material.name}`}
                  className={MATERIAL_QTY_CLASS}
                />
              </EstimateMetricPill>
              <EstimateMetricPill density="material" tone="info">
                <span className="opacity-70 text-xs">Расх:</span>
                <EstimateInlineNumberCell
                  value={material.expense}
                  onCommit={(value) => props.onPatch(material.id, 'expense', value)}
                  ariaLabel={`Расход: ${material.name}`}
                  className={MATERIAL_EXPENSE_CLASS}
                />
              </EstimateMetricPill>
            </div>

            <div className="flex items-center gap-1.5 shrink-0 ml-auto sm:ml-0">
              <span className="tabular-nums">
                {INTEGER_FORMATTER.format(material.price)} ₽/ед
              </span>
              <DenseListToken variant="success">
                <MoneyCell value={material.sum} />
              </DenseListToken>
            </div>
          </DenseListMaterialMeta>
        </div>

        <div className="flex shrink-0 items-start pt-0.5">
          <ActionMenu
            ariaLabel="Действия с материалом"
            trigger={
              <Button
                size="icon-xs"
                variant="outline"
                className={ESTIMATE_CARD_ICON_ACTION_CLASS}
                aria-label="Действия с материалом"
              >
                <Settings className="size-3 sm:size-3.5" />
              </Button>
            }
            items={buildMaterialActions(material, props)}
          />
        </div>
      </DenseListMaterialRow>
    </div>
  );
}
