'use client';

import { Badge } from '@/shared/ui/badge';
import { DenseListSummaryRail } from '@/shared/ui/dense-list';
import { formatCurrency } from '@/lib/shared/formatters';

interface GlobalPurchasesSummaryProps {
  totalAmount: number;
}

export function GlobalPurchasesSummary({ totalAmount }: GlobalPurchasesSummaryProps) {
  return (
    <DenseListSummaryRail>
      <Badge variant="info" size="xs">
        Итого закупки: {formatCurrency(totalAmount)}
      </Badge>
    </DenseListSummaryRail>
  );
}
