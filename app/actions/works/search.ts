'use server';

import { WorksService } from '@/lib/domain/works/works.service';
import { safeAction } from '@/lib/actions/safe-action';

export const fetchMoreWorks = safeAction(
    async ({ team }, { query, lastSortOrder, limit, category }: { query?: string; lastSortOrder?: number; limit?: number; category?: string } = {}) => {
        return await WorksService.getMany(team.id, limit, query, lastSortOrder, category);
    },
    { name: 'fetchMoreWorks' }
);
