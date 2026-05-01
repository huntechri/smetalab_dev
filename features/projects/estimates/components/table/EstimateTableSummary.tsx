'use client';

import { Badge } from '@/shared/ui/badge';

interface EstimateTableSummaryProps {
  worksTotal: string;
  materialsTotal: string;
}

export function EstimateTableSummary({ worksTotal, materialsTotal }: EstimateTableSummaryProps) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border/60 bg-background/95 px-1 pt-1">
      <Badge variant="neutral" size="xs" className="h-4 sm:h-5 text-xs sm:text-xs">
        <span>Работы:</span>
        <span className="font-bold tabular-nums normal-case tracking-normal leading-4">{worksTotal}</span>
      </Badge>
      <Badge variant="neutral" size="xs" className="h-4 sm:h-5 text-xs sm:text-xs">
        <span>Материалы:</span>
        <span className="font-bold tabular-nums normal-case tracking-normal leading-4">{materialsTotal}</span>
      </Badge>
    </div>
  );
}
