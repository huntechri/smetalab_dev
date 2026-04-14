'use client';

import * as React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { MaterialSupplierRow } from '@/shared/types/domain/material-supplier-row';
import { TableMeta } from '@/shared/ui/data-table';
import { Button } from '@/shared/ui/button';
import { Pencil, Trash, Settings } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';

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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-7 w-7 p-0 md:h-8 md:w-8" aria-label="Открыть меню действий">
                <span className="sr-only">Открыть меню действий</span>
                <Settings className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-40">
              <DropdownMenuLabel className="text-[12px]">Действия</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => meta?.onEdit?.(row.original)} className="text-[12px] py-1.5">
                <Pencil className="mr-2 h-4 w-4" />
                Редактировать
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => meta?.onDelete?.(row.original)}
                className="text-destructive text-[12px] py-1.5"
              >
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
