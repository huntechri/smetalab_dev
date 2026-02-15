import { fetchCatalogCategories } from '@/app/actions/catalog/categories';
import { fetchCatalogMaterialCategories, searchCatalogMaterials } from '@/app/actions/catalog/materials';
import { searchCatalogWorks } from '@/app/actions/catalog/search';
import { CatalogMaterial, CatalogWork } from '../types/dto';

const SEARCH_CACHE_TTL_MS = 30_000;
const CATEGORY_CACHE_TTL_MS = 120_000;

type CacheEntry<T> = {
    createdAt: number;
    value: T;
};

const materialsSearchCache = new Map<string, CacheEntry<CatalogMaterial[]>>();
const worksSearchCache = new Map<string, CacheEntry<CatalogWork[]>>();
let materialCategoriesCache: CacheEntry<string[]> | null = null;

function getCached<T>(entry: CacheEntry<T> | undefined | null, ttlMs: number): T | null {
    if (!entry) {
        return null;
    }

    if (Date.now() - entry.createdAt > ttlMs) {
        return null;
    }

    return entry.value;
}

function buildMaterialsSearchKey(query: string, category?: string, isAiMode?: boolean, limit = 200): string {
    return `${query}::${category ?? ''}::${Boolean(isAiMode)}::${limit}`;
}

function buildWorksSearchKey(query: string, category?: string, isAiMode?: boolean, limit = 200): string {
    return `${query}::${category ?? ''}::${Boolean(isAiMode)}::${limit}`;
}

export const catalogRepository = {
    async searchWorks(query: string, category?: string, isAiMode?: boolean, limit = 200): Promise<CatalogWork[]> {
        const cacheKey = buildWorksSearchKey(query, category, isAiMode, limit);
        const cached = getCached(worksSearchCache.get(cacheKey), SEARCH_CACHE_TTL_MS);
        if (cached) {
            return cached;
        }

        const result = await searchCatalogWorks({ query, category, isAiMode, limit });
        const value = result.success ? result.data : [];
        worksSearchCache.set(cacheKey, { createdAt: Date.now(), value });

        return value;
    },

    async getCategories(): Promise<string[]> {
        const result = await fetchCatalogCategories();
        return result.success ? result.data : [];
    },

    async searchMaterials(query: string, category?: string, isAiMode?: boolean, limit = 200): Promise<CatalogMaterial[]> {
        const cacheKey = buildMaterialsSearchKey(query, category, isAiMode, limit);
        const cached = getCached(materialsSearchCache.get(cacheKey), SEARCH_CACHE_TTL_MS);
        if (cached) {
            return cached;
        }

        const result = await searchCatalogMaterials({ query, category, isAiMode, limit });
        const value = result.success ? result.data : [];
        materialsSearchCache.set(cacheKey, { createdAt: Date.now(), value });

        return value;
    },

    async getMaterialCategories(): Promise<string[]> {
        const cached = getCached(materialCategoriesCache, CATEGORY_CACHE_TTL_MS);
        if (cached) {
            return cached;
        }

        const result = await fetchCatalogMaterialCategories();
        const value = result.success ? result.data : [];
        materialCategoriesCache = { createdAt: Date.now(), value };

        return value;
    }
};

export const __catalogRepositoryInternal = {
    clearCaches: () => {
        materialsSearchCache.clear();
        worksSearchCache.clear();
        materialCategoriesCache = null;
    }
};
