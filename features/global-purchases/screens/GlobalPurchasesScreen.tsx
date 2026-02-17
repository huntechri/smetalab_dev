'use client';

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { TooltipProvider } from '@/components/ui/tooltip';
import { GlobalPurchasesTable } from '../components/GlobalPurchasesTable.client';
import type { ProjectOption, PurchaseRow, PurchaseRowsRange } from '../types/dto';

interface GlobalPurchasesScreenProps {
    initialRows: PurchaseRow[];
    projectOptions: ProjectOption[];
    initialRange: PurchaseRowsRange;
}

export function GlobalPurchasesScreen({ initialRows, projectOptions, initialRange }: GlobalPurchasesScreenProps) {
    return (
        <div className="space-y-6">
            <Breadcrumb className="px-1 md:px-0 text-xs md:text-sm">
                <BreadcrumbList>
                    <BreadcrumbItem><BreadcrumbLink href="/app">Главная</BreadcrumbLink></BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem><BreadcrumbPage>Закупки</BreadcrumbPage></BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <TooltipProvider>
                <GlobalPurchasesTable initialRows={initialRows} projectOptions={projectOptions} initialRange={initialRange} />
            </TooltipProvider>
        </div>
    );
}
