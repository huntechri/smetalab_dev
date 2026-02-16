'use server';

import { safeAction } from '@/lib/actions/safe-action';
import { GlobalPurchasesService } from '@/lib/services/global-purchases.service';

export const getGlobalPurchasesAction = safeAction(
    async ({ team }, range: { from: string; to: string }) => GlobalPurchasesService.list(team.id, range),
    { name: 'getGlobalPurchasesAction' }
);

export const addGlobalPurchaseAction = safeAction(
    async ({ team }, payload: {
        projectId?: string | null;
        projectName?: string;
        materialName?: string;
        unit?: string;
        qty?: number;
        price?: number;
        note?: string;
        source?: 'manual' | 'catalog';
        purchaseDate?: string;
    }) => GlobalPurchasesService.create(team.id, payload),
    { name: 'addGlobalPurchaseAction' }
);

export const patchGlobalPurchaseAction = safeAction(
    async ({ team }, rowId: string, patch: {
        projectId?: string | null;
        materialName?: string;
        unit?: string;
        qty?: number;
        price?: number;
        note?: string;
        purchaseDate?: string;
    }) => GlobalPurchasesService.patch(team.id, rowId, patch),
    { name: 'patchGlobalPurchaseAction' }
);

export const copyGlobalPurchasesDayAction = safeAction(
    async ({ team }, payload: { sourceDate: string; targetDate: string }) => GlobalPurchasesService.createNextDayList(team.id, payload),
    { name: 'copyGlobalPurchasesDayAction' }
);

export const removeGlobalPurchaseAction = safeAction(
    async ({ team }, rowId: string) => GlobalPurchasesService.remove(team.id, rowId),
    { name: 'removeGlobalPurchaseAction' }
);
