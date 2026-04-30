'use client';

import { FilePlus, Loader2, Plus } from 'lucide-react';
import type { ColumnDef } from '@tanstack/react-table';

import { Button } from '@/shared/ui/button';
import { DataTableShell } from '@/shared/ui/shells/data-table-shell';
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
