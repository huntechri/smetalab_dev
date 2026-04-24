import { EstimateDetailsShell } from '@/features/projects';
import { getEstimateBySlug } from '@/lib/data/estimates/repo';
import { getProjectBySlug } from '@/lib/data/projects/repo';
import { getTeamForUser } from '@/lib/data/db/queries';
import { notFound, redirect } from 'next/navigation';
import type { EstimateRow } from '@/features/projects';
import { EstimateRowsService } from '@/lib/services/estimate-rows.service';
import { EstimateRoomParamsService } from '@/lib/services/estimate-room-params.service';
import { EstimateExecutionService } from '@/lib/services/estimate-execution.service';
import { EstimateProcurementService } from '@/lib/services/estimate-procurement.service';
import type { EstimateRoomParam } from '@/features/projects';
import type { EstimateExecutionRow } from '@/features/projects/estimates/types/execution.dto';
import type { EstimateProcurementRow } from '@/shared/types/estimate-procurement';

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
    const roomParamsPromise: Promise<EstimateRoomParam[]> = EstimateRoomParamsService.list(team.id, estimate.id).then((result) => result.success ? result.data : []);
    const executionRowsPromise: Promise<EstimateExecutionRow[]> = EstimateExecutionService.list(team.id, estimate.id).then((result) => result.success ? result.data : []);
    const procurementRowsPromise: Promise<EstimateProcurementRow[]> = EstimateProcurementService.list(team.id, estimate.id).then((result) => result.success ? result.data : []);

    return (
        <div className="mx-auto w-full max-w-[1600px] space-y-4 pt-1 pb-0 -mb-4 md:-mb-6 lg:-mb-8">
            <EstimateDetailsShell
                estimateId={estimate.id}
                rowsPromise={rowsPromise}
                roomParamsPromise={roomParamsPromise}
                executionRowsPromise={executionRowsPromise}
                procurementRowsPromise={procurementRowsPromise}
                project={{ id: project.id, name: project.name, slug: project.slug }}
                estimate={{ name: estimate.name, slug: estimate.slug }}
                initialCoefPercent={estimate.coefPercent ?? 0}
            />
        </div>
    );
}
