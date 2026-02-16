import {
    addGlobalPurchaseAction,
    patchGlobalPurchaseAction,
    removeGlobalPurchaseAction,
} from '@/app/actions/global-purchases';
import type { CatalogMaterial } from '@/features/catalog/types/dto';
import type { PurchaseRow, PurchaseRowPatch } from '../types/dto';

const toPayloadFromCatalog = (material: CatalogMaterial, projectName: string) => {
    const safePrice = Number(material.price);

    return {
        projectName,
        materialName: material.name,
        unit: material.unit || 'шт',
        qty: 1,
        price: Number.isFinite(safePrice) ? safePrice : 0,
        note: '',
        source: 'catalog' as const,
    };
};

export const globalPurchasesActionRepo = {
    async addManual(projectName: string): Promise<PurchaseRow> {
        const result = await addGlobalPurchaseAction({
            projectName,
            materialName: '',
            unit: 'шт',
            qty: 1,
            price: 0,
            note: '',
            source: 'manual',
        });

        if (!result.success) {
            throw new Error(result.error.message);
        }

        return result.data;
    },

    async addFromCatalog(material: CatalogMaterial, projectName: string): Promise<PurchaseRow> {
        const result = await addGlobalPurchaseAction(toPayloadFromCatalog(material, projectName));

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

    async remove(rowId: string): Promise<{ removedId: string }> {
        const result = await removeGlobalPurchaseAction(rowId);

        if (!result.success) {
            throw new Error(result.error.message);
        }

        return result.data;
    },
};
