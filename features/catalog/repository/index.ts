import { fetchCatalogCategories } from '@/app/actions/catalog/categories';
import { searchCatalogWorks } from '@/app/actions/catalog/search';
import { CatalogWork } from '../types/dto';

export const catalogRepository = {
    async searchWorks(query: string, category?: string, isAiMode?: boolean, limit = 200): Promise<CatalogWork[]> {
        const result = await searchCatalogWorks({ query, category, isAiMode, limit });
        return result.success ? result.data : [];
    },

    async getCategories(): Promise<string[]> {
        const result = await fetchCatalogCategories();
        return result.success ? result.data : [];
    }
};
