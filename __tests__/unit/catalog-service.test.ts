import { beforeEach, describe, expect, it, vi } from 'vitest';
import { __catalogServiceInternal, CatalogService } from '@/lib/services/catalog.service';

const worksServiceMocks = vi.hoisted(() => ({
    getMany: vi.fn(),
    search: vi.fn(),
    getCategories: vi.fn(),
}));

const materialsServiceMocks = vi.hoisted(() => ({
    getMany: vi.fn(),
    search: vi.fn(),
    getCategories: vi.fn(),
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
        materialsServiceMocks.getCategories.mockReset();
        __catalogServiceInternal.clearMaterialSearchCache();
        __catalogServiceInternal.clearWorkSearchCache();
    });

    it('uses AI search when ai mode is enabled and query is long enough', async () => {
        worksServiceMocks.search.mockResolvedValue({ success: true, data: [] });

        await CatalogService.searchWorks(7, { query: 'бетон м300', isAiMode: true });

        expect(worksServiceMocks.search).toHaveBeenCalledWith(7, 'бетон м300', undefined);
        expect(worksServiceMocks.getMany).not.toHaveBeenCalled();
    });


    it('caches work search results on service layer for identical input', async () => {
        worksServiceMocks.getMany.mockResolvedValue({
            success: true,
            data: [{ id: 'w1', code: '1.1', name: 'Штукатурка стен', unit: 'м2', price: 1200, category: 'Отделка', subcategory: 'Стены' }],
        });

        const first = await CatalogService.searchWorks(5, { query: 'штукатурка', isAiMode: false, category: 'Отделка', limit: 50 });
        const second = await CatalogService.searchWorks(5, { query: 'штукатурка', isAiMode: false, category: 'Отделка', limit: 50 });

        expect(first.success).toBe(true);
        expect(second.success).toBe(true);
        expect(worksServiceMocks.getMany).toHaveBeenCalledTimes(1);
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
                categoryLv3: '',
                categoryLv4: '',
                imageUrl: 'https://example.com/m300.jpg',
            }],
        });

        const result = await CatalogService.searchMaterials(7, { query: 'бетон', category: 'all', isAiMode: false, limit: 100 });

        expect(materialsServiceMocks.getMany).toHaveBeenCalledWith(7, 100, 'бетон', undefined, undefined, undefined, 'all');
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
                categoryLv3: '',
                categoryLv4: '',
                imageUrl: 'https://example.com/m300.jpg',
            });
        }
    });


    it('caches material search results on service layer for identical input', async () => {
        materialsServiceMocks.getMany.mockResolvedValue({
            success: true,
            data: [{
                id: 'm-cache',
                code: 'c-1',
                name: 'Клей монтажный',
                unit: 'шт',
                price: 900,
                categoryLv1: 'Клеи',
                categoryLv2: 'Монтажные',
                imageUrl: null,
            }],
        });

        const first = await CatalogService.searchMaterials(12, { query: 'клей', category: 'all', isAiMode: false, limit: 40 });
        const second = await CatalogService.searchMaterials(12, { query: 'клей', category: 'all', isAiMode: false, limit: 40 });

        expect(first.success).toBe(true);
        expect(second.success).toBe(true);
        expect(materialsServiceMocks.getMany).toHaveBeenCalledTimes(1);
    });

    it('returns material categories list', async () => {
        materialsServiceMocks.getCategories.mockResolvedValue({
            success: true,
            data: ['Метизы', 'Сухие смеси'],
        });

        const result = await CatalogService.getMaterialCategories(9);

        expect(materialsServiceMocks.getCategories).toHaveBeenCalledWith(9);
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data).toEqual(['Метизы', 'Сухие смеси']);
        }
    });
});
