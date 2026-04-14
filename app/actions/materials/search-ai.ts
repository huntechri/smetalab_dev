'use server';

import { safeAction } from '@/lib/actions/safe-action';
import { MaterialsCatalogService } from '@/lib/services/materials-catalog.service';

export const searchMaterials = safeAction(
    async ({ team }, { query, categoryLv1, categoryLv2, categoryLv3, categoryLv4 }: { 
        query: string;
        categoryLv1?: string;
        categoryLv2?: string;
        categoryLv3?: string;
        categoryLv4?: string;
    }) => {
        return await MaterialsCatalogService.search(team.id, query, categoryLv1, categoryLv2, categoryLv3, categoryLv4);
    },
    { name: 'searchMaterials' }
);
