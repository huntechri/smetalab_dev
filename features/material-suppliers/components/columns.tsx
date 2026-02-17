'use client';

import * as React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { MaterialSupplierRow } from '@/types/material-supplier-row';
import { TableMeta } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Pencil, Trash, Settings } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const columns: ColumnDef<MaterialSupplierRow>[] = [
  {
    accessorKey: 'name',
    header: 'Наименование',
    cell: ({ row }) => (
      <div className="font-medium flex items-center gap-2">
        <span className="size-2.5 rounded-full" style={{ backgroundColor: row.original.color }} aria-hidden="true" />
        {row.getValue('name')}
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
      return <span className="text-muted-foreground">{map[status] || status}</span>;
    },
  },
  {
    accessorKey: 'inn',
    header: 'ИНН',
    cell: ({ row }) => row.getValue('inn') || '—',
  },
  {
    accessorKey: 'phone',
    header: 'Телефон',
    cell: ({ row }) => row.getValue('phone') || '—',
  },
  {
    accessorKey: 'email',
    header: 'Email',
    cell: ({ row }) => row.getValue('email') || '—',
  },
  {
    id: 'actions',
    header: () => <div className="text-right pr-4">Действия</div>,
    cell: ({ row, table }) => {
      const meta = table.options.meta as TableMeta<MaterialSupplierRow> | undefined;

      return (
        <div className="text-right pr-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0" aria-label="Открыть меню действий">
                <span className="sr-only">Открыть меню действий</span>
                <Settings className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Действия</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => meta?.onEdit?.(row.original)}>
                <Pencil className="mr-2 h-4 w-4" />
                Редактировать
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => meta?.onDelete?.(row.original)} className="text-destructive">
                <Trash className="mr-2 h-4 w-4" />
                Удалить
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];
