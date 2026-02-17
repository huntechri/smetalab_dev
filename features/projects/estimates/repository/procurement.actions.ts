import { getEstimateProcurementAction } from '@/app/actions/estimates/procurement';
import { EstimateProcurementRow } from '@/lib/services/estimate-procurement.service';

export const estimateProcurementActionsRepo = {
    async list(estimateId: string): Promise<EstimateProcurementRow[]> {
        const result = await getEstimateProcurementAction(estimateId);

        if (!result.success) {
            throw new Error(result.error.message);
        }

        return result.data;
    },
};
