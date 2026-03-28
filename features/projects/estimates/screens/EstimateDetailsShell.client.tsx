'use client';

import { Suspense, use, useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { EstimateRow } from '../types/dto';
import { EstimateRoomParam } from '../types/room-params.dto';
import { EstimateTable } from '../components/table/EstimateTable.client';
import { Skeleton } from '@/shared/ui/skeleton';
import { useBreadcrumbs } from '@/components/providers/breadcrumb-provider';
import Link from 'next/link';

const availableTabs = new Set(['estimate', 'params', 'procurement', 'execution', 'docs']);

const EstimateParams = dynamic(
    () => import('../components/tabs/EstimateParams').then((mod) => mod.EstimateParams),
    {
        loading: () => <Skeleton className="h-[520px] w-full" />,
    },
);

const EstimateProcurement = dynamic(
    () => import('../components/tabs/EstimateProcurement').then((mod) => mod.EstimateProcurement),
    {
        loading: () => <Skeleton className="h-[520px] w-full" />,
    },
);

const EstimateExecution = dynamic(
    () => import('../components/tabs/EstimateExecution').then((mod) => mod.EstimateExecution),
    {
        loading: () => <Skeleton className="h-[520px] w-full" />,
    },
);

const EstimateDocuments = dynamic(
    () => import('../components/tabs/EstimateDocuments').then((mod) => mod.EstimateDocuments),
    {
        loading: () => <Skeleton className="h-[240px] w-full" />,
    },
);





const buildTabHref = (pathname: string, search: string, nextTab: string) => {
    const params = new URLSearchParams(search);
    params.set('tab', nextTab);
    const query = params.toString();
    return query.length > 0 ? `${pathname}?${query}` : pathname;
};


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
    const pathname = usePathname();

    const tabParam = searchParams.get('tab') ?? 'estimate';
    const initialTab = availableTabs.has(tabParam) ? tabParam : 'estimate';
    const [tab, setTab] = useState(initialTab);
    const [loadedTabs, setLoadedTabs] = useState<Set<string>>(() => new Set([initialTab]));

    useEffect(() => {
        const nextTab = availableTabs.has(tabParam) ? tabParam : 'estimate';
        setTab(nextTab);
    }, [tabParam]);

    useBreadcrumbs([
        { label: 'Главная', href: '/app' },
        { label: 'Проекты', href: '/app/projects' },
        { label: project.name, href: `/app/projects/${project.slug}` },
        { label: estimate.name },
    ]);

    useEffect(() => {
        setLoadedTabs((prev) => {
            if (prev.has(tab)) {
                return prev;
            }

            const next = new Set(prev);
            next.add(tab);
            return next;
        });
    }, [tab]);

    return (
        <div className="space-y-2">

            <Tabs
                value={tab}
                onValueChange={(nextValue) => {
                    setTab(nextValue);
                    const nextHref = buildTabHref(pathname, searchParams.toString(), nextValue);
                    window.history.replaceState(window.history.state, '', nextHref);
                }}
            >
                <TabsList className="w-[540px] max-w-full justify-start overflow-x-auto h-auto p-1 bg-muted/40 backdrop-blur-sm border border-border/40 no-scrollbar">
                    <TabsTrigger value="estimate" className="px-4 py-2 text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Смета</TabsTrigger>
                    <TabsTrigger value="params" className="px-4 py-2 text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Параметры</TabsTrigger>
                    <TabsTrigger value="procurement" className="px-4 py-2 text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Закупки</TabsTrigger>
                    <TabsTrigger value="execution" className="px-4 py-2 text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Выполнение</TabsTrigger>
                    <TabsTrigger value="docs" className="px-4 py-2 text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Документы</TabsTrigger>
                </TabsList>
                <TabsContent value="estimate" className="mt-2">
                    <Suspense fallback={<Skeleton className="h-[520px] w-full" />}>
                        <EstimateTableLoader estimateId={estimateId} rowsPromise={rowsPromise} initialCoefPercent={initialCoefPercent} />
                    </Suspense>
                </TabsContent>
                <TabsContent value="params" className="mt-2">
                    {loadedTabs.has('params') ? (
                        <Suspense fallback={<Skeleton className="h-[520px] w-full" />}>
                            <EstimateParamsLoader estimateId={estimateId} roomParamsPromise={roomParamsPromise} />
                        </Suspense>
                    ) : (
                        <Skeleton className="h-[520px] w-full" />
                    )}
                </TabsContent>
                <TabsContent value="procurement" className="mt-2">
                    {loadedTabs.has('procurement') ? <EstimateProcurement estimateId={estimateId} /> : <Skeleton className="h-[520px] w-full" />}
                </TabsContent>
                <TabsContent value="execution" className="mt-2">
                    {loadedTabs.has('execution') ? <EstimateExecution estimateId={estimateId} /> : <Skeleton className="h-[520px] w-full" />}
                </TabsContent>
                <TabsContent value="docs" className="mt-2">
                    {loadedTabs.has('docs') ? <EstimateDocuments /> : <Skeleton className="h-[240px] w-full" />}
                </TabsContent>
            </Tabs>
        </div>
    );
}

export const __estimateDetailsShellInternal = {
    buildTabHref,
};
