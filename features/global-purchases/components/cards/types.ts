import type React from 'react';
import type { ProjectOption, PurchaseRow, PurchaseRowPatch, SupplierOption } from '../../types/dto';

export type GlobalPurchasesCardsListProps = {
  rows: PurchaseRow[];
  projectOptions: ProjectOption[];
  supplierOptions: SupplierOption[];
  pendingIds: Set<string>;
  emptyState: React.ReactNode;
  onPatchAction: (rowId: string, patch: PurchaseRowPatch) => Promise<void>;
  onRemoveAction: (rowId: string) => Promise<void>;
};

export type GlobalPurchaseCardProps = Omit<GlobalPurchasesCardsListProps, 'rows' | 'emptyState'> & {
  row: PurchaseRow;
};
