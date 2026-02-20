'use server';

import { safeAction } from '@/lib/actions/safe-action';
import { MaterialsCatalogService } from '@/lib/services/materials-catalog.service';

export const fetchMoreMaterials = safeAction(
    async ({ team }, { query, lastCode }: { query?: string; lastCode?: string } = {}) => {
        return await MaterialsCatalogService.fetchMore(team.id, { query, lastCode });
    },
    { name: 'fetchMoreMaterials' }
);
