'use client';

import * as React from 'react';
import type { ColumnDef } from '@tanstack/react-table';

import { DataTable } from '@/shared/ui/data-table';
import type { DataTableProps } from '@/shared/ui/data-table';
import type { TableMeta } from '@/shared/ui/data-table';

type DataTableShellForwardProps<TData, TValue> = Partial<
  Omit<
    DataTableProps<TData, TValue>,
    | 'columns'
    | 'data'
    | 'height'
    | 'className'
    | 'filterColumn'
    | 'filterPlaceholder'
    | 'onSearch'
    | 'isSearching'
    | 'externalSearchValue'
    | 'onSearchValueChange'
    | 'onEndReached'
    | 'emptyState'
    | 'actions'
    | 'meta'
  >
>;

interface DataTableShellProps<TData, TValue> {
  srTitle?: string;
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  desktopHeight?: string;
  mobileHeight?: string;
  className?: string;
  filterColumn?: string;
  filterPlaceholder?: string;
  onSearch?: (query: string) => void;
  isSearching?: boolean;
  externalSearchValue?: string;
  onSearchValueChange?: (value: string) => void;
  onEndReached?: () => void;
  emptyState?: React.ReactNode;
  actions?: React.ReactNode;
  meta?: TableMeta<TData>;
  dataTableProps?: DataTableShellForwardProps<TData, TValue>;
}

function useResponsiveTableHeight(desktopHeight: string, mobileHeight: string) {
  const [tableHeight, setTableHeight] = React.useState(desktopHeight);

  React.useEffect(() => {
    const updateHeight = () => {
      setTableHeight(window.innerWidth < 768 ? mobileHeight : desktopHeight);
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, [desktopHeight, mobileHeight]);

  return tableHeight;
}

export function DataTableShell<TData, TValue>({
  srTitle,
  columns,
  data,
  desktopHeight = '720px',
  mobileHeight = '400px',
  className,
  filterColumn,
  filterPlaceholder,
  onSearch,
  isSearching,
  externalSearchValue,
  onSearchValueChange,
  onEndReached,
  emptyState,
  actions,
  meta,
  dataTableProps,
}: DataTableShellProps<TData, TValue>) {
  const tableHeight = useResponsiveTableHeight(desktopHeight, mobileHeight);

  return (
    <>
      {srTitle ? <h1 className="sr-only">{srTitle}</h1> : null}
      <DataTable
        columns={columns}
        data={data}
        height={tableHeight}
        className={className}
        filterColumn={filterColumn}
        filterPlaceholder={filterPlaceholder}
        onSearch={onSearch}
        isSearching={isSearching}
        externalSearchValue={externalSearchValue}
        onSearchValueChange={onSearchValueChange}
        onEndReached={onEndReached}
        emptyState={emptyState}
        actions={actions}
        meta={meta}
        {...dataTableProps}
      />
    </>
  );
}
