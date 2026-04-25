import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, expect, test, vi } from 'vitest';

import Page from '@/app/(workspace)/app/projects/[projectId]/page';
import { getEstimatesByProjectId } from '@/lib/data/estimates/repo';
import { ProjectDashboardKpiService } from '@/lib/services/project-dashboard-kpi.service';
import { ProjectPerformanceDynamicsService } from '@/lib/services/project-performance-dynamics.service';

const projectDashboardSpy = vi.fn(({
    project,
}: {
    project: { name: string };
    estimates: Array<{ id: string }>;
    performanceDynamicsPromise: Promise<unknown>;
    kpiPromise: Promise<unknown>;
}) => (
    <div data-testid="project-dashboard">{project.name}</div>
));

vi.mock('@/features/projects/dashboard/screens/ProjectDashboard', () => ({
    ProjectDashboard: (props: {
        project: { name: string };
        estimates: Array<{ id: string }>;
        performanceDynamicsPromise: Promise<unknown>;
        kpiPromise: Promise<unknown>;
    }) => projectDashboardSpy(props),
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
        { id: 'est-uuid', name: 'Смета 1', slug: 'smeta-1', status: 'in_progress' }
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
        expense: 110000,
        profit: 20000,
        progress: 62,
        remainingDays: 12,
    })),
}));

beforeEach(() => {
    vi.clearAllMocks();
});

test('project dashboard page maps project data and renders feature screen', async () => {
    const PageComponent = await Page({
        params: Promise.resolve({ projectId: 'north-park' }),
    });

    render(PageComponent as React.ReactElement);

    const props = projectDashboardSpy.mock.calls[0]?.[0];

    expect(screen.getByTestId('project-dashboard')).toHaveTextContent('ЖК «Северный парк»');
    expect(projectDashboardSpy).toHaveBeenCalledTimes(1);
    expect(props?.project).toMatchObject({
        id: 'uuid-1',
        slug: 'north-park',
        name: 'ЖК «Северный парк»',
        customerName: 'ООО СеверСтрой',
        progress: 62,
        status: 'active',
    });
    expect(props?.estimates).toEqual([
        { id: 'est-uuid', name: 'Смета 1', slug: 'smeta-1', status: 'in_progress' }
    ]);
    await expect(props?.performanceDynamicsPromise).resolves.toEqual([
        {
            date: '2025-03-01',
            receiptsFact: 50,
            executionPlan: 100,
            executionFact: 70,
            procurementPlan: 30,
            procurementFact: 20,
        },
    ]);
    await expect(props?.kpiPromise).resolves.toEqual({
        revenue: 130000,
        expense: 110000,
        profit: 20000,
        progress: 62,
        remainingDays: 12,
    });
});

test('project dashboard starts KPI query before streaming heavy dynamics after estimates resolve', async () => {
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

    const estimatesDeferred = createDeferred<Array<{ id: string; name: string; slug: string; status: string }>>();
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

    await waitFor(() => {
        expect(getEstimatesByProjectId).toHaveBeenCalledTimes(1);
    });

    expect(ProjectDashboardKpiService.getByProjectId).toHaveBeenCalledTimes(1);
    expect(ProjectPerformanceDynamicsService.list).not.toHaveBeenCalled();

    estimatesDeferred.resolve([{ id: 'est-uuid', name: 'Смета 1', slug: 'smeta-1', status: 'in_progress' }]);

    await waitFor(() => {
        expect(ProjectPerformanceDynamicsService.list).toHaveBeenCalledTimes(1);
    });

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
