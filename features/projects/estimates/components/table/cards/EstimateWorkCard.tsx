import { ChevronDown, ChevronRight, Pencil, Settings, Wrench } from 'lucide-react';
import { ActionMenu } from '@/shared/ui/action-menu';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { MoneyCell } from '@/shared/ui/cells/money-cell';
import type { WorkNode } from '../../../lib/estimate-cards-table';
import type { EstimateCardsTableProps } from './types';
import { buildWorkActions } from './actions';
import { EstimateMaterialCard } from './EstimateMaterialCard';
import { EstimateInlineNumberCell } from './EstimateInlineNumberCell';
import { EstimateInlineTextCell } from './EstimateInlineTextCell';
import { WORK_NAME_CLASS, WORK_NUMBER_CLASS } from './constants';

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
    <div className="bg-white">
      <div className="flex items-start gap-1.5 px-2 py-2.5 sm:gap-2 sm:px-3.5 sm:py-3">
        <Button
          variant="outline"
          size="icon-xs"
          className="mt-0.5 size-5 rounded-lg border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100 sm:size-6"
          aria-label={isWorkOpen ? 'Свернуть работу' : 'Развернуть работу'}
          onClick={() => props.onToggleExpand(work.id)}
        >
          {isWorkOpen ? (
            <ChevronDown className="size-4 text-slate-500" />
          ) : (
            <ChevronRight className="size-4 text-slate-500" />
          )}
        </Button>

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-1 sm:gap-1.5 xl:flex-row xl:items-baseline xl:gap-2">
            <div className="flex items-baseline gap-1.5 min-w-0">
              <span className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500 sm:text-[10px]">
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
              <Badge
                variant="outline"
                className="h-4 border-slate-200 bg-white px-2 py-0 text-[10px] leading-none text-slate-700 sm:h-5 sm:px-2.5 sm:text-[10px]"
              >
                {work.unit}
              </Badge>
              <div className="inline-flex h-4 items-center gap-1 rounded-full border border-slate-300 bg-slate-50 px-1.5 py-0 text-[10px] text-slate-600 sm:h-5 sm:px-2 sm:text-[10px]">
                <span>Кол-во</span>
                <EstimateInlineNumberCell
                  value={work.qty}
                  onCommit={(value) => props.onPatch(work.id, 'qty', value)}
                  ariaLabel={`Количество: ${work.name}`}
                  className={WORK_NUMBER_CLASS}
                />
              </div>
              <div className="inline-flex h-4 items-center gap-1 rounded-full border border-slate-300 bg-slate-50 px-1.5 py-0 text-[10px] text-slate-600 sm:h-5 sm:px-2 sm:text-[10px]">
                <span>Цена</span>
                <EstimateInlineNumberCell
                  value={work.price}
                  onCommit={(value) => props.onPatch(work.id, 'price', value)}
                  ariaLabel={`Цена: ${work.name}`}
                  className={WORK_NUMBER_CLASS}
                />
                <span>₽</span>
              </div>
              <Badge
                variant="success"
                className="h-4 border border-green-200 bg-green-100 px-2 py-0 text-[11px] font-bold leading-none text-green-600 sm:h-5 sm:px-2.5 sm:text-[10px]"
              >
                <MoneyCell value={work.sum} />
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
          <Button
            size="icon-xs"
            variant="outline"
            className="size-6 rounded-lg border-slate-200 bg-white text-slate-500 hover:bg-slate-50 sm:size-7"
            onClick={() => props.onOpenMaterialCatalog(work.id, work.name)}
            title="Добавить материал"
            aria-label="Добавить материал"
          >
            <Pencil className="size-3 sm:size-3.5" />
          </Button>
          <Button
            size="icon-xs"
            variant="outline"
            className="size-6 rounded-lg border-slate-200 bg-white text-slate-500 hover:bg-slate-50 sm:size-7"
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
                className="size-6 rounded-lg border-slate-200 bg-white text-slate-500 hover:bg-slate-50 sm:size-7"
                aria-label="Действия с работой"
              >
                <Settings className="size-3 sm:size-3.5" />
              </Button>
            }
            items={buildWorkActions(work, props)}
          />
        </div>
      </div>

      {isWorkOpen ? (
        <div className="border-t border-slate-100 bg-slate-50 px-2 py-2.5 sm:px-3.5 sm:py-3">
          {workNode.materials.length > 0 ? (
            <>
              <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400 sm:mb-2 sm:text-[11px]">
                Материалы
              </p>

              <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                {workNode.materials.map((material) => (
                  <EstimateMaterialCard key={material.id} material={material} props={props} />
                ))}
              </div>
            </>
          ) : (
            <div className="rounded-md border border-dashed border-slate-200 bg-white p-3 text-center text-xs text-slate-500">
              У работы пока нет материалов.
            </div>
          )}

          <div className="mt-3 grid grid-cols-3 gap-1.5 sm:mt-4 sm:max-w-[400px] sm:gap-2">
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
          </div>
        </div>
      ) : null}
    </div>
  );
}
