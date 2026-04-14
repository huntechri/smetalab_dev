import { beforeEach, describe, expect, it, vi } from 'vitest';
import { __catalogRepositoryInternal, catalogRepository } from '@/features/catalog/repository';

const catalogActionMocks = vi.hoisted(() => ({
    searchCatalogWorks: vi.fn(),
    fetchCatalogCategories: vi.fn(),
    searchCatalogMaterials: vi.fn(),
    fetchCatalogMaterialCategories: vi.fn(),
}));

vi.mock('@/app/actions/catalog/search', () => ({
    searchCatalogWorks: catalogActionMocks.searchCatalogWorks,
}));

vi.mock('@/app/actions/catalog/categories', () => ({
    fetchCatalogCategories: catalogActionMocks.fetchCatalogCategories,
}));

vi.mock('@/app/actions/catalog/materials', () => ({
    searchCatalogMaterials: catalogActionMocks.searchCatalogMaterials,
    fetchCatalogMaterialCategories: catalogActionMocks.fetchCatalogMaterialCategories,
}));

describe('catalogRepository', () => {
    beforeEach(() => {
        catalogActionMocks.searchCatalogWorks.mockReset();
        catalogActionMocks.fetchCatalogCategories.mockReset();
        catalogActionMocks.searchCatalogMaterials.mockReset();
        catalogActionMocks.fetchCatalogMaterialCategories.mockReset();
        __catalogRepositoryInternal.clearCaches();
    });

    it('returns works when catalog action succeeds', async () => {
        catalogActionMocks.searchCatalogWorks.mockResolvedValue({
            success: true,
            data: [{ id: '1', code: '1.1', name: 'Штукатурка', unit: 'м2', price: 1000 }]
        });

        const result = await catalogRepository.searchWorks('штук', 'Отделка', false, 150);

        expect(catalogActionMocks.searchCatalogWorks).toHaveBeenCalledWith({
            query: 'штук',
            category: 'Отделка',
            isAiMode: false,
            limit: 150,
        });
        expect(result).toEqual([{ id: '1', code: '1.1', name: 'Штукатурка', unit: 'м2', price: 1000 }]);
    });


    it('caches works search results for identical queries', async () => {
        catalogActionMocks.searchCatalogWorks.mockResolvedValue({
            success: true,
            data: [{ id: '2', code: '2.1', name: 'Кладка', unit: 'м2', price: 1500 }],
        });

        const first = await catalogRepository.searchWorks('кладка', 'Каменные', false, 120);
        const second = await catalogRepository.searchWorks('кладка', 'Каменные', false, 120);

        expect(first).toEqual(second);
        expect(catalogActionMocks.searchCatalogWorks).toHaveBeenCalledTimes(1);
    });

    it('deduplicates in-flight works search requests with the same key', async () => {
        let resolveAction: ((value: { success: true; data: Array<{ id: string; code: string; name: string; unit: string; price: number }> }) => void) | null = null;
        catalogActionMocks.searchCatalogWorks.mockImplementation(
            () =>
                new Promise((resolve) => {
                    resolveAction = resolve;
                }),
        );

        const firstPromise = catalogRepository.searchWorks('демонтаж', 'Подготовка', false, 50);
        const secondPromise = catalogRepository.searchWorks('демонтаж', 'Подготовка', false, 50);

        expect(catalogActionMocks.searchCatalogWorks).toHaveBeenCalledTimes(1);

        resolveAction?.({
            success: true,
            data: [{ id: 'w1', code: '1', name: 'Демонтаж', unit: 'м2', price: 10 }],
        });

        await expect(firstPromise).resolves.toEqual([{ id: 'w1', code: '1', name: 'Демонтаж', unit: 'м2', price: 10 }]);
        await expect(secondPromise).resolves.toEqual([{ id: 'w1', code: '1', name: 'Демонтаж', unit: 'м2', price: 10 }]);
    });

    it('returns empty array when search action fails', async () => {
        catalogActionMocks.searchCatalogWorks.mockResolvedValue({
            success: false,
            error: 'failed'
        });

        await expect(catalogRepository.searchWorks('x')).resolves.toEqual([]);
    });

    it('returns categories when categories action succeeds', async () => {
        catalogActionMocks.fetchCatalogCategories.mockResolvedValue({
            success: true,
            data: ['Отделка', 'Фундамент']
        });

        await expect(catalogRepository.getCategories()).resolves.toEqual(['Отделка', 'Фундамент']);
    });

    it('returns materials when materials action succeeds', async () => {
        catalogActionMocks.searchCatalogMaterials.mockResolvedValue({
            success: true,
            data: [{ id: 'm1', code: '11', name: 'Кирпич', unit: 'шт', price: 25 }],
        });

        const result = await catalogRepository.searchMaterials('кирпич', 'Каменные', false, 80);

        expect(catalogActionMocks.searchCatalogMaterials).toHaveBeenCalledWith({
            query: 'кирпич',
            category: 'Каменные',
            isAiMode: false,
            limit: 80,
        });
        expect(result).toEqual([{ id: 'm1', code: '11', name: 'Кирпич', unit: 'шт', price: 25 }]);
    });

    it('caches materials search results for identical queries', async () => {
        catalogActionMocks.searchCatalogMaterials.mockResolvedValue({
            success: true,
            data: [{ id: 'm2', code: '12', name: 'Клей', unit: 'кг', price: 50 }],
        });

        const first = await catalogRepository.searchMaterials('клей', 'Смеси', false, 80);
        const second = await catalogRepository.searchMaterials('клей', 'Смеси', false, 80);

        expect(first).toEqual(second);
        expect(catalogActionMocks.searchCatalogMaterials).toHaveBeenCalledTimes(1);
    });

    it('deduplicates in-flight materials search requests with the same key', async () => {
        let resolveAction: ((value: { success: true; data: Array<{ id: string; code: string; name: string; unit: string; price: number }> }) => void) | null = null;
        catalogActionMocks.searchCatalogMaterials.mockImplementation(
            () =>
                new Promise((resolve) => {
                    resolveAction = resolve;
                }),
        );

        const firstPromise = catalogRepository.searchMaterials('цемент', 'Смеси', false, 80);
        const secondPromise = catalogRepository.searchMaterials('цемент', 'Смеси', false, 80);

        expect(catalogActionMocks.searchCatalogMaterials).toHaveBeenCalledTimes(1);

        resolveAction?.({
            success: true,
            data: [{ id: 'm1', code: '1', name: 'Цемент', unit: 'кг', price: 10 }],
        });

        await expect(firstPromise).resolves.toEqual([{ id: 'm1', code: '1', name: 'Цемент', unit: 'кг', price: 10 }]);
        await expect(secondPromise).resolves.toEqual([{ id: 'm1', code: '1', name: 'Цемент', unit: 'кг', price: 10 }]);
    });

    it('returns material categories when action succeeds', async () => {
        catalogActionMocks.fetchCatalogMaterialCategories.mockResolvedValue({
            success: true,
            data: ['Каменные', 'Пиломатериалы'],
        });

        await expect(catalogRepository.getMaterialCategories()).resolves.toEqual(['Каменные', 'Пиломатериалы']);
    });

    it('caches material categories response', async () => {
        catalogActionMocks.fetchCatalogMaterialCategories.mockResolvedValue({
            success: true,
            data: ['Каменные', 'Пиломатериалы'],
        });

        const first = await catalogRepository.getMaterialCategories();
        const second = await catalogRepository.getMaterialCategories();

        expect(first).toEqual(second);
        expect(catalogActionMocks.fetchCatalogMaterialCategories).toHaveBeenCalledTimes(1);
    });

    it('deduplicates in-flight material categories requests', async () => {
        let resolveAction: ((value: { success: true; data: string[] }) => void) | null = null;
        catalogActionMocks.fetchCatalogMaterialCategories.mockImplementation(
            () =>
                new Promise((resolve) => {
                    resolveAction = resolve;
                }),
        );

        const firstPromise = catalogRepository.getMaterialCategories();
        const secondPromise = catalogRepository.getMaterialCategories();

        expect(catalogActionMocks.fetchCatalogMaterialCategories).toHaveBeenCalledTimes(1);

        resolveAction?.({ success: true, data: ['Сухие смеси'] });

        await expect(firstPromise).resolves.toEqual(['Сухие смеси']);
        await expect(secondPromise).resolves.toEqual(['Сухие смеси']);
    });
});
