'use client';

import { BookOpen, Plus } from 'lucide-react';

import { Button } from '@/shared/ui/button';

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
      <Button variant="brand" onClick={onAddManual} disabled={isAddingManual}>
        <Plus className="size-3.5 mr-2" />
        Добавить вручную
      </Button>
      <Button variant="brand" onClick={onOpenCatalog} disabled={isAddingCatalog}>
        <BookOpen className="size-3.5 mr-2" />
        Из справочника
      </Button>
    </div>
  );
}
