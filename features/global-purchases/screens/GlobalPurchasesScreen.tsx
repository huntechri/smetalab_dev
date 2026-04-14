'use client';

import { useBreadcrumbs } from '@/components/providers/breadcrumb-provider';
import { TooltipProvider } from '@/shared/ui/tooltip';
import { GlobalPurchasesTable } from '../components/GlobalPurchasesTable.client';
import type { ProjectOption, PurchaseRow, PurchaseRowsRange, SupplierOption } from '../types/dto';

interface GlobalPurchasesScreenProps {
  initialRows: PurchaseRow[];
  projectOptions: ProjectOption[];
  supplierOptions: SupplierOption[];
  initialRange: PurchaseRowsRange;
}

export function GlobalPurchasesScreen({ initialRows, projectOptions, supplierOptions, initialRange }: GlobalPurchasesScreenProps) {
  useBreadcrumbs([
    { label: 'Главная', href: '/app' },
    { label: 'Закупки' },
  ]);

  return (
    <div className="space-y-2">

      <TooltipProvider>
        <GlobalPurchasesTable
          initialRows={initialRows}
          projectOptions={projectOptions}
          supplierOptions={supplierOptions}
          initialRange={initialRange}
        />
      </TooltipProvider>
    </div>
  );
}
