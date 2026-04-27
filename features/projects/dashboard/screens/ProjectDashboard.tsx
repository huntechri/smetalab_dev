'use client';

import { Suspense, use } from 'react';
import { ProjectListItem } from '../../shared/types';
import { DashboardKpiCards } from '../components/DashboardKpiCards';
import { DashboardChart } from '../components/DashboardChart';
import { ProjectEstimatesTable } from '../components/ProjectEstimatesTable';
import { useBreadcrumbs } from '@/components/providers/breadcrumb-provider';
import { useVisibleRouteRefresh } from '@/shared/hooks/use-visible-route-refresh';
import type { PerformanceDynamicsPoint } from '@/shared/types/performance-dynamics';
import { canShowDynamicsChartByEstimateStatuses } from '../lib/performance-dynamics';
import { Skeleton } from '@/shared/ui/skeleton';

type EstimateListItem = {
    id: string;
    projectId: string;
    name: string;
    slug: string;
    status: string;
    total: number;
    createdAt: Date;
    updatedAt: Date;
};

type ProjectDashboardKpi = {
    revenue: number;
    expense: number;
    profit: number;
    progress: number;
    remainingDays: number | null;
};

type ProjectDashboardProps = {
    project: ProjectListItem;
    estimates: EstimateListItem[];
    performanceDynamicsPromise: Promise<PerformanceDynamicsPoint[]>;
    kpiPromise: Promise<ProjectDashboardKpi>;
};

function DashboardKpiCardsLoader({ kpiPromise }: { kpiPromise: Promise<ProjectDashboardKpi> }) {
    const kpi = use(kpiPromise);
    return <DashboardKpiCards kpi={kpi} />;
}

function DashboardChartLoader({ performanceDynamicsPromise }: { performanceDynamicsPromise: Promise<PerformanceDynamicsPoint[]> }) {
    const performanceDynamics = use(performanceDynamicsPromise);
    return <DashboardChart data={performanceDynamics} />;
}

function DashboardKpiCardsFallback() {
    return (
        <div className="grid gap-2 sm:gap-3 md:gap-4 grid-cols-2 sm:grid-cols-2 xl:grid-cols-4">
            <Skeleton className="h-[72px] sm:h-[85px] md:h-[95px] rounded-[13.6px]" />
            <Skeleton className="h-[72px] sm:h-[85px] md:h-[95px] rounded-[13.6px]" />
            <Skeleton className="h-[72px] sm:h-[85px] md:h-[95px] rounded-[13.6px]" />
            <Skeleton className="h-[72px] sm:h-[85px] md:h-[95px] rounded-[13.6px]" />
        </div>
    );
}

function DashboardChartFallback() {
    return <Skeleton className="h-[390px] w-full rounded-[13.6px]" />;
}

export function ProjectDashboard({ project, estimates, performanceDynamicsPromise, kpiPromise }: ProjectDashboardProps) {
    useBreadcrumbs([
        { label: 'Главная', href: '/app' },
        { label: 'Проекты', href: '/app/projects' },
        { label: project.name },
    ]);
    useVisibleRouteRefresh();

    const canShowDynamicsChart = canShowDynamicsChartByEstimateStatuses(
        estimates.map((estimate) => estimate.status),
    );

    return (
        <div className="flex flex-col gap-4 lg:gap-6 pt-1 pb-4 lg:pt-2 lg:pb-6">
            <div className="px-1 md:px-0">
                <h1 className="sr-only">{project.name}</h1>
            </div>

            <div className="space-y-4 lg:space-y-10">
                <div className="@container/main space-y-4 lg:space-y-10">
                    <Suspense fallback={<DashboardKpiCardsFallback />}>
                        <DashboardKpiCardsLoader kpiPromise={kpiPromise} />
                    </Suspense>

                    <div
                        className={canShowDynamicsChart
                            ? 'grid grid-cols-1 gap-4 xl:grid-cols-2 xl:items-start'
                            : 'grid grid-cols-1'}
                    >
                        {canShowDynamicsChart ? (
                            <div className="min-w-0 overflow-hidden">
                                <Suspense fallback={<DashboardChartFallback />}>
                                    <DashboardChartLoader performanceDynamicsPromise={performanceDynamicsPromise} />
                                </Suspense>
                            </div>
                        ) : null}

                        <div className="min-w-0 overflow-hidden">
                            <ProjectEstimatesTable
                                projectId={project.id}
                                projectSlug={project.slug}
                                initialEstimates={estimates}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
