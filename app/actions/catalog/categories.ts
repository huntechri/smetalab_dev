'use server';

import { safeAction } from '@/lib/actions/safe-action';
import { CatalogService } from '@/lib/services/catalog.service';

export const fetchCatalogCategories = safeAction(
    async ({ team }) => CatalogService.getCategories(team.id),
    { name: 'fetchCatalogCategories' }
);

