import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MaterialCatalogPicker } from '@/features/catalog/components/MaterialCatalogPicker.client';

const catalogRepositoryMocks = vi.hoisted(() => ({
    searchMaterials: vi.fn(),
    getMaterialCategories: vi.fn(),
}));

vi.mock('@/features/catalog/repository', () => ({
    catalogRepository: catalogRepositoryMocks,
}));

vi.mock('react-virtuoso', () => ({
    Virtuoso: ({ data, itemContent, components }: { data: unknown[]; itemContent: (index: number, item: unknown) => ReactNode; components?: { Footer?: () => ReactNode } }) => (
        <div>
            {data.map((item, index) => <div key={index}>{itemContent(index, item)}</div>)}
            {components?.Footer?.()}
        </div>
    ),
}));

describe('MaterialCatalogPicker', () => {
    beforeEach(() => {
        catalogRepositoryMocks.searchMaterials.mockReset();
        catalogRepositoryMocks.getMaterialCategories.mockReset();
        catalogRepositoryMocks.searchMaterials.mockResolvedValue([]);
        catalogRepositoryMocks.getMaterialCategories.mockResolvedValue([]);
    });

    it('supports normal and AI search modes for materials', async () => {
        render(<MaterialCatalogPicker onAddMaterial={vi.fn()} />);

        await waitFor(() => {
            expect(catalogRepositoryMocks.searchMaterials).toHaveBeenCalledWith('', 'all', false);
        });

        fireEvent.click(screen.getByRole('checkbox'));

        await waitFor(() => {
            expect(catalogRepositoryMocks.searchMaterials).toHaveBeenLastCalledWith('', 'all', true);
        });
    });
});
