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

    it('runs search on Enter and keeps normal/AI modes explicit', async () => {
        render(<MaterialCatalogPicker onAddMaterial={vi.fn()} />);

        await waitFor(() => {
            expect(catalogRepositoryMocks.searchMaterials).toHaveBeenCalledWith('', 'all', false);
        });

        const input = screen.getByPlaceholderText('Поиск по названию или коду...');
        fireEvent.change(input, { target: { value: 'штукатурка knauf' } });
        fireEvent.keyDown(input, { key: 'Enter' });

        await waitFor(() => {
            expect(catalogRepositoryMocks.searchMaterials).toHaveBeenLastCalledWith('штукатурка knauf', 'all', false);
        });

        fireEvent.click(screen.getByRole('checkbox'));

        await waitFor(() => {
            expect(catalogRepositoryMocks.searchMaterials).toHaveBeenCalledTimes(2);
        });

        fireEvent.keyDown(screen.getByPlaceholderText('Опишите, что нужно найти...'), { key: 'Enter' });

        await waitFor(() => {
            expect(catalogRepositoryMocks.searchMaterials).toHaveBeenLastCalledWith('штукатурка knauf', 'all', true);
        });
    });

    it('supports repeated searches with different queries', async () => {
        render(<MaterialCatalogPicker onAddMaterial={vi.fn()} />);

        const input = await screen.findByPlaceholderText('Поиск по названию или коду...');

        fireEvent.change(input, { target: { value: 'штукатурка' } });
        fireEvent.keyDown(input, { key: 'Enter' });

        await waitFor(() => {
            expect(catalogRepositoryMocks.searchMaterials).toHaveBeenLastCalledWith('штукатурка', 'all', false);
        });

        fireEvent.change(input, { target: { value: 'шпаклевка' } });
        fireEvent.keyDown(input, { key: 'Enter' });

        await waitFor(() => {
            expect(catalogRepositoryMocks.searchMaterials).toHaveBeenLastCalledWith('шпаклевка', 'all', false);
        });
    });

    it('disables add button if material is already added', async () => {
        const mockMaterial = {
            id: '1',
            name: 'Тестовый материал',
            price: 100,
            unit: 'кг',
            category: 'test'
        };
        catalogRepositoryMocks.searchMaterials.mockResolvedValue([mockMaterial]);

        const addedMaterialNames = new Set(['Тестовый материал']);
        render(
            <MaterialCatalogPicker
                onAddMaterial={vi.fn()}
                addedMaterialNames={addedMaterialNames}
            />
        );

        await waitFor(() => {
            expect(catalogRepositoryMocks.searchMaterials).toHaveBeenCalled();
        });

        const button = screen.getAllByRole('button').find((candidate) => candidate.hasAttribute('disabled'));
        expect(button).toBeDefined();
        if (!button) {
            throw new Error('Expected disabled material add button');
        }

        expect(button).toBeDisabled();
        expect(button.querySelector('svg')).toHaveClass('lucide-check');
    });
});
