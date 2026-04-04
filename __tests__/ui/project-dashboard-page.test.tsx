import React from 'react';
import { render, screen } from '@testing-library/react';
import { expect, test, vi } from 'vitest';

import Page from '@/app/(workspace)/app/projects/[projectId]/page';
import { getEstimatesByProjectId } from '@/lib/data/estimates/repo';
import { ProjectDashboardKpiService } from '@/lib/services/project-dashboard-kpi.service';
import { ProjectPerformanceDynamicsService } from '@/lib/services/project-performance-dynamics.service';
import { ProjectReceiptsService } from '@/lib/services/project-receipts.service';

const projectDashboardSpy = vi.fn(({ project }: { project: { name: string }; estimates: Array<{ id: string }> }) => (
    <div data-testid="project-dashboard">{project.name}</div>
));

vi.mock('@/features/projects/dashboard/screens/ProjectDashboard', () => ({
    ProjectDashboard: (props: { project: { name: string }; estimates: Array<{ id: string }> }) => projectDashboardSpy(props),
}));

vi.mock('next/navigation', () => ({
    redirect: vi.fn(),
    notFound: vi.fn(),
}));

vi.mock('@/lib/data/db/queries', () => ({
    getTeamForUser: vi.fn(async () => ({ id: 1, name: 'Test Team' })),
}));

vi.mock('@/lib/data/projects/repo', () => ({
    getProjectBySlug: vi.fn(async () => ({
        id: 'uuid-1',
        slug: 'north-park',
        name: 'ЖК «Северный парк»',
        customerName: 'ООО СеверСтрой',
        counterpartyId: 'f95e8f2a-918e-4594-95fb-c74c6ca5bdbf',
        contractAmount: 84300000,
        startDate: new Date('2025-01-10T00:00:00.000Z'),
        endDate: new Date('2025-06-18T00:00:00.000Z'),
        progress: 62,
        status: 'active',
    })),
}));

vi.mock('@/lib/data/estimates/repo', () => ({
    getEstimatesByProjectId: vi.fn(async () => [
        { id: 'est-uuid', name: 'Смета 1', slug: 'smeta-1' }
    ]),
}));

vi.mock('@/lib/services/project-performance-dynamics.service', () => ({
    ProjectPerformanceDynamicsService: {
        list: vi.fn(async () => [{
            date: '2025-03-01',
            receiptsFact: 50,
            executionPlan: 100,
            executionFact: 70,
            procurementPlan: 30,
            procurementFact: 20,
        }]),
    },
}));

vi.mock('@/lib/services/project-dashboard-kpi.service', () => ({
    ProjectDashboardKpiService: {
        getByProjectId: vi.fn(async () => ({
            confirmedReceipts: 130000,
            plannedWorks: 100000,
            plannedMaterials: 50000,
            actualWorks: 80000,
            actualMaterials: 30000,
        })),
    },
    buildProjectDashboardKpiViewModel: vi.fn(() => ({
        revenue: 130000,
        profit: 20000,
        progress: 62,
        remainingDays: 12,
    })),
}));

vi.mock('@/lib/services/project-receipts.service', () => ({
    ProjectReceiptsService: {
        listByProject: vi.fn(async () => ({
            success: true,
            data: [],
        })),
        getAggregatesByProject: vi.fn(async () => ({
            success: true,
            data: {
                totalConfirmedReceipts: 0,
                confirmedCount: 0,
                lastConfirmedReceiptDate: null,
                lastConfirmedReceiptAmount: null,
                hasCorrections: false,
            },
        })),
    },
}));

test('project dashboard page maps project data and renders feature screen', async () => {
    const PageComponent = await Page({
        params: Promise.resolve({ projectId: 'north-park' }),
    });

    render(PageComponent as React.ReactElement);

    expect(screen.getByTestId('project-dashboard')).toHaveTextContent('ЖК «Северный парк»');
    expect(projectDashboardSpy).toHaveBeenCalledTimes(1);
    expect(projectDashboardSpy.mock.calls[0]?.[0]?.project).toMatchObject({
        id: 'uuid-1',
        slug: 'north-park',
        name: 'ЖК «Северный парк»',
        customerName: 'ООО СеверСтрой',
        progress: 62,
        status: 'active',
    });
    expect(projectDashboardSpy.mock.calls[0]?.[0]?.estimates).toEqual([
        { id: 'est-uuid', name: 'Смета 1', slug: 'smeta-1' }
    ]);
    expect(projectDashboardSpy.mock.calls[0]?.[0]?.performanceDynamics).toEqual([
        {
            date: '2025-03-01',
            receiptsFact: 50,
            executionPlan: 100,
            executionFact: 70,
            procurementPlan: 30,
            procurementFact: 20,
        },
    ]);
    expect(projectDashboardSpy.mock.calls[0]?.[0]?.kpi).toEqual({
        revenue: 130000,
        profit: 20000,
        progress: 62,
        remainingDays: 12,
    });
});

test('project dashboard launches independent queries in parallel after project lookup', async () => {
    type Deferred<T> = {
        promise: Promise<T>;
        resolve: (value: T) => void;
    };

    const createDeferred = <T,>(): Deferred<T> => {
        let resolve!: (value: T) => void;
        const promise = new Promise<T>((res) => {
            resolve = res;
        });

        return { promise, resolve };
    };

    const estimatesDeferred = createDeferred<Array<{ id: string; name: string; slug: string }>>();
    const dynamicsDeferred = createDeferred<Array<{
        date: string;
        receiptsFact: number;
        executionPlan: number;
        executionFact: number;
        procurementPlan: number;
        procurementFact: number;
    }>>();
    const kpiDeferred = createDeferred<{
        confirmedReceipts: number;
        plannedWorks: number;
        plannedMaterials: number;
        actualWorks: number;
        actualMaterials: number;
    }>();

    vi.mocked(getEstimatesByProjectId).mockImplementation(() => estimatesDeferred.promise);
    vi.mocked(ProjectPerformanceDynamicsService.list).mockImplementation(() => dynamicsDeferred.promise);
    vi.mocked(ProjectDashboardKpiService.getByProjectId).mockImplementation(() => kpiDeferred.promise);

    const pagePromise = Page({
        params: Promise.resolve({ projectId: 'north-park' }),
    });

    await Promise.resolve();

    expect(getEstimatesByProjectId).toHaveBeenCalledTimes(1);
    expect(ProjectPerformanceDynamicsService.list).toHaveBeenCalledTimes(1);
    expect(ProjectDashboardKpiService.getByProjectId).toHaveBeenCalledTimes(1);

    estimatesDeferred.resolve([{ id: 'est-uuid', name: 'Смета 1', slug: 'smeta-1' }]);
    dynamicsDeferred.resolve([
        {
            date: '2025-03-01',
            receiptsFact: 50,
            executionPlan: 100,
            executionFact: 70,
            procurementPlan: 30,
            procurementFact: 20,
        },
    ]);
    kpiDeferred.resolve({
        confirmedReceipts: 130000,
        plannedWorks: 100000,
        plannedMaterials: 50000,
        actualWorks: 80000,
        actualMaterials: 30000,
    });

    await expect(pagePromise).resolves.toBeTruthy();
});
    vi.mocked(ProjectReceiptsService.listByProject).mockImplementation(async () => ({ success: true, data: [] }));
    vi.mocked(ProjectReceiptsService.getAggregatesByProject).mockImplementation(async () => ({
        success: true,
        data: {
            totalConfirmedReceipts: 0,
            confirmedCount: 0,
            lastConfirmedReceiptDate: null,
            lastConfirmedReceiptAmount: null,
            hasCorrections: false,
        },
    }));
