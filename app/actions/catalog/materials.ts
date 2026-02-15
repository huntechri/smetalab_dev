'use server';

import { safeAction } from '@/lib/actions/safe-action';
import { CatalogService } from '@/lib/services/catalog.service';

export const searchCatalogMaterials = safeAction(
    async ({ team }, input: { query?: string; category?: string; isAiMode?: boolean; limit?: number } = {}) => {
        return CatalogService.searchMaterials(team.id, input);
    },
    { name: 'searchCatalogMaterials' }
);

export const fetchCatalogMaterialCategories = safeAction(
    async ({ team }) => CatalogService.getMaterialCategories(team.id),
    { name: 'fetchCatalogMaterialCategories' }
);
