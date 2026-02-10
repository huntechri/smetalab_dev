'use server';

import { revalidatePath } from 'next/cache';
import { NewMaterial } from '@/lib/data/db/schema';
import {
    createMaterialUseCase,
    deleteAllMaterialsUseCase,
    deleteMaterialUseCase,
    updateMaterialUseCase,
} from '@/lib/domain/materials/use-cases';
import { safeAction } from '@/lib/actions/safe-action';

export const deleteMaterial = safeAction(
    async ({ team }, id: string) => {
        const result = await deleteMaterialUseCase(team.id, id);
        if (result.success) {
            revalidatePath('/app/guide/materials');
        }
        return result;
    },
    { name: 'deleteMaterial' }
);

export const deleteAllMaterials = safeAction(
    async ({ team }) => {
        const result = await deleteAllMaterialsUseCase(team.id);
        if (result.success) {
            revalidatePath('/app/guide/materials');
        }
        return result;
    },
    { name: 'deleteAllMaterials' }
);

export const updateMaterial = safeAction(
    async ({ team }, id: string, data: Partial<NewMaterial>) => {
        const result = await updateMaterialUseCase(team.id, id, data);
        if (result.success) {
            revalidatePath('/app/guide/materials');
        }
        return result;
    },
    { name: 'updateMaterial' }
);

export const createMaterial = safeAction(
    async ({ team }, data: NewMaterial) => {
        const result = await createMaterialUseCase(team.id, data);
        if (result.success) {
            revalidatePath('/app/guide/materials');
        }
        return result;
    },
    { name: 'createMaterial' }
);
