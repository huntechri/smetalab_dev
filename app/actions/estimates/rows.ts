'use server';

import { safeAction } from '@/lib/actions/safe-action';
import { EstimateRowsService } from '@/lib/services/estimate-rows.service';

export const getEstimateRowsAction = safeAction(
    async ({ team }, estimateId: string) => EstimateRowsService.list(team.id, estimateId),
    { name: 'getEstimateRowsAction' }
);

export const addEstimateWorkAction = safeAction(
    async ({ team }, estimateId: string, payload: { name: string; unit?: string; qty?: number; price?: number; expense?: number }) =>
        EstimateRowsService.addWork(team.id, estimateId, payload),
    { name: 'addEstimateWorkAction' }
);

export const addEstimateMaterialAction = safeAction(
    async ({ team }, estimateId: string, parentWorkId: string, payload?: { name?: string; unit?: string; qty?: number; price?: number; expense?: number }) =>
        EstimateRowsService.addMaterial(team.id, estimateId, parentWorkId, payload),
    { name: 'addEstimateMaterialAction' }
);

export const patchEstimateRowAction = safeAction(
    async ({ team }, estimateId: string, rowId: string, patch: { name?: string; qty?: number; price?: number; expense?: number }) =>
        EstimateRowsService.patch(team.id, estimateId, rowId, patch),
    { name: 'patchEstimateRowAction' }
);
