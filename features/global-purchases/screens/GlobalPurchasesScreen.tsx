'use client';

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { GlobalPurchasesTable } from '../components/GlobalPurchasesTable.client';
import type { ProjectOption, PurchaseRow } from '../types/dto';

interface GlobalPurchasesScreenProps {
    initialRows: PurchaseRow[];
    projectOptions: ProjectOption[];
}

export function GlobalPurchasesScreen({ initialRows, projectOptions }: GlobalPurchasesScreenProps) {
    return (
        <div className="space-y-6">
            <Breadcrumb className="px-1 md:px-0">
                <BreadcrumbList>
                    <BreadcrumbItem><BreadcrumbLink href="/app">Главная</BreadcrumbLink></BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem><BreadcrumbPage>Глобальные закупки</BreadcrumbPage></BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <div className="px-1 md:px-0">
                <h1 className="text-2xl font-semibold tracking-tight">Закупки по объектам</h1>
                <p className="text-sm text-muted-foreground">Ежедневный список закупок по материалам с ручным вводом и выбором из справочника.</p>
            </div>

            <GlobalPurchasesTable initialRows={initialRows} projectOptions={projectOptions} />
        </div>
    );
}
