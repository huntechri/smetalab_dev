'use server';

import { revalidatePath } from 'next/cache';
import { NewMaterial } from '@/lib/data/db/schema';
import { safeAction } from '@/lib/actions/safe-action';
import { MaterialsCatalogService } from '@/lib/services/materials-catalog.service';

export const deleteMaterial = safeAction(
    async ({ team }, id: string) => {
        const result = await MaterialsCatalogService.delete(team.id, id);
        if (result.success) {
            revalidatePath('/app/guide/materials');
        }
        return result;
    },
    { name: 'deleteMaterial' }
);

export const deleteAllMaterials = safeAction(
    async ({ team }) => {
        const result = await MaterialsCatalogService.deleteAll(team.id);
        if (result.success) {
            revalidatePath('/app/guide/materials');
        }
        return result;
    },
    { name: 'deleteAllMaterials' }
);

export const updateMaterial = safeAction(
    async ({ team }, id: string, data: Partial<NewMaterial>) => {
        const result = await MaterialsCatalogService.update(team.id, id, data);
        if (result.success) {
            revalidatePath('/app/guide/materials');
        }
        return result;
    },
    { name: 'updateMaterial' }
);

export const createMaterial = safeAction(
    async ({ team }, data: NewMaterial) => {
        const result = await MaterialsCatalogService.create(team.id, data);
        if (result.success) {
            revalidatePath('/app/guide/materials');
        }
        return result;
    },
    { name: 'createMaterial' }
);
