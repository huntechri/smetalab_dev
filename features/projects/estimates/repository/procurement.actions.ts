import { getEstimateProcurementAction } from '@/app/actions/estimates/procurement';
import type { EstimateProcurementRow } from '@/shared/types/estimate-procurement';

export const estimateProcurementActionsRepo = {
    async list(estimateId: string): Promise<EstimateProcurementRow[]> {
        const result = await getEstimateProcurementAction(estimateId);

        if (!result.success) {
            throw new Error(result.error.message);
        }

        return result.data;
    },
};
