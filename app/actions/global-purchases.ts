'use server';

import { safeAction } from '@/lib/actions/safe-action';
import { GlobalPurchasesService } from '@/lib/services/global-purchases.service';

export const getGlobalPurchasesAction = safeAction(
    async ({ team }) => GlobalPurchasesService.list(team.id),
    { name: 'getGlobalPurchasesAction' }
);

export const addGlobalPurchaseAction = safeAction(
    async ({ team }, payload: {
        projectName?: string;
        materialName?: string;
        unit?: string;
        qty?: number;
        price?: number;
        note?: string;
        source?: 'manual' | 'catalog';
    }) => GlobalPurchasesService.create(team.id, payload),
    { name: 'addGlobalPurchaseAction' }
);

export const patchGlobalPurchaseAction = safeAction(
    async ({ team }, rowId: string, patch: {
        projectName?: string;
        materialName?: string;
        unit?: string;
        qty?: number;
        price?: number;
        note?: string;
    }) => GlobalPurchasesService.patch(team.id, rowId, patch),
    { name: 'patchGlobalPurchaseAction' }
);

export const removeGlobalPurchaseAction = safeAction(
    async ({ team }, rowId: string) => GlobalPurchasesService.remove(team.id, rowId),
    { name: 'removeGlobalPurchaseAction' }
);
