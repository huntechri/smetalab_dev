'use client';

import * as React from 'react';
import { FilePlus, Loader2, Plus } from 'lucide-react';
import type { ColumnDef } from '@tanstack/react-table';

import { DataTable } from '@/shared/ui/data-table';
import type { DataTableProps } from '@/shared/ui/data-table';
import type { TableMeta } from '@/shared/ui/data-table';
import { Button } from '@/shared/ui/button';
import { TableEmptyState } from '@/shared/ui/table-empty-state';

/**
 * Metadata for a directory-style list screen.
 */
export interface DirectoryListAdapter<TData, TValue = unknown> {
  srTitle: string;
  columns: ColumnDef<TData, TValue>[];
  addLabel: string;
  addButtonLabel?: string;
  emptyTitle: string;
  emptyDescription: string;
  filterColumn?: string;
  filterPlaceholder?: string;
  desktopHeight?: string;
  mobileHeight?: string;
}

interface DirectoryListScreenProps<TData, TValue> {
  adapter: DirectoryListAdapter<TData, TValue>;
  rows: TData[];
  searchTerm: string;
  onSearchValueChange: (value: string) => void;
  onSearch?: (query: string) => void;
  isSearching: boolean;
  canLoadMore: boolean;
  isLoadingMore: boolean;
  onLoadMore: () => void;
  onCreate: () => void;
  onEdit: (row: TData) => void;
  onDelete: (row: TData) => void;
}

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
  filterColumn = 'name',
  filterPlaceholder = 'Поиск...',
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

/**
 * A generic shell for directory-style list screens using DataTable.
 */
export function DirectoryListScreen<TData, TValue>({
  adapter,
  rows,
  searchTerm,
  onSearchValueChange,
  onSearch,
  isSearching,
  canLoadMore,
  isLoadingMore,
  onLoadMore,
  onCreate,
  onEdit,
  onDelete,
}: DirectoryListScreenProps<TData, TValue>) {
  const {
    srTitle,
    columns,
    addLabel,
    addButtonLabel = 'Добавить',
    emptyTitle,
    emptyDescription,
    filterColumn = 'name',
    filterPlaceholder = 'Поиск по названию...',
    desktopHeight = '720px',
    mobileHeight = '400px',
  } = adapter;

  return (
    <DataTableShell
      srTitle={srTitle}
      columns={columns}
      data={rows}
      desktopHeight={desktopHeight}
      mobileHeight={mobileHeight}
      className="text-[12px]"
      filterColumn={filterColumn}
      filterPlaceholder={filterPlaceholder}
      onSearch={onSearch}
      isSearching={isSearching || isLoadingMore}
      externalSearchValue={searchTerm}
      onSearchValueChange={onSearchValueChange}
      onEndReached={canLoadMore ? onLoadMore : undefined}
      emptyState={
        <TableEmptyState
          title={emptyTitle}
          description={emptyDescription}
          icon={FilePlus}
          action={
            <Button
              variant="primary"
              onClick={onCreate}
            >
              <Plus className="size-3.5 mr-2" />
              {addLabel}
            </Button>
          }
        />
      }
      actions={
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {canLoadMore ? (
            <Button
              variant="outline"
              onClick={onLoadMore}
              disabled={isLoadingMore}
            >
              {isLoadingMore ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              <span className="hidden sm:inline">Загрузить ещё</span>
              <span className="sm:hidden">Ещё</span>
            </Button>
          ) : null}
          <Button
            onClick={onCreate}
            variant="primary"
            aria-label={addLabel}
          >
            <Plus className="h-4 w-4 mr-1" />
            <span>{addButtonLabel}</span>
          </Button>
        </div>
      }
      meta={{
        onEdit,
        onDelete,
      }}
    />
  );
}
