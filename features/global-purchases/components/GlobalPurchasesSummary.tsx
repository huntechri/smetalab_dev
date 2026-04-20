'use client';

import { Badge } from '@/shared/ui/badge';
import { formatCurrency } from '@/lib/shared/formatters';

interface GlobalPurchasesSummaryProps {
  totalAmount: number;
}

export function GlobalPurchasesSummary({ totalAmount }: GlobalPurchasesSummaryProps) {
  return (
    <div className="flex flex-wrap justify-end gap-2 px-1 -mb-[14px]">
      <Badge
        variant="secondary"
        className="bg-blue-500/5 text-blue-700/80 border-none px-2 py-0.5 h-6 text-[10px] font-bold uppercase tracking-wider tabular-nums"
      >
        Итого закупки: {formatCurrency(totalAmount)}
      </Badge>
    </div>
  );
}
