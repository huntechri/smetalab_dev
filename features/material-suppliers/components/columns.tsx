'use client';

import * as React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { MaterialSupplierRow } from '@/shared/types/domain/material-supplier-row';
import { TableMeta } from '@/shared/ui/data-table';
import {
  DirectoryActionsHeader,
  DirectoryNameCell,
  DirectoryRowActionMenu,
  DirectoryTextCell,
} from '@/shared/ui/cells/directory-table-cells';

export const columns: ColumnDef<MaterialSupplierRow>[] = [
  {
    accessorKey: 'name',
    header: 'Наименование',
    cell: ({ row }) => (
      <DirectoryNameCell title={row.getValue('name') as string} markerColor={row.original.color}>
        {row.getValue('name')}
      </DirectoryNameCell>
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
      return <DirectoryTextCell muted>{map[status] || status}</DirectoryTextCell>;
    },
  },
  {
    accessorKey: 'inn',
    header: 'ИНН',
    cell: ({ row }) => <DirectoryTextCell>{row.getValue('inn')}</DirectoryTextCell>,
  },
  {
    accessorKey: 'phone',
    header: 'Телефон',
    cell: ({ row }) => <DirectoryTextCell>{row.getValue('phone')}</DirectoryTextCell>,
  },
  {
    accessorKey: 'email',
    header: 'Email',
    cell: ({ row }) => <DirectoryTextCell>{row.getValue('email')}</DirectoryTextCell>,
  },
  {
    id: 'actions',
    header: () => <DirectoryActionsHeader />,
    cell: ({ row, table }) => {
      const meta = table.options.meta as TableMeta<MaterialSupplierRow> | undefined;

      return (
        <DirectoryRowActionMenu
          row={row.original}
          onEdit={meta?.onEdit}
          onDelete={meta?.onDelete}
        />
      );
    },
  },
];
