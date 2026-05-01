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
import {
    DashboardChartSkeleton,
    DashboardMainContainer,
    DashboardPageStack,
    DashboardPanel,
    DashboardResponsiveColumns,
    DashboardSectionStack,
    DashboardSingleColumn,
} from '@/shared/ui/dashboard-layout';
import { KPICardGridSkeleton } from '@/shared/ui/kpi-card';

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
    const Layout = canShowDynamicsChart ? DashboardResponsiveColumns : DashboardSingleColumn;

    return (
        <DashboardPageStack>
            <h1 className="sr-only">{project.name}</h1>

            <DashboardSectionStack>
                <DashboardMainContainer>
                    <Suspense fallback={<KPICardGridSkeleton />}>
                        <DashboardKpiCardsLoader kpiPromise={kpiPromise} />
                    </Suspense>

                    <Layout>
                        {canShowDynamicsChart ? (
                            <DashboardPanel>
                                <Suspense fallback={<DashboardChartSkeleton />}>
                                    <DashboardChartLoader performanceDynamicsPromise={performanceDynamicsPromise} />
                                </Suspense>
                            </DashboardPanel>
                        ) : null}

                        <DashboardPanel>
                            <ProjectEstimatesTable
                                projectId={project.id}
                                projectSlug={project.slug}
                                initialEstimates={estimates}
                            />
                        </DashboardPanel>
                    </Layout>
                </DashboardMainContainer>
            </DashboardSectionStack>
        </DashboardPageStack>
    );
}
