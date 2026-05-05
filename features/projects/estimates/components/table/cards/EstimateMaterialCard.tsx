import Image from 'next/image';
import { Settings } from 'lucide-react';
import { ActionMenu } from '@/shared/ui/action-menu';
import { Button } from '@/shared/ui/button';
import { MoneyCell } from '@/shared/ui/cells/money-cell';
import { Badge } from '@/shared/ui/badge';
import {
  DenseListMaterialImageFrame,
  DenseListMaterialMeta,
  DenseListMaterialRow,
  DenseListTrailingAction,
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

import {
  primitiveVisualTypographyClassNames,
} from '@/shared/ui/primitive-surface';

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
            <span className={`mt-1 shrink-0 ${primitiveVisualTypographyClassNames.compactLabel}`}>
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
                  <span className={primitiveVisualTypographyClassNames.compactCaption}>
                    —
                  </span>
                )}
              </DenseListMaterialImageFrame>
              <Badge variant="neutral" size="xs">{material.unit}</Badge>
            </div>

            <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 shrink-0">
              <Badge variant="neutral" size="xs">
                <span className={primitiveVisualTypographyClassNames.compactCaption}>Кол:</span>
                <EstimateInlineNumberCell
                  value={material.qty}
                  onCommit={(value) => props.onPatch(material.id, 'qty', value)}
                  ariaLabel={`Количество: ${material.name}`}
                  className={MATERIAL_QTY_CLASS}
                />
              </Badge>
              <Badge variant="info" size="xs">
                <span className={primitiveVisualTypographyClassNames.compactCaption}>Расх:</span>
                <EstimateInlineNumberCell
                  value={material.expense}
                  onCommit={(value) => props.onPatch(material.id, 'expense', value)}
                  ariaLabel={`Расход: ${material.name}`}
                  className={MATERIAL_EXPENSE_CLASS}
                />
              </Badge>
            </div>

            <div className="flex items-center gap-1.5 shrink-0 ml-auto sm:ml-0">
              <Badge variant="neutral" size="xs">
                <span className="tabular-nums">
                  {INTEGER_FORMATTER.format(material.price)}
                </span>
                <span className={primitiveVisualTypographyClassNames.compactCaption}>₽/ед</span>
              </Badge>
              <Badge variant="success" size="xs">
                <MoneyCell value={material.sum} />
              </Badge>
            </div>
          </DenseListMaterialMeta>
        </div>

        <DenseListTrailingAction>
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
        </DenseListTrailingAction>
      </DenseListMaterialRow>
    </div>
  );
}
