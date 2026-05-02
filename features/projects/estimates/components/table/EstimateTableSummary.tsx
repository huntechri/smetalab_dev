'use client';

import { StatusBadge, StatusBadgeValue } from '@/shared/ui/status-badge';

interface EstimateTableSummaryProps {
  worksTotal: string;
  materialsTotal: string;
}

export function EstimateTableSummary({ worksTotal, materialsTotal }: EstimateTableSummaryProps) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border/60 bg-background/95 px-1 pt-1">
      <StatusBadge tone="neutral">
        <span>{'Работы:'}</span>
        <StatusBadgeValue>{worksTotal}</StatusBadgeValue>
      </StatusBadge>
      <StatusBadge tone="neutral">
        <span>{'Материалы:'}</span>
        <StatusBadgeValue>{materialsTotal}</StatusBadgeValue>
      </StatusBadge>
    </div>
  );
}
