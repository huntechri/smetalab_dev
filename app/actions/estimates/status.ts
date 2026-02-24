'use server';

import { safeAction } from '@/lib/actions/safe-action';
import { EstimateStatusService } from '@/lib/services/estimate-status.service';

export const updateEstimateStatusAction = safeAction(
  async ({ team }, estimateId: string, payload: { status: 'draft' | 'in_progress' | 'approved' }) =>
    EstimateStatusService.update(team.id, estimateId, payload),
  { name: 'updateEstimateStatusAction' },
);
