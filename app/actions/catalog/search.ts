'use server';

import { safeAction } from '@/lib/actions/safe-action';
import { CatalogService } from '@/lib/services/catalog.service';

export const searchCatalogWorks = safeAction(
    async ({ team }, input: { query?: string; category?: string; isAiMode?: boolean; limit?: number } = {}) => {
        return CatalogService.searchWorks(team.id, input);
    },
    { name: 'searchCatalogWorks' }
);

