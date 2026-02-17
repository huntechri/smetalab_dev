'use server';

import { safeAction } from '@/lib/actions/safe-action';
import { EstimateProcurementService } from '@/lib/services/estimate-procurement.service';

export const getEstimateProcurementAction = safeAction(
    async ({ team }, estimateId: string) => EstimateProcurementService.list(team.id, estimateId),
    { name: 'getEstimateProcurementAction' },
);
