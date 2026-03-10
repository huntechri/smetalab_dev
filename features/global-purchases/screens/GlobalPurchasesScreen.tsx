'use client';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/shared/ui/breadcrumb';
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
  return (
    <div className="space-y-4">
      <Breadcrumb className="px-1 md:px-0 text-xs md:text-sm">
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink href="/app">Главная</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbPage>Закупки</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

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
