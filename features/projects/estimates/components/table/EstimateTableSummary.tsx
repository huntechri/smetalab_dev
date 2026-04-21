'use client';

import { Badge } from '@/shared/ui/badge';

interface EstimateTableSummaryProps {
  worksTotal: string;
  materialsTotal: string;
}

export function EstimateTableSummary({ worksTotal, materialsTotal }: EstimateTableSummaryProps) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border/60 bg-background/95 px-1 pt-1">
      <Badge variant="neutral" size="xs">
        <span>Работы:</span>
        <span className="text-[10px] font-bold tabular-nums normal-case tracking-normal leading-[15px]">{worksTotal}</span>
      </Badge>
      <Badge variant="neutral" size="xs">
        <span>Материалы:</span>
        <span className="text-[10px] font-bold tabular-nums normal-case tracking-normal leading-[15px]">{materialsTotal}</span>
      </Badge>
    </div>
  );
}
