import {
    addEstimateMaterialAction,
    addEstimateWorkAction,
    patchEstimateRowAction,
    removeEstimateRowAction,
} from '@/app/actions/estimates/rows';
import { EstimateRow, RowPatch } from '../types/dto';

export const estimatesActionRepo = {
    async patchRow(estimateId: string, rowId: string, patch: RowPatch): Promise<EstimateRow> {
        const result = await patchEstimateRowAction(estimateId, rowId, patch);
        if (!result.success) {
            throw new Error(result.error.message);
        }
        return result.data;
    },

    async addWork(estimateId: string, payload?: Partial<Pick<EstimateRow, 'name' | 'unit' | 'qty' | 'price' | 'expense'>>): Promise<EstimateRow> {
        const result = await addEstimateWorkAction(estimateId, {
            name: payload?.name ?? 'Новая работа',
            unit: payload?.unit,
            qty: payload?.qty,
            price: payload?.price,
            expense: payload?.expense,
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
};
