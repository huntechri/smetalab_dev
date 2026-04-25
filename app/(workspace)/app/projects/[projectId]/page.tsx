import { ProjectDashboard } from '@/features/projects';
import { getProjectBySlug } from '@/lib/data/projects/repo';
import { getEstimatesByProjectId } from '@/lib/data/estimates/repo';
import { getTeamForUser } from '@/lib/data/db/queries';
import { ProjectPerformanceDynamicsService } from '@/lib/services/project-performance-dynamics.service';
import { ProjectDashboardKpiService, buildProjectDashboardKpiViewModel } from '@/lib/services/project-dashboard-kpi.service';
import { redirect, notFound } from 'next/navigation';
import type { ProjectListItem, ProjectStatus } from '@/features/projects';

type PageProps = {
    params: Promise<{ projectId: string }>;
};

const estimateStatusesWithDynamics = new Set(['in_progress', 'approved']);

export default async function Page({ params }: PageProps) {
    const { projectId: projectSlug } = await params;
    const team = await getTeamForUser();

    if (!team) {
        redirect('/login');
    }

    const projectData = await getProjectBySlug(projectSlug, team.id);

    if (!projectData) {
        notFound();
    }

    const estimatesPromise = getEstimatesByProjectId(projectData.id, team.id);
    const kpiPromise = ProjectDashboardKpiService.getByProjectId(team.id, projectData.id)
        .then((kpiData) => buildProjectDashboardKpiViewModel({
            finance: kpiData,
            progress: projectData.progress,
            endDate: projectData.endDate,
        }));

    const estimates = await estimatesPromise;
    const shouldLoadPerformanceDynamics = estimates.some((estimate) => estimateStatusesWithDynamics.has(estimate.status));
    const performanceDynamicsPromise = shouldLoadPerformanceDynamics
        ? ProjectPerformanceDynamicsService.list(team.id, projectData.id)
        : Promise.resolve([]);

    const project: ProjectListItem = {
        id: projectData.id,
        name: projectData.name,
        slug: projectData.slug,
        customerName: projectData.customerName || '',
        counterpartyId: projectData.counterpartyId || undefined,
        objectAddress: projectData.objectAddress || '',
        contractAmount: projectData.contractAmount,
        startDate: projectData.startDate?.toISOString() || '',
        endDate: projectData.endDate?.toISOString() || '',
        progress: projectData.progress,
        status: projectData.status as ProjectStatus,
    };

    return (
        <ProjectDashboard
            project={project}
            estimates={estimates}
            performanceDynamicsPromise={performanceDynamicsPromise}
            kpiPromise={kpiPromise}
        />
    );
}
