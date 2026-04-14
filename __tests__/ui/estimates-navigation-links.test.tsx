import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ProjectEstimatesSection } from '@/features/projects/dashboard/components/ProjectEstimatesSection';

vi.mock('@/shared/ui/data-table', () => ({
    DataTable: ({
        columns,
        data,
    }: {
        columns: Array<{
            accessorKey?: string;
            cell?: (context: { row: { original: { id: string; projectId: string; name: string } } }) => React.ReactNode;
        }>;
        data: Array<{ id: string; projectId: string; name: string }>;
    }) => {
        const nameColumn = columns.find((column) => column.accessorKey === 'name');
        const nameCell = nameColumn?.cell
            ? nameColumn.cell({ row: { original: data[0] } })
            : null;

        return <div>{nameCell}</div>;
    },
}));

vi.mock('next/navigation', () => ({
    useRouter: () => ({
        refresh: vi.fn(),
        push: vi.fn(),
        replace: vi.fn(),
    }),
}));

import { EstimatesListTable } from '@/features/projects/estimates/components/registry/EstimatesListTable';

describe('estimates navigation links', () => {
    it('renders app-scoped project estimates link in project card section', () => {
        render(<ProjectEstimatesSection projectSlug="north-park" />);

        expect(screen.getByRole('link', { name: 'Все сметы' })).toHaveAttribute(
            'href',
            '/app/projects/north-park/estimates',
        );
    });

    it('renders app-scoped estimate details link in estimates table', () => {
        render(
            <EstimatesListTable
                projectSlug="north-park"
                estimates={[
                    {
                        id: 'uuid-1',
                        projectId: 'uuid-project',
                        name: 'Смета A',
                        slug: 'smeta-a',
                        total: 1000,
                        status: 'draft',
                        createdAt: new Date('2025-01-01T00:00:00.000Z').toISOString(),
                        updatedAt: new Date('2025-01-01T00:00:00.000Z').toISOString(),
                    },
                ]}
            />,
        );

        expect(screen.getByRole('link', { name: 'Смета A' })).toHaveAttribute(
            'href',
            '/app/projects/north-park/estimates/smeta-a',
        );
    });
});
