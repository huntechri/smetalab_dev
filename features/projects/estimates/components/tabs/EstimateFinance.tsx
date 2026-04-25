'use client';

import { ProjectReceiptsSection } from '@/features/projects/dashboard/components/ProjectReceiptsSection';
import type { ProjectReceiptAggregates, ProjectReceiptRow } from '@/shared/types/project-receipts';

type EstimateFinanceProps = {
  projectId: string;
  initialRows: ProjectReceiptRow[];
  initialAggregates: ProjectReceiptAggregates;
};

export function EstimateFinance({ projectId, initialRows, initialAggregates }: EstimateFinanceProps) {
  return (
    <ProjectReceiptsSection
      projectId={projectId}
      initialRows={initialRows}
      initialAggregates={initialAggregates}
    />
  );
}
