'use client';

import {
  DenseListEmptyBlock,
  DenseListStack,
  DenseListViewport,
} from '@/shared/ui/dense-list';
import { GlobalPurchaseCard } from './cards/GlobalPurchaseCard';
import type { GlobalPurchasesCardsListProps } from './cards/types';

export function GlobalPurchasesCardsList({
  rows,
  projectOptions,
  supplierOptions,
  pendingIds,
  emptyState,
  onPatchAction,
  onRemoveAction,
}: GlobalPurchasesCardsListProps) {
  if (rows.length === 0) {
    return <DenseListEmptyBlock>{emptyState}</DenseListEmptyBlock>;
  }

  return (
    <DenseListViewport size="large">
      <DenseListStack>
        {rows.map((row) => (
          <GlobalPurchaseCard
            key={row.id}
            row={row}
            projectOptions={projectOptions}
            supplierOptions={supplierOptions}
            pendingIds={pendingIds}
            onPatchAction={onPatchAction}
            onRemoveAction={onRemoveAction}
          />
        ))}
      </DenseListStack>
    </DenseListViewport>
  );
}
