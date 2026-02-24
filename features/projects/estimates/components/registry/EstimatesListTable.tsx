'use client';

import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { EstimateMeta, EstimateStatus } from '../../types/dto';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { estimatesActionRepo } from '../../repository/estimates.actions';
import { useToast } from '@/components/ui/use-toast';
import { getEstimateStatusLabel } from '@/features/projects/shared/utils/status-view';

const estimateStatusOrder: EstimateStatus[] = ['draft', 'in_progress', 'approved'];

function EstimateStatusCell({
  status,
  onChange,
}: {
  status: EstimateStatus;
  onChange: (next: EstimateStatus) => Promise<void>;
}) {
  const badgeClassName =
    status === 'approved'
      ? 'bg-emerald-600 hover:bg-emerald-600 text-white'
      : status === 'in_progress'
        ? 'bg-blue-500 hover:bg-blue-600 text-white'
        : 'bg-orange-500 hover:bg-orange-600 text-white';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="ghost" className="inline-flex h-auto p-0 hover:bg-transparent">
          <Badge className={`cursor-pointer border-0 h-8 w-[132px] justify-center px-2 text-xs font-semibold uppercase tracking-tight md:text-sm ${badgeClassName}`}>
            {getEstimateStatusLabel(status)}
          </Badge>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[150px] p-1">
        {estimateStatusOrder.map((item) => (
          <DropdownMenuItem key={item} onClick={() => void onChange(item)} className="mb-0.5 h-8 cursor-pointer rounded-md">
            <div className="flex items-center gap-2 w-full">
              <div className={`w-2 h-2 rounded-full ${item === 'approved' ? 'bg-emerald-500' : item === 'in_progress' ? 'bg-blue-500' : 'bg-orange-500'}`} />
              <span className="text-xs font-medium md:text-sm">{getEstimateStatusLabel(item)}</span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

type EstimatesListTableProps = {
  estimates: EstimateMeta[];
  projectSlug?: string;
  actions?: React.ReactNode;
};

export function EstimatesListTable({ estimates, projectSlug, actions }: EstimatesListTableProps) {
  const [rows, setRows] = useState<EstimateMeta[]>(estimates);
  const { toast } = useToast();

  useEffect(() => {
    setRows(estimates);
  }, [estimates]);

  const columns = useMemo<ColumnDef<EstimateMeta>[]>(() => [
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
    {
      accessorKey: 'status',
      header: 'Статус',
      cell: ({ row }) => (
        <EstimateStatusCell
          status={row.original.status}
          onChange={async (nextStatus) => {
            if (nextStatus === row.original.status) {
              return;
            }

            const previousStatus = row.original.status;
            setRows((current) => current.map((item) => (item.id === row.original.id ? { ...item, status: nextStatus } : item)));

            try {
              await estimatesActionRepo.updateStatus(row.original.id, nextStatus);
            } catch (error) {
              setRows((current) => current.map((item) => (item.id === row.original.id ? { ...item, status: previousStatus } : item)));
              toast({
                variant: 'destructive',
                title: 'Ошибка',
                description: error instanceof Error ? error.message : 'Не удалось обновить статус сметы.',
              });
            }
          }}
        />
      ),
    },
    {
      accessorKey: 'createdAt',
      header: 'Дата создания',
      cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString('ru-RU'),
    },
  ], [projectSlug, toast]);

  return (
    <DataTable
      columns={columns}
      data={rows}
      filterColumn="name"
      filterPlaceholder="Поиск сметы..."
      height="450px"
      actions={actions}
    />
  );
}
