'use server';

import { safeAction } from '@/lib/actions/safe-action';
import { MaterialsCatalogService } from '@/lib/services/materials-catalog.service';

export const generateMissingEmbeddings = safeAction(
    async ({ team }) => {
        return await MaterialsCatalogService.generateMissingEmbeddings(team.id);
    },
    { name: 'generateMissingEmbeddings' }
);
