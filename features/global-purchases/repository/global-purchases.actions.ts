import {
    addGlobalPurchaseAction,
    getGlobalPurchasesAction,
    patchGlobalPurchaseAction,
    patchGlobalPurchasesBatchAction,
    removeGlobalPurchaseAction,
    copyGlobalPurchasesToNextDayAction,
    importGlobalPurchasesAction,
} from '@/app/actions/global-purchases';
import type { CatalogMaterial } from '@/features/catalog/types/dto';
import type { PurchaseRow, PurchaseRowPatch, PurchaseRowsRange, PurchaseRowBatchPatchPayload } from '../types/dto';
import type { ImportablePurchaseRow } from '../lib/import-export';

const toPayloadFromCatalog = (material: CatalogMaterial, projectId: string | null, purchaseDate: string) => {
    const safePrice = Number(material.price);

    return {
        projectId,
        materialName: material.name,
        materialId: material.id,
        unit: material.unit || 'шт',
        qty: 1,
        price: Number.isFinite(safePrice) ? safePrice : 0,
        note: '',
        source: 'catalog' as const,
        purchaseDate,
    };
};

export const globalPurchasesActionRepo = {
    async list(range: PurchaseRowsRange): Promise<PurchaseRow[]> {
        const result = await getGlobalPurchasesAction(range);
        if (!result.success) {
            throw new Error(result.error.message);
        }

        return result.data;
    },

    async addManual(projectId: string | null, purchaseDate: string): Promise<PurchaseRow> {
        const result = await addGlobalPurchaseAction({
            projectId,
            materialName: '',
            materialId: null,
            unit: 'шт',
            qty: 1,
            price: 0,
            note: '',
            source: 'manual',
            purchaseDate,
        });

        if (!result.success) {
            throw new Error(result.error.message);
        }

        return result.data;
    },

    async addFromCatalog(material: CatalogMaterial, projectId: string | null, purchaseDate: string): Promise<PurchaseRow> {
        const result = await addGlobalPurchaseAction(toPayloadFromCatalog(material, projectId, purchaseDate));

        if (!result.success) {
            throw new Error(result.error.message);
        }

        return result.data;
    },

    async patch(rowId: string, patch: PurchaseRowPatch): Promise<PurchaseRow> {
        const result = await patchGlobalPurchaseAction(rowId, patch);

        if (!result.success) {
            throw new Error(result.error.message);
        }

        return result.data;
    },


    async patchBatch(payload: PurchaseRowBatchPatchPayload): Promise<PurchaseRow[]> {
        const result = await patchGlobalPurchasesBatchAction(payload);

        if (!result.success) {
            throw new Error(result.error.message);
        }

        return result.data;
    },

    async remove(rowId: string): Promise<{ removedId: string }> {
        const result = await removeGlobalPurchaseAction(rowId);

        if (!result.success) {
            throw new Error(result.error.message);
        }

        return result.data;
    },


    async importRows(rows: ImportablePurchaseRow[]): Promise<PurchaseRow[]> {
        const result = await importGlobalPurchasesAction({ rows });

        if (!result.success) {
            throw new Error(result.error.message);
        }

        return result.data;
    },

    async copyToNextDay(sourceDate: string): Promise<PurchaseRow[]> {
        const result = await copyGlobalPurchasesToNextDayAction(sourceDate);

        if (!result.success) {
            throw new Error(result.error.message);
        }

        return result.data;
    },
};
