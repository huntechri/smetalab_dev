import Image from 'next/image';
import { Settings } from 'lucide-react';
import { ActionMenu } from '@/shared/ui/action-menu';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { MoneyCell } from '@/shared/ui/cells/money-cell';
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
      <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-1.5 sm:gap-2">
        <div className="min-w-0 overflow-hidden">
          <div className="flex min-w-0 items-start gap-1.5">
            <span className="mt-1 shrink-0 text-[9px] font-semibold text-slate-500 sm:text-[11px]">
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

          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1.5 text-[9px] text-slate-500 sm:mt-0.5 sm:text-[11px]">
            <div className="flex items-center gap-1.5 shrink-0">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50 sm:h-7 sm:w-7">
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
                  <span className="text-[11px] font-medium text-slate-400 sm:text-[12px]">
                    —
                  </span>
                )}
              </div>
              <Badge
                variant="outline"
                className="h-4 shrink-0 border-slate-200 bg-white px-1 py-0 text-[9px] leading-none text-slate-600 sm:h-5 sm:px-1.5 sm:text-[10px]"
              >
                {material.unit}
              </Badge>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <EstimateMetricPill density="material">
                <span className="opacity-70 text-[9px] sm:text-[10px]">Кол:</span>
                <EstimateInlineNumberCell
                  value={material.qty}
                  onCommit={(value) => props.onPatch(material.id, 'qty', value)}
                  ariaLabel={`Количество: ${material.name}`}
                  className={MATERIAL_QTY_CLASS}
                />
              </EstimateMetricPill>
              <EstimateMetricPill density="material" tone="info">
                <span className="opacity-70 text-[9px] sm:text-[10px]">Расх:</span>
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
              <Badge
                variant="success"
                className="h-4 border border-green-200 bg-green-100 px-1.5 py-0 text-[9px] font-bold leading-none text-green-600 sm:h-5 sm:px-2 sm:text-[10px]"
              >
                <MoneyCell value={material.sum} />
              </Badge>
            </div>
          </div>
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
      </div>
    </div>
  );
}
