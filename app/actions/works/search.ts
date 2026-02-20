'use server';

import { safeAction } from '@/lib/actions/safe-action';
import { WorksCatalogService } from '@/lib/services/works-catalog.service';

export const fetchMoreWorks = safeAction(
    async ({ team }, { query, lastSortOrder, limit, category }: { query?: string; lastSortOrder?: number; limit?: number; category?: string } = {}) => {
        return await WorksCatalogService.fetchMore(team.id, { query, lastSortOrder, limit, category });
    },
    { name: 'fetchMoreWorks' }
);
