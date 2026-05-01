import { ChevronDown, ChevronRight, Pencil, Settings, Wrench } from 'lucide-react';
import { ActionMenu } from '@/shared/ui/action-menu';
import { Button } from '@/shared/ui/button';
import { MoneyCell } from '@/shared/ui/cells/money-cell';
import {
  DenseListActionsGrid,
  DenseListBodyRow,
  DenseListEmptyInset,
  DenseListNestedPanel,
  DenseListToken,
} from '@/shared/ui/dense-list';
import type { WorkNode } from '../../../lib/estimate-cards-table';
import type { EstimateCardsTableProps } from './types';
import { buildWorkActions } from './actions';
import { EstimateMaterialCard } from './EstimateMaterialCard';
import { EstimateInlineNumberCell } from './EstimateInlineNumberCell';
import { EstimateInlineTextCell } from './EstimateInlineTextCell';
import { EstimateMetricPill } from './EstimateMetricPill';
import { ESTIMATE_CARD_ICON_ACTION_CLASS, WORK_NAME_CLASS, WORK_NUMBER_CLASS } from './constants';

interface EstimateWorkCardProps {
  workNode: WorkNode;
  props: EstimateCardsTableProps;
  isWorkOpen: boolean;
}

export function EstimateWorkCard({
  workNode,
  props,
  isWorkOpen,
}: EstimateWorkCardProps) {
  const work = workNode.work;

  return (
    <div className="bg-card">
      <DenseListBodyRow>
        <Button
          variant="outline"
          size="icon-xs"
          className="mt-0.5 size-5 sm:size-6"
          aria-label={isWorkOpen ? 'Свернуть работу' : 'Развернуть работу'}
          onClick={() => props.onToggleExpand(work.id)}
        >
          {isWorkOpen ? (
            <ChevronDown className="size-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="size-4 text-muted-foreground" />
          )}
        </Button>

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-1 sm:gap-1.5 xl:flex-row xl:items-baseline xl:gap-2">
            <div className="flex items-baseline gap-1.5 min-w-0">
              <span className="shrink-0 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {work.code}
              </span>
              <div className="min-w-0 flex-1">
                <EstimateInlineTextCell
                  value={work.name}
                  onCommit={(value) => props.onPatch(work.id, 'name', value)}
                  ariaLabel={`Наименование: ${work.name}`}
                  title={work.name}
                  className={WORK_NAME_CLASS}
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1 sm:gap-1.5">
              <DenseListToken variant="neutral">{work.unit}</DenseListToken>
              <EstimateMetricPill>
                <span className="text-xs">Кол-во</span>
                <EstimateInlineNumberCell
                  value={work.qty}
                  onCommit={(value) => props.onPatch(work.id, 'qty', value)}
                  ariaLabel={`Количество: ${work.name}`}
                  className={WORK_NUMBER_CLASS}
                />
              </EstimateMetricPill>
              <EstimateMetricPill>
                <span className="text-xs">Цена</span>
                <EstimateInlineNumberCell
                  value={work.price}
                  onCommit={(value) => props.onPatch(work.id, 'price', value)}
                  ariaLabel={`Цена: ${work.name}`}
                  className={WORK_NUMBER_CLASS}
                />
                <span className="text-xs">₽</span>
              </EstimateMetricPill>
              <DenseListToken variant="success">
                <MoneyCell value={work.sum} />
              </DenseListToken>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
          <Button
            size="icon-xs"
            variant="outline"
            className={ESTIMATE_CARD_ICON_ACTION_CLASS}
            onClick={() => props.onOpenMaterialCatalog(work.id, work.name)}
            title="Добавить материал"
            aria-label="Добавить материал"
          >
            <Pencil className="size-3 sm:size-3.5" />
          </Button>
          <Button
            size="icon-xs"
            variant="outline"
            className={ESTIMATE_CARD_ICON_ACTION_CLASS}
            onClick={() => props.onInsertWorkAfter(work.id, work.name)}
            title="Добавить работу ниже"
            aria-label="Добавить работу ниже"
          >
            <Wrench className="size-3 sm:size-3.5" />
          </Button>
          <ActionMenu
            ariaLabel="Действия с работой"
            trigger={
              <Button
                size="icon-xs"
                variant="outline"
                className={ESTIMATE_CARD_ICON_ACTION_CLASS}
                aria-label="Действия с работой"
              >
                <Settings className="size-3 sm:size-3.5" />
              </Button>
            }
            items={buildWorkActions(work, props)}
          />
        </div>
      </DenseListBodyRow>

      {isWorkOpen ? (
        <DenseListNestedPanel>
          {workNode.materials.length > 0 ? (
            <>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground sm:mb-2">
                Материалы
              </p>

              <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                {workNode.materials.map((material) => (
                  <EstimateMaterialCard key={material.id} material={material} props={props} />
                ))}
              </div>
            </>
          ) : (
            <DenseListEmptyInset>
              У работы пока нет материалов.
            </DenseListEmptyInset>
          )}

          <DenseListActionsGrid>
            <Button
              variant="outline"
              size="xs"
              aria-label="Добавить материал"
              onClick={() => props.onOpenMaterialCatalog(work.id, work.name)}
            >
              + Материал
            </Button>
            <Button
              variant="outline"
              size="xs"
              aria-label="Добавить работу ниже"
              onClick={() => props.onInsertWorkAfter(work.id, work.name)}
            >
              + Работа
            </Button>
            <Button
              variant="destructive"
              size="xs"
              aria-label="Удалить работу"
              onClick={() => void props.onRemoveRow(work.id)}
            >
              Удалить
            </Button>
          </DenseListActionsGrid>
        </DenseListNestedPanel>
      ) : null}
    </div>
  );
}
