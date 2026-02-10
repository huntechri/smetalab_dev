import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/ui/data-table';

vi.mock('react-virtuoso', async () => {
    const mock = await import('../__mocks__/react-virtuoso');
    return mock;
});

type TestRow = {
    id: string;
    name: string;
};

const columns: ColumnDef<TestRow>[] = [
    {
        accessorKey: 'name',
        header: 'Название',
        enableSorting: true,
    },
];

describe('DataTable a11y interactions', () => {
    it('renders semantic sortable header button and toggles sort from keyboard', () => {
        render(
            <DataTable
                columns={columns}
                data={[
                    { id: '2', name: 'Бета' },
                    { id: '1', name: 'Альфа' },
                ]}
            />
        );

        const sortButton = screen.getByRole('button', { name: 'Сортировать столбец' });
        expect(sortButton).toBeInTheDocument();

        const headerCell = sortButton.closest('th');
        expect(headerCell).toHaveAttribute('aria-sort', 'none');

        fireEvent.keyDown(sortButton, { key: 'Enter' });
        expect(headerCell).toHaveAttribute('aria-sort', 'ascending');

        fireEvent.keyDown(sortButton, { key: 'Enter' });
        expect(headerCell).toHaveAttribute('aria-sort', 'descending');
    });
});
