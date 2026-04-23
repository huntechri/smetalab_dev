'use client';

import { useMemo } from 'react';
import {
  buildSectionNodes,
  filterSectionsByQuery,
} from '../../lib/estimate-cards-table';
import { useEstimateSectionsExpansion } from '../../hooks/use-estimate-sections-expansion';
import { EstimateSectionCard } from './cards/EstimateSectionCard';
import type { EstimateCardsTableProps } from './cards/types';

export type { EstimateCardsTableProps } from './cards/types';

export function EstimateCardsTable(props: EstimateCardsTableProps) {
  const sectionNodes = useMemo(() => buildSectionNodes(props.rows), [props.rows]);
  const filteredSections = useMemo(
    () => filterSectionsByQuery(sectionNodes, props.searchValue),
    [props.searchValue, sectionNodes],
  );
  const { expandedSectionIds, toggleSection } =
    useEstimateSectionsExpansion(sectionNodes);

  if (filteredSections.length === 0) {
    return (
      <div className="flex min-h-52 items-center justify-center rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
        По вашему запросу ничего не найдено.
      </div>
    );
  }

  const forceExpandForSearch = props.searchValue.trim().length > 0;

  return (
    <div className="space-y-2">
      {filteredSections.map((sectionNode) => {
        const section = sectionNode.section;
        const sectionTotals = props.sectionTotalsById.get(section.id) ?? {
          works: 0,
          materials: 0,
          total: 0,
        };
        const isSectionOpen =
          forceExpandForSearch || expandedSectionIds.has(section.id);

        return (
          <EstimateSectionCard
            key={section.id}
            sectionNode={sectionNode}
            sectionTotals={sectionTotals}
            isSectionOpen={isSectionOpen}
            forceExpandForSearch={forceExpandForSearch}
            props={props}
            onToggleSection={toggleSection}
          />
        );
      })}
    </div>
  );
}
