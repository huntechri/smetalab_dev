'use client';

import * as React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { MaterialSupplierRow } from '@/shared/types/domain/material-supplier-row';
import { TableMeta } from '@repo/ui';
import { Button } from '@repo/ui';
import { Pencil, Trash, Settings } from 'lucide-react';
import { ActionMenu } from '@repo/ui';

export const columns: ColumnDef<MaterialSupplierRow>[] = [
  {
    accessorKey: 'name',
    header: 'Наименование',
    cell: ({ row }) => (
      <div className="font-normal flex items-center gap-2 text-[12px] min-w-0" title={row.getValue('name') as string}>
        <svg className="size-2.5 shrink-0" viewBox="0 0 10 10" aria-hidden="true">
          <circle cx="5" cy="5" r="5" fill={row.original.color} />
        </svg>
        <span className="truncate">{row.getValue('name')}</span>
      </div>
    ),
  },
  {
    accessorKey: 'legalStatus',
    header: 'Статус',
    cell: ({ row }) => {
      const status = row.getValue('legalStatus') as string;
      const map: Record<string, string> = {
        individual: 'Физ. лицо',
        company: 'Юр. лицо',
      };
      return <span className="text-muted-foreground text-[12px]">{map[status] || status}</span>;
    },
  },
  {
    accessorKey: 'inn',
    header: 'ИНН',
    cell: ({ row }) => <span className="text-[12px]">{row.getValue('inn') || '—'}</span>,
  },
  {
    accessorKey: 'phone',
    header: 'Телефон',
    cell: ({ row }) => <span className="text-[12px]">{row.getValue('phone') || '—'}</span>,
  },
  {
    accessorKey: 'email',
    header: 'Email',
    cell: ({ row }) => <span className="text-[12px]">{row.getValue('email') || '—'}</span>,
  },
  {
    id: 'actions',
    header: () => <div className="text-right pr-4 text-[12px]">Действия</div>,
    cell: ({ row, table }) => {
      const meta = table.options.meta as TableMeta<MaterialSupplierRow> | undefined;

      return (
        <div className="text-right pr-2">
          <ActionMenu
            ariaLabel="Открыть меню действий"
            trigger={
              <Button variant="ghost" size="icon-sm" aria-label="Открыть меню действий">
                <span className="sr-only">Открыть меню действий</span>
                <Settings className="h-4 w-4" />
              </Button>
            }
            items={[
              {
                label: 'Редактировать',
                icon: <Pencil className="h-4 w-4" />,
                onClick: () => meta?.onEdit?.(row.original),
              },
              {
                label: 'Удалить',
                icon: <Trash className="h-4 w-4" />,
                variant: 'destructive',
                onClick: () => meta?.onDelete?.(row.original),
              },
            ]}
          />
        </div>
      );
    },
  },
];
