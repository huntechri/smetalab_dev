import { render, screen, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { WorkCatalogPicker } from '@/features/catalog/components/WorkCatalogPicker.client';

const catalogRepositoryMocks = vi.hoisted(() => ({
    searchWorks: vi.fn(),
    getWorkCategories: vi.fn(),
    getCategories: vi.fn(),
}));

vi.mock('@/features/catalog/repository', () => ({
    catalogRepository: catalogRepositoryMocks,
}));

vi.mock('react-virtuoso', () => ({
    Virtuoso: ({ data, itemContent }: { data: unknown[]; itemContent: (index: number, item: unknown) => ReactNode }) => (
        <div>
            {data.map((item, index) => <div key={index}>{itemContent(index, item)}</div>)}
        </div>
    ),
}));

describe('WorkCatalogPicker', () => {
    beforeEach(() => {
        catalogRepositoryMocks.searchWorks.mockReset();
        catalogRepositoryMocks.getWorkCategories.mockReset();
        catalogRepositoryMocks.getCategories.mockReset();
        catalogRepositoryMocks.searchWorks.mockResolvedValue([]);
        catalogRepositoryMocks.getWorkCategories.mockResolvedValue([]);
        catalogRepositoryMocks.getCategories.mockResolvedValue([]);
    });

    it('disables add button if work is already added', async () => {
        const mockWork = {
            id: '1',
            name: 'Тестовая работа',
            price: 500,
            unit: 'м2',
            code: '01.01.01',
            category: 'test'
        };
        catalogRepositoryMocks.searchWorks.mockResolvedValue([mockWork]);

        const addedWorkNames = new Set(['Тестовая работа']);
        render(
            <WorkCatalogPicker
                onAddWork={vi.fn()}
                addedWorkNames={addedWorkNames}
            />
        );

        await screen.findByText('Тестовая работа');

        await waitFor(() => {
            const addButton = screen
                .getAllByRole('button')
                .find((button) => button.querySelector('.lucide-check'));

            expect(addButton).toBeDefined();
            expect(addButton).toBeDisabled();
        });
    });
});
