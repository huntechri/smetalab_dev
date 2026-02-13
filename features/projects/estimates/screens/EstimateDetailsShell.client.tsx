'use client';

import { Suspense, use } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EstimateRow } from '../types/dto';
import { EstimateParams } from '../components/tabs/EstimateParams';
import { EstimateProcurement } from '../components/tabs/EstimateProcurement';
import { EstimateExecution } from '../components/tabs/EstimateExecution';
import { EstimateDocuments } from '../components/tabs/EstimateDocuments';
import { EstimateTable } from '../components/table/EstimateTable.client';
import { Skeleton } from '@/components/ui/skeleton';

const availableTabs = new Set(['estimate', 'params', 'procurement', 'execution', 'docs']);

function EstimateTableLoader({ estimateId, rowsPromise }: { estimateId: string; rowsPromise: Promise<EstimateRow[]> }) {
    const rows = use(rowsPromise);
    return <EstimateTable estimateId={estimateId} initialRows={rows} />;
}

export function EstimateDetailsShell({ estimateId, rowsPromise }: { estimateId: string; rowsPromise: Promise<EstimateRow[]> }) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    const tabParam = searchParams.get('tab') ?? 'estimate';
    const tab = availableTabs.has(tabParam) ? tabParam : 'estimate';

    return (
        <Tabs
            value={tab}
            onValueChange={(nextValue) => {
                const params = new URLSearchParams(searchParams);
                params.set('tab', nextValue);
                router.replace(`${pathname}?${params.toString()}`);
            }}
        >
            <TabsList>
                <TabsTrigger value="estimate">Смета</TabsTrigger>
                <TabsTrigger value="params">Параметры</TabsTrigger>
                <TabsTrigger value="procurement">Закупки</TabsTrigger>
                <TabsTrigger value="execution">Исполнение</TabsTrigger>
                <TabsTrigger value="docs">Документы</TabsTrigger>
            </TabsList>
            <TabsContent value="estimate">
                <Suspense fallback={<Skeleton className="h-[520px] w-full" />}>
                    <EstimateTableLoader estimateId={estimateId} rowsPromise={rowsPromise} />
                </Suspense>
            </TabsContent>
            <TabsContent value="params"><EstimateParams /></TabsContent>
            <TabsContent value="procurement"><EstimateProcurement /></TabsContent>
            <TabsContent value="execution"><EstimateExecution /></TabsContent>
            <TabsContent value="docs"><EstimateDocuments /></TabsContent>
        </Tabs>
    );
}
