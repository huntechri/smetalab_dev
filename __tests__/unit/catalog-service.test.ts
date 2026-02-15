import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CatalogService } from '@/lib/services/catalog.service';

const worksServiceMocks = vi.hoisted(() => ({
    getMany: vi.fn(),
    search: vi.fn(),
    getCategories: vi.fn(),
}));

vi.mock('@/lib/domain/works/works.service', () => ({
    WorksService: worksServiceMocks,
}));

describe('CatalogService', () => {
    beforeEach(() => {
        worksServiceMocks.getMany.mockReset();
        worksServiceMocks.search.mockReset();
        worksServiceMocks.getCategories.mockReset();
    });

    it('uses AI search when ai mode is enabled and query is long enough', async () => {
        worksServiceMocks.search.mockResolvedValue({ success: true, data: [] });

        await CatalogService.searchWorks(7, { query: 'бетон м300', isAiMode: true });

        expect(worksServiceMocks.search).toHaveBeenCalledWith(7, 'бетон м300');
        expect(worksServiceMocks.getMany).not.toHaveBeenCalled();
    });

    it('validates input and returns validation error for invalid limit', async () => {
        const result = await CatalogService.searchWorks(7, { query: 'x', limit: 10000 });

        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.code).toBe('VALIDATION_ERROR');
        }
    });

    it('coerces decimal price returned as string into number', async () => {
        worksServiceMocks.getMany.mockResolvedValue({
            success: true,
            data: [{ id: '2', code: '1.2', name: 'Штукатурка', unit: 'м2', price: '1250.5', category: 'Отделка', subcategory: 'Стены' }],
        });

        const result = await CatalogService.searchWorks(4, { query: '', isAiMode: false, category: 'all', limit: 80 });

        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data[0].price).toBe(1250.5);
        }
    });
    it('maps domain rows into catalog DTO', async () => {
        worksServiceMocks.getMany.mockResolvedValue({
            success: true,
            data: [{ id: '1', code: null, name: 'Песок', unit: null, price: null, category: null, subcategory: null }],
        });

        const result = await CatalogService.searchWorks(4, { query: '', isAiMode: false, category: 'all', limit: 80 });

        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data[0]).toEqual({
                id: '1',
                code: '',
                name: 'Песок',
                unit: '',
                price: 0,
                category: '',
                subcategory: '',
            });
        }
    });
});
