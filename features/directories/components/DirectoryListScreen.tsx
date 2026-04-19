'use client';

import * as React from 'react';
import { FilePlus, Loader2, Plus } from 'lucide-react';

import { DataTable } from '@repo/ui';
import { Button } from '@repo/ui';
import { TableEmptyState } from '@repo/ui';
import type { DirectoryListAdapter } from '@/features/directories/types';

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
  } = adapter;

  const [tableHeight, setTableHeight] = React.useState(desktopHeight);

  React.useEffect(() => {
    const updateHeight = () => {
      setTableHeight(window.innerWidth < 768 ? '400px' : desktopHeight);
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, [desktopHeight]);

  return (
    <div className="space-y-2">
      <h1 className="sr-only">{srTitle}</h1>

      <DataTable
        columns={columns}
        data={rows}
        height={tableHeight}
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
    </div>
  );
}
