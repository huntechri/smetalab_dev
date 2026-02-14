import { EstimateDetailsShell } from '@/features/projects';
import { getEstimateBySlug } from '@/lib/data/estimates/repo';
import { getProjectBySlug } from '@/lib/data/projects/repo';
import { getTeamForUser } from '@/lib/data/db/queries';
import { notFound, redirect } from 'next/navigation';
import { EstimateRow } from '@/features/projects/estimates/types/dto';

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

    // TODO: Replace with real DB query when estimate_rows table is created
    const rowsPromise: Promise<EstimateRow[]> = Promise.resolve([]);

    return (
        <div className="mx-auto w-full max-w-[1600px] space-y-6 py-4">
            <EstimateDetailsShell estimateId={estimate.id} rowsPromise={rowsPromise} />
        </div>
    );
}
