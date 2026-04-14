'use server';

import { revalidatePath } from 'next/cache';
import { EstimateService } from '@/lib/services/estimates.service';
import { safeAction } from '@/lib/actions/safe-action';

export const deleteEstimateAction = safeAction(
    async ({ team }, estimateId: string) => {
        const result = await EstimateService.delete(team.id, estimateId);

        if (result.success) {
            const { projectId } = result.data;
            revalidatePath(`/app/projects/${projectId}/estimates`, 'page');
            revalidatePath(`/app/projects/${projectId}`, 'page');
        }

        return result;
    },
    { name: 'deleteEstimateAction' }
);
