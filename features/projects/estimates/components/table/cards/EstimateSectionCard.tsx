import { ChevronDown, ChevronRight, Settings } from 'lucide-react';
import { ActionMenu } from '@/shared/ui/action-menu';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { MoneyCell } from '@/shared/ui/cells/money-cell';
import type { SectionNode } from '../../../lib/estimate-cards-table';
import type { SectionTotals } from '../../../lib/section-totals';
import type { EstimateCardsTableProps } from './types';
import { buildSectionActions } from './actions';
import { EstimateWorkCard } from './EstimateWorkCard';

interface EstimateSectionCardProps {
  sectionNode: SectionNode;
  sectionTotals: SectionTotals;
  isSectionOpen: boolean;
  forceExpandForSearch: boolean;
  props: EstimateCardsTableProps;
  onToggleSection: (sectionId: string) => void;
}

export function EstimateSectionCard({
  sectionNode,
  sectionTotals,
  isSectionOpen,
  forceExpandForSearch,
  props,
  onToggleSection,
}: EstimateSectionCardProps) {
  const section = sectionNode.section;
  const sectionActions = buildSectionActions(section, props);

  return (
    <div
      key={section.id}
      className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm"
    >
      <div className="border-b border-slate-200 bg-white">
        <div className="flex min-w-0 items-center gap-1.5 px-2 py-2.5 sm:gap-2 sm:px-3.5 sm:py-3">
          <Button
            variant="ghost"
            size="icon-xs"
            className="mt-0.5 size-5 rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600 sm:size-6"
            aria-label={isSectionOpen ? 'Свернуть раздел' : 'Развернуть раздел'}
            onClick={() => onToggleSection(section.id)}
          >
            {isSectionOpen ? (
              <ChevronDown className="size-4 text-slate-500" />
            ) : (
              <ChevronRight className="size-4 text-slate-500" />
            )}
          </Button>

          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 items-center gap-2">
              <Badge
                variant="outline"
                size="xs"
                className="h-4 shrink-0 border-slate-200 bg-slate-100 px-1.5 py-0 text-[9px] leading-none text-slate-600 tracking-[0.08em] sm:h-5 sm:px-2 sm:text-[10px]"
              >
                {section.code}
              </Badge>
              <p
                className="min-w-0 truncate text-[9px] font-semibold leading-snug text-slate-800 sm:text-[11px]"
                title={section.name}
              >
                {section.name}
              </p>
            </div>
          </div>

          <div className="ml-auto flex items-center gap-3 sm:gap-6">
            <div className="text-right min-w-[60px] sm:min-w-[80px]">
              <p className="text-[9px] font-medium text-slate-400 sm:text-[11px]">Работы</p>
              <p className="text-[12px] font-bold tabular-nums text-slate-800 sm:text-sm">
                <MoneyCell value={sectionTotals.works} />
              </p>
            </div>
            <div className="text-right min-w-[60px] sm:min-w-[80px]">
              <p className="text-[9px] font-medium text-slate-400 sm:text-[11px]">Материалы</p>
              <p className="text-[12px] font-bold tabular-nums text-green-600 sm:text-sm">
                <MoneyCell value={sectionTotals.materials} />
              </p>
            </div>
          </div>

          {sectionActions.length > 0 ? (
            <ActionMenu
              ariaLabel="Действия с разделом"
              trigger={
                <Button
                  size="icon-xs"
                  variant="outline"
                  className="size-6 rounded-lg border-slate-200 bg-white text-slate-500 hover:bg-slate-50 sm:size-7"
                  aria-label="Действия с разделом"
                >
                  <Settings className="size-3.5" />
                </Button>
              }
              items={sectionActions}
            />
          ) : null}
        </div>
      </div>

      {isSectionOpen ? (
        <div className="divide-y divide-slate-200">
          {sectionNode.works.map((workNode) => {
            const work = workNode.work;
            const isWorkOpen = forceExpandForSearch || props.expandedWorkIds.has(work.id);

            return (
              <EstimateWorkCard
                key={work.id}
                workNode={workNode}
                props={props}
                isWorkOpen={isWorkOpen}
              />
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
