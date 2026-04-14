'use server';

import { revalidatePath } from 'next/cache';
import { safeAction } from '@/lib/actions/safe-action';
import { EstimateStatusService } from '@/lib/services/estimate-status.service';

export const updateEstimateStatusAction = safeAction(
  async ({ team }, estimateId: string, payload: { status: 'draft' | 'in_progress' | 'approved' }) => {
    const result = await EstimateStatusService.update(team.id, estimateId, payload);
    if (result.success) {
      // Revalidate both dashboards as project status might have changed
      revalidatePath('/app');
      revalidatePath('/app/projects');
    }
    return result;
  },
  { name: 'updateEstimateStatusAction' },
);
