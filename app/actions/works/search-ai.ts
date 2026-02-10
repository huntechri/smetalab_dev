'use server';

import { WorksService } from '@/lib/domain/works/works.service';
import { safeAction } from '@/lib/actions/safe-action';


export const searchWorks = safeAction(async function searchWorksHandler({ team }, query: string) {
    return await WorksService.search(team.id, query);
}, { name: 'searchWorks' });


