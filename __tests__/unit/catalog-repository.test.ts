import { beforeEach, describe, expect, it, vi } from 'vitest';
import { catalogRepository } from '@/features/catalog/repository';

const catalogActionMocks = vi.hoisted(() => ({
    searchCatalogWorks: vi.fn(),
    fetchCatalogCategories: vi.fn(),
}));

vi.mock('@/app/actions/catalog/search', () => ({
    searchCatalogWorks: catalogActionMocks.searchCatalogWorks,
}));

vi.mock('@/app/actions/catalog/categories', () => ({
    fetchCatalogCategories: catalogActionMocks.fetchCatalogCategories,
}));

describe('catalogRepository', () => {
    beforeEach(() => {
        catalogActionMocks.searchCatalogWorks.mockReset();
        catalogActionMocks.fetchCatalogCategories.mockReset();
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
});

