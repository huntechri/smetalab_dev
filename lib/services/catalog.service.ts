import { z } from 'zod';
import { WorksService } from '@/lib/domain/works/works.service';
import { MaterialsService } from '@/lib/domain/materials/materials.service';
import { Result, error, success } from '@/lib/utils/result';
import { CatalogMaterial, CatalogWork } from '@/features/catalog/types/dto';

const searchInputSchema = z.object({
    query: z.string().trim().max(200).optional().default(''),
    category: z.string().trim().max(120).optional(),
    isAiMode: z.boolean().optional().default(false),
    limit: z.number().int().positive().max(500).optional().default(200),
});

export class CatalogService {
    static async searchWorks(teamId: number, rawInput: unknown): Promise<Result<CatalogWork[]>> {
        const parsed = searchInputSchema.safeParse(rawInput);
        if (!parsed.success) {
            return error(`Ошибка валидации: ${parsed.error.message}`, 'VALIDATION_ERROR');
        }

        const { query, category, isAiMode, limit } = parsed.data;
        const result = isAiMode && query.length >= 2
            ? await WorksService.search(teamId, query)
            : await WorksService.getMany(teamId, limit, query || undefined, undefined, category);

        if (!result.success) {
            return error(result.error.message, result.error.code, result.error.details);
        }

        return success(result.data.map((work) => ({
            id: work.id,
            code: work.code || '',
            name: work.name,
            unit: work.unit || '',
            price: typeof work.price === 'number' ? work.price : Number(work.price ?? 0) || 0,
            category: work.category || '',
            subcategory: work.subcategory || '',
        })));
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
        const result = isAiMode && query.length >= 2
            ? await MaterialsService.search(teamId, query)
            : await MaterialsService.getMany(teamId, limit, query || undefined);

        if (!result.success) {
            return error(result.error.message, result.error.code, result.error.details);
        }

        const normalizedCategory = category && category !== 'all' ? category : undefined;
        const filtered = normalizedCategory
            ? result.data.filter((material) => material.categoryLv1 === normalizedCategory)
            : result.data;

        return success(filtered.map((material) => ({
            id: material.id,
            code: material.code || '',
            name: material.name,
            unit: material.unit || '',
            price: typeof material.price === 'number' ? material.price : Number(material.price ?? 0) || 0,
            categoryLv1: material.categoryLv1 || '',
            categoryLv2: material.categoryLv2 || '',
            imageUrl: material.imageUrl,
        })));
    }

    static async getMaterialCategories(teamId: number): Promise<Result<string[]>> {
        const result = await MaterialsService.getMany(teamId, 1000);
        if (!result.success) {
            return error(result.error.message, result.error.code, result.error.details);
        }

        const categories = Array.from(new Set(
            result.data
                .map((material) => material.categoryLv1?.trim())
                .filter((category): category is string => Boolean(category && category.length > 0))
        )).sort((a, b) => a.localeCompare(b, 'ru-RU'));

        return success(categories);
    }
}
