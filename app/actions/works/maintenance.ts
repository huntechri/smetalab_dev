'use server';

import { revalidatePath } from 'next/cache';
import { safeAction } from '@/lib/actions/safe-action';
import { WorksCatalogService } from '@/lib/services/works-catalog.service';

export const reorderWorks = safeAction(async function reorderWorksHandler({ team }) {
    const result = await WorksCatalogService.reorder(team.id);
    if (result.success) {
        revalidatePath('/app/guide/works');
    }
    return result;
}, { name: 'reorderWorks' });

export const getUniqueUnits = safeAction(async function getUniqueUnitsHandler({ team }) {
    return await WorksCatalogService.getUniqueUnits(team.id);
}, { name: 'getUniqueUnits' });

