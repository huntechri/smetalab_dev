'use server';

import { safeAction } from '@/lib/actions/safe-action';
import { WorksCatalogService } from '@/lib/services/works-catalog.service';

export const fetchMoreWorks = safeAction(
    async ({ team }, { query, lastSortOrder, limit, category, phase }: { query?: string; lastSortOrder?: number; limit?: number; category?: string; phase?: string } = {}) => {
        return await WorksCatalogService.fetchMore(team.id, { query, lastSortOrder, limit, category, phase });
    },
    { name: 'fetchMoreWorks' }
);

export const getWorkPhases = safeAction(
    async ({ team }) => {
        return await WorksCatalogService.getPhases(team.id);
    },
    { name: 'getWorkPhases' }
);

export const getWorkCategories = safeAction(
    async ({ team }) => {
        return await WorksCatalogService.getCategories(team.id);
    },
    { name: 'getWorkCategories' }
);
