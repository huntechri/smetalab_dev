import { EstimatesRegistryScreen } from '@/features/projects';
import { PageShell } from '@/shared/ui/page-shell';
import { getEstimatesByProjectId } from '@/lib/data/estimates/repo';
import { getProjectBySlug } from '@/lib/data/projects/repo';
import { getTeamForUser } from '@/lib/data/db/queries';
import { redirect, notFound } from 'next/navigation';

type PageProps = {
    params: Promise<{ projectId: string }>;
};

export default async function Page({ params }: PageProps) {
    const { projectId: projectSlug } = await params;
    const team = await getTeamForUser();

    if (!team) {
        redirect('/login');
    }

    const project = await getProjectBySlug(projectSlug, team.id);
    if (!project) {
        notFound();
    }

    const estimates = await getEstimatesByProjectId(project.id, team.id);

    const mappedEstimates = estimates.map((item) => ({
        id: item.id,
        projectId: item.projectId,
        name: item.name,
        slug: item.slug,
        status: item.status as 'draft' | 'in_progress' | 'approved',
        total: item.total,
        createdAt: item.createdAt.toISOString(),
        updatedAt: item.updatedAt.toISOString(),
    }));

    return (
        <PageShell title="Реестр смет" visuallyHiddenTitle>
            <EstimatesRegistryScreen
                estimates={mappedEstimates}
                projectSlug={projectSlug}
            />
        </PageShell>
    );
}
