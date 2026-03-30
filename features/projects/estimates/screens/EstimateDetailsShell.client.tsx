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


function EstimateTableLoader({ estimateId, rowsPromise, initialCoefPercent, projectSlug, estimateName }: { estimateId: string; rowsPromise: Promise<EstimateRow[]>; initialCoefPercent: number; projectSlug: string; estimateName: string }) {
    const rows = use(rowsPromise);
    return <EstimateTable estimateId={estimateId} initialRows={rows} initialCoefPercent={initialCoefPercent} projectSlug={projectSlug} estimateName={estimateName} />;
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

            // Keep tab content mounted to avoid losing optimistic estimate table state between tab switches.
            <Tabs
                value={tab}
                onValueChange={(nextValue) => {
                    setTab(nextValue);
                    const nextHref = buildTabHref(pathname, searchParams.toString(), nextValue);
                    window.history.replaceState(window.history.state, '', nextHref);
                }}
            >
                <TabsList className="w-[540px] max-w-full justify-start overflow-x-auto h-auto p-1 bg-muted/40 backdrop-blur-sm border border-border/40 no-scrollbar">
                    <TabsTrigger value="estimate" className="px-5 py-2.5 text-xs font-semibold tracking-wide data-[state=active]:bg-sidebar-primary data-[state=active]:text-sidebar-primary-foreground transition-all duration-200">Смета</TabsTrigger>
                    <TabsTrigger value="params" className="px-5 py-2.5 text-xs font-semibold tracking-wide data-[state=active]:bg-sidebar-primary data-[state=active]:text-sidebar-primary-foreground transition-all duration-200">Параметры</TabsTrigger>
                    <TabsTrigger value="procurement" className="px-5 py-2.5 text-xs font-semibold tracking-wide data-[state=active]:bg-sidebar-primary data-[state=active]:text-sidebar-primary-foreground transition-all duration-200">Закупки</TabsTrigger>
                    <TabsTrigger value="execution" className="px-5 py-2.5 text-xs font-semibold tracking-wide data-[state=active]:bg-sidebar-primary data-[state=active]:text-sidebar-primary-foreground transition-all duration-200">Выполнение</TabsTrigger>
                    <TabsTrigger value="docs" className="px-5 py-2.5 text-xs font-semibold tracking-wide data-[state=active]:bg-sidebar-primary data-[state=active]:text-sidebar-primary-foreground transition-all duration-200">Документы</TabsTrigger>
                </TabsList>
                <TabsContent value="estimate" forceMount className="mt-2">
                    <Suspense fallback={<Skeleton className="h-[520px] w-full" />}>
                        <EstimateTableLoader estimateId={estimateId} rowsPromise={rowsPromise} initialCoefPercent={initialCoefPercent} projectSlug={project.slug} estimateName={estimate.name} />
                    </Suspense>
                </TabsContent>
                <TabsContent value="params" forceMount className="mt-2">
                    {loadedTabs.has('params') ? (
                        <Suspense fallback={<Skeleton className="h-[520px] w-full" />}>
                            <EstimateParamsLoader estimateId={estimateId} roomParamsPromise={roomParamsPromise} />
                        </Suspense>
                    ) : (
                        <Skeleton className="h-[520px] w-full" />
                    )}
                </TabsContent>
                <TabsContent value="procurement" forceMount className="mt-2">
                    {loadedTabs.has('procurement') ? <EstimateProcurement estimateId={estimateId} /> : <Skeleton className="h-[520px] w-full" />}
                </TabsContent>
                <TabsContent value="execution" forceMount className="mt-2">
                    {loadedTabs.has('execution') ? <EstimateExecution estimateId={estimateId} /> : <Skeleton className="h-[520px] w-full" />}
                </TabsContent>
                <TabsContent value="docs" forceMount className="mt-2">
                    {loadedTabs.has('docs') ? <EstimateDocuments /> : <Skeleton className="h-[240px] w-full" />}
                </TabsContent>
            </Tabs>
        </div>
    );
}

export const __estimateDetailsShellInternal = {
    buildTabHref,
};
