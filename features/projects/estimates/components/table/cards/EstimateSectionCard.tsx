import { ChevronDown, ChevronRight, Settings } from 'lucide-react';
import { ActionMenu } from '@/shared/ui/action-menu';
import { Button } from '@/shared/ui/button';
import { MoneyCell } from '@/shared/ui/cells/money-cell';
import {
  DenseListBodyRow,
  DenseListStat,
  DenseListToken,
} from '@/shared/ui/dense-list';
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
      className="overflow-hidden rounded-xl border bg-card shadow-sm"
    >
      <div className="border-b bg-card">
        <DenseListBodyRow>
          <Button
            variant="ghost"
            size="icon-xs"
            className="mt-0.5 size-5 sm:size-6"
            aria-label={isSectionOpen ? 'Свернуть раздел' : 'Развернуть раздел'}
            onClick={() => onToggleSection(section.id)}
          >
            {isSectionOpen ? (
              <ChevronDown className="size-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="size-4 text-muted-foreground" />
            )}
          </Button>

          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 items-center gap-2">
              <DenseListToken variant="neutral">
                {section.code}
              </DenseListToken>
              <p
                className="min-w-0 truncate text-xs font-semibold leading-snug text-foreground"
                title={section.name}
              >
                {section.name}
              </p>
            </div>
          </div>

          <div className="ml-auto flex items-center gap-3 sm:gap-6">
            <DenseListStat label="Работы">
              <MoneyCell value={sectionTotals.works} />
            </DenseListStat>
            <DenseListStat label="Материалы" valueTone="success">
              <MoneyCell value={sectionTotals.materials} />
            </DenseListStat>
          </div>

          {sectionActions.length > 0 ? (
            <ActionMenu
              ariaLabel="Действия с разделом"
              trigger={
                <Button
                  size="icon-xs"
                  variant="outline"
                  className="size-6 sm:size-7"
                  aria-label="Действия с разделом"
                >
                  <Settings className="size-3.5" />
                </Button>
              }
              items={sectionActions}
            />
          ) : null}
        </DenseListBodyRow>
      </div>

      {isSectionOpen ? (
        <div className="divide-y">
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
