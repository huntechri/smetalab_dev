'use server';

import { safeAction } from '@/lib/actions/safe-action';
import { MaterialsCatalogService } from '@/lib/services/materials-catalog.service';

export const searchMaterials = safeAction(
    async ({ team }, query: string) => {
        return await MaterialsCatalogService.search(team.id, query);
    },
    { name: 'searchMaterials' }
);
