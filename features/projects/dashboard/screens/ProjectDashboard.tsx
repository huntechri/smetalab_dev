'use client';

import { ProjectListItem } from '../../shared/types';
import { DashboardKpiCards } from '../components/DashboardKpiCards';
import { DashboardChart } from '../components/DashboardChart';
import { ProjectEstimatesTable } from '../components/ProjectEstimatesTable';
import { useBreadcrumbs } from '@/components/providers/breadcrumb-provider';
import { PerformanceDynamicsPoint } from '@/lib/services/project-performance-dynamics.service';
import { canShowDynamicsChartByEstimateStatuses } from '../lib/performance-dynamics';

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

type ProjectDashboardProps = {
    project: ProjectListItem;
    estimates: EstimateListItem[];
    performanceDynamics: PerformanceDynamicsPoint[];
    kpi: {
        revenue: number;
        profit: number;
        progress: number;
        remainingDays: number | null;
    };
};

export function ProjectDashboard({ project, estimates, performanceDynamics, kpi }: ProjectDashboardProps) {
    useBreadcrumbs([
        { label: 'Главная', href: '/app' },
        { label: 'Проекты', href: '/app/projects' },
        { label: project.name },
    ]);

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
                    <DashboardKpiCards kpi={kpi} />
                    {canShowDynamicsChart ? <DashboardChart data={performanceDynamics} /> : null}
                </div>

                <ProjectEstimatesTable
                    projectId={project.id}
                    projectSlug={project.slug}
                    initialEstimates={estimates}
                />

                <div>
                    <div className="rounded-xl border border-dashed p-8 text-center text-muted-foreground">
                        Additional widgets (Team, Activity) will be implemented here
                    </div>
                </div>
            </div>
        </div>
    );
}
