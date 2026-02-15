import { EstimateDetailsShell } from '@/features/projects';
import { getEstimateBySlug } from '@/lib/data/estimates/repo';
import { getProjectBySlug } from '@/lib/data/projects/repo';
import { getTeamForUser } from '@/lib/data/db/queries';
import { notFound, redirect } from 'next/navigation';
import { EstimateRow, EstimateMeta } from '@/features/projects/estimates/types/dto';
import { EstimateRowsService } from '@/lib/services/estimate-rows.service';

type PageProps = {
    params: Promise<{ projectId: string; estimateId: string }>;
};

export default async function Page({ params }: PageProps) {
    const { projectId: projectSlug, estimateId: estimateSlug } = await params;
    const team = await getTeamForUser();

    if (!team) {
        redirect('/login');
    }

    const project = await getProjectBySlug(projectSlug, team.id);
    if (!project) {
        notFound();
    }

    const estimate = await getEstimateBySlug(estimateSlug, project.id, team.id);
    if (!estimate) {
        notFound();
    }

    const rowsPromise: Promise<EstimateRow[]> = EstimateRowsService.list(team.id, estimate.id).then((result) => result.success ? result.data : []);

    return (
        <div className="mx-auto w-full max-w-[1600px] space-y-4 pt-1 pb-4">
            <EstimateDetailsShell
                estimateId={estimate.id}
                rowsPromise={rowsPromise}
                project={{ name: project.name, slug: project.slug }}
                estimate={{ name: estimate.name, slug: estimate.slug }}
            />
        </div>
    );
}
