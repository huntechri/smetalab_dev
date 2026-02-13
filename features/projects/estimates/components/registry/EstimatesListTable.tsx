'use client';

import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { EstimateMeta } from '../../types/dto';
import Link from 'next/link';

const columns: ColumnDef<EstimateMeta>[] = [
    { accessorKey: 'id', header: 'ID' },
    {
        accessorKey: 'name',
        header: 'Название',
        cell: ({ row }) => (
            <Link className="font-medium hover:underline" href={`/app/projects/${row.original.projectId}/estimates/${row.original.id}`}>
                {row.original.name}
            </Link>
        ),
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

export function EstimatesListTable({ estimates }: { estimates: EstimateMeta[] }) {
    return (
        <DataTable
            columns={columns}
            data={estimates}
            filterColumn="name"
            filterPlaceholder="Поиск сметы..."
            height="450px"
        />
    );
}
