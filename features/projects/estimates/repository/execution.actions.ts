import {
    addEstimateExecutionExtraWorkAction,
    getEstimateExecutionRowsAction,
    patchEstimateExecutionRowAction,
} from '@/app/actions/estimates/execution';
import { AddExtraExecutionWorkInput, EstimateExecutionRow, EstimateExecutionRowPatch } from '../types/execution.dto';

export const estimateExecutionActionsRepo = {
    async list(estimateId: string): Promise<EstimateExecutionRow[]> {
        const result = await getEstimateExecutionRowsAction(estimateId);
        if (!result.success) {
            throw new Error(result.error.message);
        }

        return result.data;
    },

    async patch(estimateId: string, executionRowId: string, patch: EstimateExecutionRowPatch): Promise<EstimateExecutionRow> {
        const result = await patchEstimateExecutionRowAction(estimateId, executionRowId, patch);
        if (!result.success) {
            throw new Error(result.error.message);
        }

        return result.data;
    },

    async addExtraWork(estimateId: string, payload: AddExtraExecutionWorkInput): Promise<EstimateExecutionRow> {
        const result = await addEstimateExecutionExtraWorkAction(estimateId, payload);
        if (!result.success) {
            throw new Error(result.error.message);
        }

        return result.data;
    },
};
