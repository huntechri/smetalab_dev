import {
    addEstimateMaterialAction,
    addEstimateSectionAction,
    addEstimateWorkAction,
    getEstimateRowsAction,
    patchEstimateRowAction,
    removeEstimateRowAction,
} from '@/app/actions/estimates/rows';
import { resetEstimateCoefficientAction, updateEstimateCoefficientAction } from '@/app/actions/estimates/coefficient';
import { updateEstimateStatusAction } from '@/app/actions/estimates/status';
import { deleteEstimateAction } from '@/app/actions/estimates/delete';
import { EstimateRow, RowPatch } from '../types/dto';

export const estimatesActionRepo = {
    async list(estimateId: string): Promise<EstimateRow[]> {
        const result = await getEstimateRowsAction(estimateId);
        if (!result.success) {
            throw new Error(result.error.message);
        }

        return result.data;
    },

    async patchRow(estimateId: string, rowId: string, patch: RowPatch): Promise<EstimateRow> {
        const result = await patchEstimateRowAction(estimateId, rowId, patch);
        if (!result.success) {
            throw new Error(result.error.message);
        }
        return result.data;
    },

    async addSection(estimateId: string, payload: { code: string; name: string; insertAfterRowId?: string; insertBeforeRowId?: string }): Promise<EstimateRow> {
        const result = await addEstimateSectionAction(estimateId, {
            code: payload.code,
            name: payload.name,
            insertAfterRowId: payload.insertAfterRowId,
            insertBeforeRowId: payload.insertBeforeRowId,
        });

        if (!result.success) {
            throw new Error(result.error.message);
        }

        return result.data;
    },

    async addWork(estimateId: string, payload?: Partial<Pick<EstimateRow, 'name' | 'unit' | 'qty' | 'price' | 'expense'>> & { insertAfterWorkId?: string }): Promise<EstimateRow> {
        const result = await addEstimateWorkAction(estimateId, {
            name: payload?.name ?? 'Новая работа',
            unit: payload?.unit,
            qty: payload?.qty,
            price: payload?.price,
            expense: payload?.expense,
            insertAfterWorkId: payload?.insertAfterWorkId,
        });

        if (!result.success) {
            throw new Error(result.error.message);
        }

        return result.data;
    },

    async addMaterial(estimateId: string, parentWorkId: string, payload?: Partial<Pick<EstimateRow, 'name' | 'materialId' | 'unit' | 'imageUrl' | 'qty' | 'price' | 'expense'>>): Promise<EstimateRow> {
        const result = await addEstimateMaterialAction(estimateId, parentWorkId, payload);

        if (!result.success) {
            throw new Error(result.error.message);
        }

        return result.data;
    },

    async removeRow(estimateId: string, rowId: string): Promise<{ removedIds: string[] }> {
        const result = await removeEstimateRowAction(estimateId, rowId);

        if (!result.success) {
            throw new Error(result.error.message);
        }

        return result.data;
    },


    async updateStatus(estimateId: string, status: 'draft' | 'in_progress' | 'approved'): Promise<{ status: 'draft' | 'in_progress' | 'approved'; projectId: string }> {
        const result = await updateEstimateStatusAction(estimateId, { status });
        if (!result.success) {
            throw new Error(result.error.message);
        }

        return result.data;
    },

    async updateCoefficient(estimateId: string, coefPercent: number): Promise<{ coefPercent: number }> {
        const result = await updateEstimateCoefficientAction(estimateId, { coefPercent });
        if (!result.success) {
            throw new Error(result.error.message);
        }

        return result.data;
    },

    async resetCoefficient(estimateId: string): Promise<{ coefPercent: number }> {
        const result = await resetEstimateCoefficientAction(estimateId);
        if (!result.success) {
            throw new Error(result.error.message);
        }

        return result.data;
    },

    async delete(estimateId: string): Promise<{ projectId: string }> {
        const result = await deleteEstimateAction(estimateId);
        if (!result.success) {
            throw new Error(result.error.message);
        }
        return result.data;
    },
};
