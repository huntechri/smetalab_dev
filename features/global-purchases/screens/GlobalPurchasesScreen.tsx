'use client';

import { useBreadcrumbs } from '@/components/providers/breadcrumb-provider';
import { PageShell } from '@/shared/ui/page-shell';
import { TooltipProvider } from '@/shared/ui/tooltip';
import { GlobalPurchasesView } from '../components/GlobalPurchasesView.client';
import type { ProjectOption, PurchaseRow, PurchaseRowsRange, SupplierOption } from '@/shared/types/domain/purchase-row';

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
    <PageShell density="compact">
      <TooltipProvider>
        <GlobalPurchasesView
          initialRows={initialRows}
          projectOptions={projectOptions}
          supplierOptions={supplierOptions}
          initialRange={initialRange}
        />
      </TooltipProvider>
    </PageShell>
  );
}
