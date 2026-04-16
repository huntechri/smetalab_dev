import type { ColumnDef } from '@tanstack/react-table';

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
}
