import { fetchCatalogCategories } from '@/app/actions/catalog/categories';
import { fetchCatalogMaterialCategories, searchCatalogMaterials } from '@/app/actions/catalog/materials';
import { searchCatalogWorks } from '@/app/actions/catalog/search';
import { CatalogMaterial, CatalogWork } from '../types/dto';

export const catalogRepository = {
    async searchWorks(query: string, category?: string, isAiMode?: boolean, limit = 200): Promise<CatalogWork[]> {
        const result = await searchCatalogWorks({ query, category, isAiMode, limit });
        return result.success ? result.data : [];
    },

    async getCategories(): Promise<string[]> {
        const result = await fetchCatalogCategories();
        return result.success ? result.data : [];
    },

    async searchMaterials(query: string, category?: string, isAiMode?: boolean, limit = 200): Promise<CatalogMaterial[]> {
        const result = await searchCatalogMaterials({ query, category, isAiMode, limit });
        return result.success ? result.data : [];
    },

    async getMaterialCategories(): Promise<string[]> {
        const result = await fetchCatalogMaterialCategories();
        return result.success ? result.data : [];
    }
};
