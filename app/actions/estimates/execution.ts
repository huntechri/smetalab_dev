'use server';

import { safeAction } from '@/lib/actions/safe-action';
import { EstimateExecutionService } from '@/lib/services/estimate-execution.service';

export const getEstimateExecutionRowsAction = safeAction(
    async ({ team }, estimateId: string) => EstimateExecutionService.list(team.id, estimateId),
    { name: 'getEstimateExecutionRowsAction' },
);

export const patchEstimateExecutionRowAction = safeAction(
    async ({ team, user }, estimateId: string, executionRowId: string, patch: { actualQty?: number; actualPrice?: number; status?: 'not_started' | 'in_progress' | 'done'; isCompleted?: boolean }) =>
        EstimateExecutionService.patch(team.id, estimateId, executionRowId, patch, user.id),
    { name: 'patchEstimateExecutionRowAction' },
);

export const addEstimateExecutionExtraWorkAction = safeAction(
    async ({ team }, estimateId: string, payload: { name: string; code?: string; unit?: string; actualQty?: number; actualPrice?: number }) =>
        EstimateExecutionService.addExtraWork(team.id, estimateId, payload),
    { name: 'addEstimateExecutionExtraWorkAction' },
);
