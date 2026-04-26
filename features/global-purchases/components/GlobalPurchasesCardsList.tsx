'use client';

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
    return <div className="px-3 py-8">{emptyState}</div>;
  }

  return (
    <div className="max-h-[625px] overflow-y-auto px-1.5 pb-1.5 sm:px-3 sm:pb-3">
      <div className="space-y-2">
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
      </div>
    </div>
  );
}
