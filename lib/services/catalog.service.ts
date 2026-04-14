import { z } from 'zod';
import { WorksService } from '@/lib/domain/works/works.service';
import { MaterialsService } from '@/lib/domain/materials/materials.service';
import { Result, error, success } from '@/lib/utils/result';
import { CatalogMaterial, CatalogWork } from '@/features/catalog/types/dto';

const searchInputSchema = z.object({
    query: z.string().trim().max(200).optional().default(''),
    category: z.string().trim().max(120).optional(),
    isAiMode: z.boolean().optional().default(false),
    limit: z.number().int().positive().max(5000).optional().default(200),
});

const MATERIAL_SEARCH_CACHE_TTL_MS = 20_000;
const WORK_SEARCH_CACHE_TTL_MS = 20_000;

type CacheEntry<T> = {
    createdAt: number;
    value: T;
};

const materialSearchCache = new Map<string, CacheEntry<CatalogMaterial[]>>();
const workSearchCache = new Map<string, CacheEntry<CatalogWork[]>>();

function getCachedValue<T>(cache: Map<string, CacheEntry<T>>, key: string, ttlMs: number): T | null {
    const entry = cache.get(key);
    if (!entry) {
        return null;
    }

    if (Date.now() - entry.createdAt > ttlMs) {
        cache.delete(key);
        return null;
    }

    return entry.value;
}

function buildMaterialCacheKey(teamId: number, query: string, category: string | undefined, isAiMode: boolean, limit: number): string {
    return `${teamId}::${query}::${category ?? ''}::${isAiMode}::${limit}`;
}

function buildWorkCacheKey(teamId: number, query: string, category: string | undefined, isAiMode: boolean, limit: number): string {
    return `${teamId}::${query}::${category ?? ''}::${isAiMode}::${limit}`;
}

export class CatalogService {
    static async searchWorks(teamId: number, rawInput: unknown): Promise<Result<CatalogWork[]>> {
        const parsed = searchInputSchema.safeParse(rawInput);
        if (!parsed.success) {
            return error(`Ошибка валидации: ${parsed.error.message}`, 'VALIDATION_ERROR');
        }

        const { query, category, isAiMode, limit } = parsed.data;
        const cacheKey = buildWorkCacheKey(teamId, query, category, isAiMode, limit);
        const cached = getCachedValue(workSearchCache, cacheKey, WORK_SEARCH_CACHE_TTL_MS);
        if (cached) {
            return success(cached);
        }

        const result = isAiMode && query.length >= 2
            ? await WorksService.search(teamId, query, category)
            : await WorksService.getMany(teamId, limit, query || undefined, undefined, category);

        if (!result.success) {
            return error(result.error.message, result.error.code, result.error.details);
        }

        const normalized = result.data.map((work) => ({
            id: work.id,
            code: work.code || '',
            name: work.name,
            unit: work.unit || '',
            price: typeof work.price === 'number' ? work.price : Number(work.price ?? 0) || 0,
            category: work.category || '',
            subcategory: work.subcategory || '',
        }));

        workSearchCache.set(cacheKey, { createdAt: Date.now(), value: normalized });

        return success(normalized);
    }

    static async getCategories(teamId: number): Promise<Result<string[]>> {
        return WorksService.getCategories(teamId);
    }

    static async searchMaterials(teamId: number, rawInput: unknown): Promise<Result<CatalogMaterial[]>> {
        const parsed = searchInputSchema.safeParse(rawInput);
        if (!parsed.success) {
            return error(`Ошибка валидации: ${parsed.error.message}`, 'VALIDATION_ERROR');
        }

        const { query, category, isAiMode, limit } = parsed.data;
        const cacheKey = buildMaterialCacheKey(teamId, query, category, isAiMode, limit);
        const cached = getCachedValue(materialSearchCache, cacheKey, MATERIAL_SEARCH_CACHE_TTL_MS);
        if (cached) {
            return success(cached);
        }

        const result = isAiMode && query.length >= 2
            ? await MaterialsService.search(teamId, query, category)
            : await MaterialsService.getMany(teamId, limit, query || undefined, undefined, undefined, undefined, category);

        if (!result.success) {
            return error(result.error.message, result.error.code, result.error.details);
        }

        const normalized = result.data.slice(0, limit).map((material) => ({
            id: material.id,
            code: material.code || '',
            name: material.name,
            unit: material.unit || '',
            price: typeof material.price === 'number' ? material.price : Number(material.price ?? 0) || 0,
            categoryLv1: material.categoryLv1 || '',
            categoryLv2: material.categoryLv2 || '',
            categoryLv3: material.categoryLv3 || '',
            categoryLv4: material.categoryLv4 || '',
            imageUrl: material.imageUrl,
        }));

        materialSearchCache.set(cacheKey, { createdAt: Date.now(), value: normalized });

        return success(normalized);
    }

    static async getMaterialCategories(teamId: number): Promise<Result<string[]>> {
        const result = await MaterialsService.getCategories(teamId);
        if (!result.success) {
            return error(result.error.message, result.error.code, result.error.details);
        }

        return success(result.data);
    }
}

export const __catalogServiceInternal = {
    clearMaterialSearchCache: () => {
        materialSearchCache.clear();
    },
    clearWorkSearchCache: () => {
        workSearchCache.clear();
    }
};
