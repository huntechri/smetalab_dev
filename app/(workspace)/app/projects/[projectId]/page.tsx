import { ProjectDashboard } from '@/features/projects';
import { getProjectBySlug } from '@/lib/data/projects/repo';
import { getEstimatesByProjectId } from '@/lib/data/estimates/repo';
import { getTeamForUser } from '@/lib/data/db/queries';
import { redirect, notFound } from 'next/navigation';
import { ProjectListItem, ProjectStatus } from '@/features/projects';

type PageProps = {
    params: Promise<{ projectId: string }>;
};

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

    const estimates = await getEstimatesByProjectId(projectData.id, team.id);

    const project: ProjectListItem = {
        id: projectData.id,
        name: projectData.name,
        slug: projectData.slug,
        customerName: projectData.customerName || '',
        counterpartyId: projectData.counterpartyId || undefined,
        contractAmount: projectData.contractAmount,
        startDate: projectData.startDate?.toISOString() || '',
        endDate: projectData.endDate?.toISOString() || '',
        progress: projectData.progress,
        status: projectData.status as ProjectStatus,
    };

    return <ProjectDashboard project={project} estimates={estimates} />;
}
