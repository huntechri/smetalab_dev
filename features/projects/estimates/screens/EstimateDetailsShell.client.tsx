'use client';

import { Suspense, use, useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import {
    WorkspaceTabs,
    WorkspaceTabsContent,
    WorkspaceTabsFallback,
    WorkspaceTabsList,
    WorkspaceTabsTrigger,
} from '@/shared/ui/workspace-tabs';
import { EstimateRow } from '../types/dto';
import { EstimateRoomParam } from '../types/room-params.dto';
import type { EstimateExecutionRow } from '../types/execution.dto';
import type { EstimateProcurementRow } from '@/shared/types/estimate-procurement';
import type { ProjectReceiptAggregates, ProjectReceiptRow } from '@/shared/types/project-receipts';
import { EstimateTable } from '../components/table/EstimateTable.client';
import { EstimateExecution } from '../components/tabs/EstimateExecution';
import { EstimateProcurement } from '../components/tabs/EstimateProcurement';
import { EstimateFinance } from '../components/tabs/EstimateFinance';
import { useBreadcrumbs } from '@/components/providers/breadcrumb-provider';

const availableTabs = new Set(['estimate', 'params', 'procurement', 'execution', 'finance', 'docs']);

const EstimateParams = dynamic(
    () => import('../components/tabs/EstimateParams').then((mod) => mod.EstimateParams),
    { loading: () => <WorkspaceTabsFallback /> },
);

const EstimateDocuments = dynamic(
    () => import('../components/tabs/EstimateDocuments').then((mod) => mod.EstimateDocuments),
    { loading: () => <WorkspaceTabsFallback size="compact" /> },
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

function EstimateProcurementLoader({ estimateId, procurementRowsPromise }: { estimateId: string; procurementRowsPromise: Promise<EstimateProcurementRow[]> }) {
    const procurementRows = use(procurementRowsPromise);
    return <EstimateProcurement estimateId={estimateId} initialRows={procurementRows} />;
}

function EstimateExecutionLoader({ estimateId, executionRowsPromise }: { estimateId: string; executionRowsPromise: Promise<EstimateExecutionRow[]> }) {
    const executionRows = use(executionRowsPromise);
    return <EstimateExecution estimateId={estimateId} initialRows={executionRows} />;
}

function EstimateFinanceLoader({ projectId, financeRowsPromise, financeAggregatesPromise }: { projectId: string; financeRowsPromise: Promise<ProjectReceiptRow[]>; financeAggregatesPromise: Promise<ProjectReceiptAggregates> }) {
    const financeRows = use(financeRowsPromise);
    const financeAggregates = use(financeAggregatesPromise);
    return <EstimateFinance projectId={projectId} initialRows={financeRows} initialAggregates={financeAggregates} />;
}

interface EstimateDetailsShellProps {
    initialCoefPercent: number;
    estimateId: string;
    rowsPromise: Promise<EstimateRow[]>;
    roomParamsPromise: Promise<EstimateRoomParam[]>;
    executionRowsPromise: Promise<EstimateExecutionRow[]>;
    procurementRowsPromise: Promise<EstimateProcurementRow[]>;
    financeRowsPromise: Promise<ProjectReceiptRow[]>;
    financeAggregatesPromise: Promise<ProjectReceiptAggregates>;
    project: { id: string; name: string; slug: string };
    estimate: { name: string; slug: string };
}

export function EstimateDetailsShell({ estimateId, rowsPromise, roomParamsPromise, executionRowsPromise, procurementRowsPromise, financeRowsPromise, financeAggregatesPromise, project, estimate, initialCoefPercent }: EstimateDetailsShellProps) {
    const router = useRouter();
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
            if (prev.has(tab)) return prev;
            const next = new Set(prev);
            next.add(tab);
            return next;
        });
    }, [tab]);

    return (
        <WorkspaceTabs
            value={tab}
            onValueChange={(nextValue) => {
                setTab(nextValue);
                router.replace(buildTabHref(pathname, searchParams.toString(), nextValue), { scroll: false });
            }}
        >
            <WorkspaceTabsList>
                <WorkspaceTabsTrigger value="estimate">Смета</WorkspaceTabsTrigger>
                <WorkspaceTabsTrigger value="params">Параметры</WorkspaceTabsTrigger>
                <WorkspaceTabsTrigger value="procurement">Закупки</WorkspaceTabsTrigger>
                <WorkspaceTabsTrigger value="execution">Выполнение</WorkspaceTabsTrigger>
                <WorkspaceTabsTrigger value="finance">Финансы</WorkspaceTabsTrigger>
                <WorkspaceTabsTrigger value="docs">Документы</WorkspaceTabsTrigger>
            </WorkspaceTabsList>
            <WorkspaceTabsContent value="estimate" forceMount>
                <Suspense fallback={<WorkspaceTabsFallback />}>
                    <EstimateTableLoader estimateId={estimateId} rowsPromise={rowsPromise} initialCoefPercent={initialCoefPercent} projectSlug={project.slug} estimateName={estimate.name} />
                </Suspense>
            </WorkspaceTabsContent>
            <WorkspaceTabsContent value="params">
                {loadedTabs.has('params') ? (
                    <Suspense fallback={<WorkspaceTabsFallback />}>
                        <EstimateParamsLoader estimateId={estimateId} roomParamsPromise={roomParamsPromise} />
                    </Suspense>
                ) : <WorkspaceTabsFallback />}
            </WorkspaceTabsContent>
            <WorkspaceTabsContent value="procurement">
                <Suspense fallback={<WorkspaceTabsFallback />}>
                    <EstimateProcurementLoader estimateId={estimateId} procurementRowsPromise={procurementRowsPromise} />
                </Suspense>
            </WorkspaceTabsContent>
            <WorkspaceTabsContent value="execution">
                <Suspense fallback={<WorkspaceTabsFallback />}>
                    <EstimateExecutionLoader estimateId={estimateId} executionRowsPromise={executionRowsPromise} />
                </Suspense>
            </WorkspaceTabsContent>
            <WorkspaceTabsContent value="finance">
                {loadedTabs.has('finance') ? (
                    <Suspense fallback={<WorkspaceTabsFallback />}>
                        <EstimateFinanceLoader projectId={project.id} financeRowsPromise={financeRowsPromise} financeAggregatesPromise={financeAggregatesPromise} />
                    </Suspense>
                ) : <WorkspaceTabsFallback />}
            </WorkspaceTabsContent>
            <WorkspaceTabsContent value="docs">
                {loadedTabs.has('docs') ? <EstimateDocuments /> : <WorkspaceTabsFallback size="compact" />}
            </WorkspaceTabsContent>
        </WorkspaceTabs>
    );
}

export const __estimateDetailsShellInternal = { buildTabHref };
