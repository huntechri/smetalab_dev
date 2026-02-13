import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ProjectEstimatesSection } from '@/features/projects/dashboard/components/ProjectEstimatesSection';

vi.mock('@/components/ui/data-table', () => ({
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

import { EstimatesListTable } from '@/features/projects/estimates/components/registry/EstimatesListTable';

describe('estimates navigation links', () => {
    it('renders app-scoped project estimates link in project card section', () => {
        render(<ProjectEstimatesSection projectId="project-42" />);

        expect(screen.getByRole('link', { name: 'Все сметы' })).toHaveAttribute(
            'href',
            '/app/projects/project-42/estimates',
        );
    });

    it('renders app-scoped estimate details link in estimates table', () => {
        render(
            <EstimatesListTable
                estimates={[
                    {
                        id: 'estimate-7',
                        projectId: 'project-42',
                        name: 'Смета A',
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
            '/app/projects/project-42/estimates/estimate-7',
        );
    });
});
