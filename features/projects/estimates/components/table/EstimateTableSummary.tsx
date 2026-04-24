'use client';

import { Badge } from '@/shared/ui/badge';

interface EstimateTableSummaryProps {
  worksTotal: string;
  materialsTotal: string;
}

export function EstimateTableSummary({ worksTotal, materialsTotal }: EstimateTableSummaryProps) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border/60 bg-background/95 px-1 pt-1">
      <Badge variant="neutral" size="xs" className="h-4 sm:h-5 text-[9px] sm:text-[10px]">
        <span>Работы:</span>
        <span className="font-bold tabular-nums normal-case tracking-normal leading-[15px]">{worksTotal}</span>
      </Badge>
      <Badge variant="neutral" size="xs" className="h-4 sm:h-5 text-[9px] sm:text-[10px]">
        <span>Материалы:</span>
        <span className="font-bold tabular-nums normal-case tracking-normal leading-[15px]">{materialsTotal}</span>
      </Badge>
    </div>
  );
}
