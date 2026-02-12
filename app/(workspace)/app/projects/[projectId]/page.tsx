import { ProjectDashboard } from '@/features/projects';
import { getProjectById } from '@/lib/data/projects/repo';
import { getTeamForUser, getCounterparties } from '@/lib/data/db/queries';
import { redirect, notFound } from 'next/navigation';
import { ProjectListItem, ProjectStatus } from '@/features/projects';

type PageProps = {
    params: Promise<{ projectId: string }>;
};

export default async function Page({ params }: PageProps) {
    const { projectId } = await params;
    const team = await getTeamForUser();

    if (!team) {
        redirect('/login');
    }

    const projectData = await getProjectById(projectId, team.id);

    if (!projectData) {
        notFound();
    }

    // Fetch counterparty name if we have an ID but no name in the join result yet (though getProjectById usually joins it, 
    // let's double check repo.ts. The repo does a select *, but might not be joining counterparty name effectively in getProjectById 
    // strictly looking at step 48 it does simple select * from projects. Let's fix that mapping manually or trust the repo if updated later. 
    // Actually repo getProjectById (step 48) does NOT join counterparties. It just selects from projects.
    // So we just map what we have.

    // We need to fetch counterparty name if it exists? 
    // Actually repo.ts getProjectById does NOT return counterpartyName field in the current implementation shown in Step 48.
    // It returns `projects` schema type. 
    // Let's quickly check if we can fetch it or just display what we have.
    // For now, let's just map the basic fields.

    const project: ProjectListItem = {
        id: projectData.id,
        name: projectData.name,
        customerName: projectData.customerName || '', // We might need to fetch this if it's a relation, but for now fallback to manual name
        counterpartyId: projectData.counterpartyId || undefined,
        contractAmount: projectData.contractAmount,
        startDate: projectData.startDate?.toISOString() || '',
        endDate: projectData.endDate?.toISOString() || '',
        progress: projectData.progress,
        status: projectData.status as ProjectStatus,
    };

    return (
        <ProjectDashboard project={project} />
    );
}
