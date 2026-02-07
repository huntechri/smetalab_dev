'use server';

import { WorksService } from '@/lib/services/works.service';
import { safeAction } from '@/lib/actions/safe-action';

export const fetchMoreWorks = safeAction(
    async ({ team }, { query, lastSortOrder, limit }: { query?: string; lastSortOrder?: number; limit?: number } = {}) => {
        return await WorksService.getMany(team.id, limit, query, lastSortOrder);
    },
    { name: 'fetchMoreWorks' }
);
