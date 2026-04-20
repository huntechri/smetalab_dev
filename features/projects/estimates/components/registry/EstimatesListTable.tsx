'use client';

import { DataTable } from '@repo/ui';
import { ColumnDef } from '@tanstack/react-table';
import { EstimateMeta, EstimateStatus } from '../../types/dto';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Badge } from '@repo/ui';
import { Button } from '@repo/ui';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@repo/ui';
import { Trash2 } from 'lucide-react';
import { estimateStatusOrder, getEstimateStatusLabel } from '@/entities/estimate/model/status';
import { useEstimateMutations } from '../../hooks/use-estimate-mutations';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@repo/ui';

function EstimateStatusCell({
  status,
  onChange,
}: {
  status: EstimateStatus;
  onChange: (next: EstimateStatus) => Promise<void>;
}) {
  const variant =
    status === 'approved'
      ? 'success'
      : status === 'in_progress'
        ? 'info'
        : 'warning';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
        >
          <Badge variant={variant} size="xs" className="min-w-[88px] cursor-pointer md:min-w-[100px]">
            {getEstimateStatusLabel(status)}
          </Badge>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[150px] p-1">
        {estimateStatusOrder.map((item) => (
          <DropdownMenuItem key={item} onClick={() => void onChange(item)} className="mb-0.5 h-8 cursor-pointer rounded-md">
            <div className="flex items-center gap-2 w-full">
              <div className={`w-2 h-2 rounded-full ${item === 'approved' ? 'bg-emerald-500' : item === 'in_progress' ? 'bg-blue-500' : 'bg-brand'}`} />
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
  emptyState?: React.ReactNode;
  showSearch?: boolean;
  tableMinWidth?: string | number;
  createInBodyAction?: React.ReactNode;
  height?: string;
  tableContainerClassName?: string;
};

export function EstimatesListTable({
  estimates,
  projectSlug,
  actions,
  emptyState,
  showSearch = true,
  tableMinWidth = '800px',
  createInBodyAction,
  height = '450px',
  tableContainerClassName,
}: EstimatesListTableProps) {
  const [rows, setRows] = useState<EstimateMeta[]>(estimates);
  const { updateEstimateStatus, deleteEstimate } = useEstimateMutations();

  useEffect(() => {
    setRows(estimates);
  }, [estimates]);

  const columns = useMemo<ColumnDef<EstimateMeta>[]>(() => [
    {
      accessorKey: 'name',
      header: 'Название',
      size: 200,
      cell: ({ row }) => {
        const slug = projectSlug || row.original.projectId;
        return (
          <Link className="block max-w-full truncate font-normal text-xs md:text-sm hover:underline" href={`/app/projects/${slug}/estimates/${row.original.slug}`} title={row.original.name}>
            {row.original.name}
          </Link>
        );
      },
    },
    {
      accessorKey: 'total',
      header: 'Сумма',
      size: 145,
      cell: ({ row }) => <span className="font-bold tracking-tight text-xs md:text-sm tabular-nums">{new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(row.original.total)}</span>,
    },
    {
      accessorKey: 'status',
      header: 'Статус',
      size: 130,
      cell: ({ row }) => (
        <EstimateStatusCell
          status={row.original.status}
          onChange={async (nextStatus) => {
            await updateEstimateStatus({
              estimateId: row.original.id,
              currentStatus: row.original.status,
              nextStatus,
              setRows,
            });
          }}
        />
      ),
    },
    {
      accessorKey: 'createdAt',
      header: 'Дата создания',
      size: 130,
      cell: ({ row }) => <span className="text-xs md:text-sm text-muted-foreground">{new Date(row.original.createdAt).toLocaleDateString('ru-RU')}</span>,
    },
    {
      id: 'actions',
      header: () => <div className="pr-1 text-right">Действие</div>,
      size: createInBodyAction ? 112 : 78,
      cell: ({ row }) => {
        return (
          <div className="flex items-center justify-end gap-1">
            {createInBodyAction && row.index === 0 ? createInBodyAction : null}

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  size="icon-xs"
                  title="Удалить смету"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Вы уверены, что хотите удалить смету?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Смета "{row.original.name}" будет удалена. Это действие можно отменить только через администратора.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Отмена</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={async () => {
                      await deleteEstimate({
                        estimateId: row.original.id,
                        estimateName: row.original.name,
                        setRows,
                      });
                    }}
                  >
                    Удалить
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        );
      },
    },
  ], [createInBodyAction, deleteEstimate, projectSlug, updateEstimateStatus]);

  return (
    <DataTable
      columns={columns}
      data={rows}
      filterColumn={showSearch ? 'name' : undefined}
      filterPlaceholder={showSearch ? 'Поиск...' : undefined}
      height={height}
      showFilter={showSearch}
      tableMinWidth={tableMinWidth}
      tableContainerClassName={tableContainerClassName}
      actions={actions}
      emptyState={emptyState}
    />
  );
}
