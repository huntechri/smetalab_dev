'use client';

import { DenseListSummaryRail, DenseListToken } from '@/shared/ui/dense-list';
import { formatCurrency } from '@/lib/shared/formatters';

interface GlobalPurchasesSummaryProps {
  totalAmount: number;
}

export function GlobalPurchasesSummary({ totalAmount }: GlobalPurchasesSummaryProps) {
  return (
    <DenseListSummaryRail>
      <DenseListToken variant="info">
        Итого закупки: {formatCurrency(totalAmount)}
      </DenseListToken>
    </DenseListSummaryRail>
  );
}
