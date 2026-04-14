'use server';

import { safeAction } from '@/lib/actions/safe-action';
import { fetchMoreMaterialsInputSchema, FetchMoreMaterialsInput } from '@/lib/domain/materials/materials.contract';
import { MaterialsCatalogService } from '@/lib/services/materials-catalog.service';
import { error } from '@/lib/utils/result';

export const fetchMoreMaterials = safeAction(
    async ({ team }, payload: FetchMoreMaterialsInput = {}) => {
        const parsed = fetchMoreMaterialsInputSchema.safeParse(payload);
        if (!parsed.success) {
            return error('Некорректный курсор пагинации', 'INVALID_CURSOR');
        }

        return await MaterialsCatalogService.fetchMore(team.id, parsed.data);
    },
    { name: 'fetchMoreMaterials' }
);

export const getMaterialCategories = safeAction(
    async ({ team }) => {
        return await MaterialsCatalogService.getCategories(team.id);
    },
    { name: 'getMaterialCategories' }
);

export const getMaterialCategoryTree = safeAction(
    async ({ team }) => {
        return await MaterialsCatalogService.getCategoryTree(team.id);
    },
    { name: 'getMaterialCategoryTree' }
);
