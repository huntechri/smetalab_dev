'use client';

import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { EstimateMeta } from '../../types/dto';
import Link from 'next/link';

type EstimatesListTableProps = {
    estimates: EstimateMeta[];
    projectSlug?: string;
    actions?: React.ReactNode;
};

const createColumns = (projectSlug?: string): ColumnDef<EstimateMeta>[] => [
    {
        accessorKey: 'name',
        header: 'Название',
        cell: ({ row }) => {
            const slug = projectSlug || row.original.projectId;
            return (
                <Link className="font-medium hover:underline" href={`/app/projects/${slug}/estimates/${row.original.slug}`}>
                    {row.original.name}
                </Link>
            );
        },
    },
    {
        accessorKey: 'total',
        header: 'Сумма',
        cell: ({ row }) => new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(row.original.total),
    },
    { accessorKey: 'status', header: 'Статус' },
    {
        accessorKey: 'createdAt',
        header: 'Дата создания',
        cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString('ru-RU'),
    },
];

export function EstimatesListTable({ estimates, projectSlug, actions }: EstimatesListTableProps) {
    const columns = createColumns(projectSlug);
    return (
        <DataTable
            columns={columns}
            data={estimates}
            filterColumn="name"
            filterPlaceholder="Поиск сметы..."
            height="450px"
            actions={actions}
        />
    );
}
