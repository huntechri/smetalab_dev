import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CatalogService } from '@/lib/services/catalog.service';

const worksServiceMocks = vi.hoisted(() => ({
    getMany: vi.fn(),
    search: vi.fn(),
    getCategories: vi.fn(),
}));

const materialsServiceMocks = vi.hoisted(() => ({
    getMany: vi.fn(),
    search: vi.fn(),
}));

vi.mock('@/lib/domain/works/works.service', () => ({
    WorksService: worksServiceMocks,
}));

vi.mock('@/lib/domain/materials/materials.service', () => ({
    MaterialsService: materialsServiceMocks,
}));

describe('CatalogService', () => {
    beforeEach(() => {
        worksServiceMocks.getMany.mockReset();
        worksServiceMocks.search.mockReset();
        worksServiceMocks.getCategories.mockReset();
        materialsServiceMocks.getMany.mockReset();
        materialsServiceMocks.search.mockReset();
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

    it('searches materials and maps category fields', async () => {
        materialsServiceMocks.getMany.mockResolvedValue({
            success: true,
            data: [{
                id: 'm1',
                code: 'm-1',
                name: 'Бетон М300',
                unit: 'м3',
                price: '6400',
                categoryLv1: 'Бетон',
                categoryLv2: 'Товарный',
                imageUrl: 'https://example.com/m300.jpg',
            }],
        });

        const result = await CatalogService.searchMaterials(7, { query: 'бетон', category: 'all', isAiMode: false, limit: 100 });

        expect(materialsServiceMocks.getMany).toHaveBeenCalledWith(7, 100, 'бетон');
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data[0]).toEqual({
                id: 'm1',
                code: 'm-1',
                name: 'Бетон М300',
                unit: 'м3',
                price: 6400,
                categoryLv1: 'Бетон',
                categoryLv2: 'Товарный',
                imageUrl: 'https://example.com/m300.jpg',
            });
        }
    });

    it('returns material categories list', async () => {
        materialsServiceMocks.getMany.mockResolvedValue({
            success: true,
            data: [
                { categoryLv1: 'Метизы' },
                { categoryLv1: 'Сухие смеси' },
                { categoryLv1: 'Метизы' },
                { categoryLv1: null },
            ],
        });

        const result = await CatalogService.getMaterialCategories(9);

        expect(materialsServiceMocks.getMany).toHaveBeenCalledWith(9, 1000);
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data).toEqual(['Метизы', 'Сухие смеси']);
        }
    });
});
