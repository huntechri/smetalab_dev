'use server';

import { safeAction } from '@/lib/actions/safe-action';
import { WorksCatalogService } from '@/lib/services/works-catalog.service';


export const searchWorks = safeAction(async function searchWorksHandler({ team }, query: string) {
    return await WorksCatalogService.search(team.id, query);
}, { name: 'searchWorks' });

