'use client';

import { BookOpen, Plus } from 'lucide-react';

import { ToolbarButton } from '@/shared/ui/toolbar-button';

interface GlobalPurchasesEmptyStateActionsProps {
  isAddingManual: boolean;
  isAddingCatalog: boolean;
  onAddManual: () => void;
  onOpenCatalog: () => void;
}

export function GlobalPurchasesEmptyStateActions({
  isAddingManual,
  isAddingCatalog,
  onAddManual,
  onOpenCatalog,
}: GlobalPurchasesEmptyStateActionsProps) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <ToolbarButton variant="brand" onClick={onAddManual} disabled={isAddingManual} iconLeft={<Plus className="size-3.5" />}>
        Добавить вручную
      </ToolbarButton>
      <ToolbarButton variant="brand" onClick={onOpenCatalog} disabled={isAddingCatalog} iconLeft={<BookOpen className="size-3.5" />}>
        Из справочника
      </ToolbarButton>
    </div>
  );
}
