import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MaterialCatalogPicker } from '@/features/catalog/components/MaterialCatalogPicker.client';

afterEach(() => {
    cleanup();
});

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
            expect(catalogRepositoryMocks.searchMaterials).toHaveBeenCalledWith('', 'all', false, 300);
        });

        const input = screen.getByPlaceholderText('Поиск по названию или коду...');
        fireEvent.change(input, { target: { value: 'штукатурка knauf' } });
        fireEvent.keyDown(input, { key: 'Enter' });

        await waitFor(() => {
            expect(catalogRepositoryMocks.searchMaterials).toHaveBeenLastCalledWith('штукатурка knauf', 'all', false, 500);
        });

        fireEvent.click(screen.getByRole('checkbox'));

        await waitFor(() => {
            expect(catalogRepositoryMocks.searchMaterials).toHaveBeenCalledTimes(2);
        });

        fireEvent.keyDown(screen.getByPlaceholderText('Опишите, что нужно найти...'), { key: 'Enter' });

        await waitFor(() => {
            expect(catalogRepositoryMocks.searchMaterials).toHaveBeenLastCalledWith('штукатурка knauf', 'all', true, 500);
        });
    });

    it('supports repeated searches with different queries', async () => {
        render(<MaterialCatalogPicker onAddMaterial={vi.fn()} />);

        const input = await screen.findByPlaceholderText('Поиск по названию или коду...');

        fireEvent.change(input, { target: { value: 'штукатурка' } });
        fireEvent.keyDown(input, { key: 'Enter' });

        await waitFor(() => {
            expect(catalogRepositoryMocks.searchMaterials).toHaveBeenLastCalledWith('штукатурка', 'all', false, 500);
        });

        fireEvent.change(input, { target: { value: 'шпаклевка' } });
        fireEvent.keyDown(input, { key: 'Enter' });

        await waitFor(() => {
            expect(catalogRepositoryMocks.searchMaterials).toHaveBeenLastCalledWith('шпаклевка', 'all', false, 500);
        });
    });

    it('disables add button if material is already added', async () => {
        const mockMaterial = {
            id: '1',
            name: 'Тестовый материал',
            price: 100,
            unit: 'кг',
            code: 'M-1',
            categoryLv1: 'test',
            categoryLv2: 'sub',
            categoryLv3: 'sub2',
            categoryLv4: 'sub3',
            imageUrl: null,
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

        const materialName = await screen.findByText('Тестовый материал');
        const materialCard = materialName.closest<HTMLElement>('.group');

        expect(materialCard).toBeTruthy();
        if (!materialCard) {
            throw new Error('Expected material card container');
        }

        const button = within(materialCard).getByRole('button');

        expect(button).toBeDisabled();
        const icon = button.querySelector('svg');
        expect(icon).toBeTruthy();
        if (!icon) {
            throw new Error('Expected icon in disabled material add button');
        }

        expect(icon).toHaveClass('lucide-check');
    });

    it('toggles category tree on mobile and collapses after category selection', async () => {
        catalogRepositoryMocks.getMaterialCategories.mockResolvedValue(['Крепеж']);

        render(<MaterialCatalogPicker onAddMaterial={vi.fn()} />);

        expect(screen.getByTestId('material-categories-panel').className).toContain('hidden');

        fireEvent.click(screen.getByTestId('material-categories-toggle'));

        await waitFor(() => {
            expect(screen.getByTestId('material-categories-panel').className).toContain('block');
        });

        const categoryButton = await screen.findByRole('button', { name: 'Крепеж' });
        fireEvent.click(categoryButton);

        await waitFor(() => {
            expect(screen.getByTestId('material-categories-panel').className).toContain('hidden');
            expect(screen.getByRole('button', { name: /Категории: Крепеж/i })).toBeInTheDocument();
        });
    });
});
