import { z } from 'zod';
import { WorksService } from '@/lib/domain/works/works.service';
import { Result, error, success } from '@/lib/utils/result';
import { CatalogWork } from '@/features/catalog/types/dto';

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
            price: work.price || 0,
            category: work.category || '',
            subcategory: work.subcategory || '',
        })));
    }

    static async getCategories(teamId: number): Promise<Result<string[]>> {
        return WorksService.getCategories(teamId);
    }
}
