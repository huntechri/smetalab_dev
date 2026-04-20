import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import type { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@repo/ui';

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
    it('renders semantic sortable header button and toggles sort from keyboard', async () => {
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

        expect(sortButton).not.toHaveAttribute('data-slot', 'button');
        expect(sortButton).not.toHaveClass('bg-primary');

        const headerCell = sortButton.closest('th');
        expect(headerCell).toHaveAttribute('aria-sort', 'none');

        sortButton.focus();
        await userEvent.keyboard('{Enter}');
        expect(headerCell).toHaveAttribute('aria-sort', 'ascending');

        await userEvent.keyboard('{Enter}');
        expect(headerCell).toHaveAttribute('aria-sort', 'descending');
    });
});
