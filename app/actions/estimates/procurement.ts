'use server';

import { z } from 'zod';
import { safeAction } from '@/lib/actions/safe-action';
import { EstimateProcurementService } from '@/lib/services/estimate-procurement.service';

const estimateIdSchema = z.string().uuid();

export const getEstimateProcurementAction = safeAction(
    async ({ team }, estimateIdRaw: string) => {
        const estimateId = estimateIdSchema.parse(estimateIdRaw);
        return EstimateProcurementService.list(team.id, estimateId);
    },
    { name: 'getEstimateProcurementAction' },
);
