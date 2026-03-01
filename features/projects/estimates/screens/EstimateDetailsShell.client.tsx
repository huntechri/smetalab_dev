'use client';

import { Suspense, use } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { EstimateRow } from '../types/dto';
import { EstimateRoomParam } from '../types/room-params.dto';
import { EstimateParams } from '../components/tabs/EstimateParams';
import { EstimateProcurement } from '../components/tabs/EstimateProcurement';
import { EstimateExecution } from '../components/tabs/EstimateExecution';
import { EstimateDocuments } from '../components/tabs/EstimateDocuments';
import { EstimateTable } from '../components/table/EstimateTable.client';
import { Skeleton } from '@/shared/ui/skeleton';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/shared/ui/breadcrumb';
import Link from 'next/link';

const availableTabs = new Set(['estimate', 'params', 'procurement', 'execution', 'docs']);

function EstimateTableLoader({ estimateId, rowsPromise, initialCoefPercent }: { estimateId: string; rowsPromise: Promise<EstimateRow[]>; initialCoefPercent: number }) {
    const rows = use(rowsPromise);
    return <EstimateTable estimateId={estimateId} initialRows={rows} initialCoefPercent={initialCoefPercent} />;
}

function EstimateParamsLoader({ estimateId, roomParamsPromise }: { estimateId: string; roomParamsPromise: Promise<EstimateRoomParam[]> }) {
    const roomParams = use(roomParamsPromise);
    return <EstimateParams estimateId={estimateId} initialRows={roomParams} />;
}

interface EstimateDetailsShellProps {
    initialCoefPercent: number;
    estimateId: string;
    rowsPromise: Promise<EstimateRow[]>;
    roomParamsPromise: Promise<EstimateRoomParam[]>;
    project: {
        name: string;
        slug: string;
    };
    estimate: {
        name: string;
        slug: string;
    };
}

export function EstimateDetailsShell({ estimateId, rowsPromise, roomParamsPromise, project, estimate, initialCoefPercent }: EstimateDetailsShellProps) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    const tabParam = searchParams.get('tab') ?? 'estimate';
    const tab = availableTabs.has(tabParam) ? tabParam : 'estimate';

    return (
        <div className="space-y-2">
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                            <Link href="/app">Главная</Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                            <Link href="/app/projects">Проекты</Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                            <Link href={`/app/projects/${project.slug}`}>{project.name}</Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage>{estimate.name}</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <Tabs
                value={tab}
                onValueChange={(nextValue) => {
                    const params = new URLSearchParams(searchParams);
                    params.set('tab', nextValue);
                    router.replace(`${pathname}?${params.toString()}`);
                }}
            >
                <TabsList className="w-full justify-start overflow-x-auto h-auto p-1 bg-muted/40 backdrop-blur-sm border border-border/40 no-scrollbar">
                    <TabsTrigger value="estimate" className="px-4 py-2 text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Смета</TabsTrigger>
                    <TabsTrigger value="params" className="px-4 py-2 text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Параметры</TabsTrigger>
                    <TabsTrigger value="procurement" className="px-4 py-2 text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Закупки</TabsTrigger>
                    <TabsTrigger value="execution" className="px-4 py-2 text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Выполнение</TabsTrigger>
                    <TabsTrigger value="docs" className="px-4 py-2 text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Документы</TabsTrigger>
                </TabsList>
                <TabsContent value="estimate" className="mt-2 md:mt-3">
                    <Suspense fallback={<Skeleton className="h-[520px] w-full" />}>
                        <EstimateTableLoader estimateId={estimateId} rowsPromise={rowsPromise} initialCoefPercent={initialCoefPercent} />
                    </Suspense>
                </TabsContent>
                <TabsContent value="params" className="mt-2 md:mt-3">
                    <Suspense fallback={<Skeleton className="h-[520px] w-full" />}>
                        <EstimateParamsLoader estimateId={estimateId} roomParamsPromise={roomParamsPromise} />
                    </Suspense>
                </TabsContent>
                <TabsContent value="procurement"><EstimateProcurement estimateId={estimateId} /></TabsContent>
                <TabsContent value="execution"><EstimateExecution estimateId={estimateId} /></TabsContent>
                <TabsContent value="docs"><EstimateDocuments /></TabsContent>
            </Tabs>
        </div>
    );
}
