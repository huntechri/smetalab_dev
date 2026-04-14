'use server';

import { safeAction } from '@/lib/actions/safe-action';
import { EstimateCoefficientService } from '@/lib/services/estimate-coefficient.service';

export const updateEstimateCoefficientAction = safeAction(
    async ({ team }, estimateId: string, payload: { coefPercent: number }) =>
        EstimateCoefficientService.update(team.id, estimateId, payload),
    { name: 'updateEstimateCoefficientAction' },
);

export const resetEstimateCoefficientAction = safeAction(
    async ({ team }, estimateId: string) =>
        EstimateCoefficientService.reset(team.id, estimateId),
    { name: 'resetEstimateCoefficientAction' },
);
