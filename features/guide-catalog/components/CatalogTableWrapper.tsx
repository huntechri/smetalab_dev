import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Plus, FilePlus } from "lucide-react";

import { Button } from "@/shared/ui/button";
import { TableEmptyState } from "@/shared/ui/table-empty-state";
import { DataTableShell } from "@/shared/ui/shells/data-table-shell";
import {
  CatalogEmptyStateConfig,
  CatalogTableActions,
} from "@/features/guide-catalog/types";

interface CatalogTableWrapperProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  isAiMode: boolean;
  isSearching: boolean;
  loadingMore: boolean;
  searchTerm: string;
  onSearch: (query: string) => void;
  onAiModeChange: (val: boolean) => void;
  onSearchValueChange: (val: string) => void;
  onEndReached?: () => void;
  filterPlaceholder?: string;
  actions?: React.ReactNode;
  tableActions: CatalogTableActions<TData>;
  emptyState: CatalogEmptyStateConfig;
  enableVirtualization?: boolean;
}

export function CatalogTableWrapper<TData, TValue>({
  columns,
  data,
  isAiMode,
  isSearching,
  loadingMore,
  searchTerm,
  onSearch,
  onAiModeChange,
  onSearchValueChange,
  onEndReached,
  filterPlaceholder = "Поиск...",
  actions,
  tableActions,
  emptyState,
  enableVirtualization = false,
}: CatalogTableWrapperProps<TData, TValue>) {
  return (
    <DataTableShell
      columns={columns}
      data={data}
      desktopHeight="720px"
      mobileHeight="400px"
      className="text-[12px]"
      filterColumn="name"
      filterPlaceholder={filterPlaceholder}
      emptyState={
        <TableEmptyState
          title={emptyState.title}
          description={emptyState.description}
          icon={emptyState.icon ?? FilePlus}
          action={
            <Button
              variant="outline"
              onClick={() => tableActions.onInsertRequest()}
            >
              <Plus className="size-3.5 mr-2" />
              {emptyState.addLabel}
            </Button>
          }
        />
      }
      onSearch={onSearch}
      isSearching={isSearching}
      externalSearchValue={searchTerm}
      onSearchValueChange={onSearchValueChange}
      onEndReached={onEndReached}
      actions={actions}
      dataTableProps={{
        showAiSearch: true,
        isAiMode,
        onAiModeChange,
        loadingMore,
        enableVirtualization,
      }}
      meta={{
        onInsertRequest: tableActions.onInsertRequest,
        onCancelInsert: tableActions.onCancelInsert,
        onSaveInsert: tableActions.onSaveInsert,
        updatePlaceholderRow: tableActions.updatePlaceholderRow,
        onReorder: tableActions.onReorder,
        setEditingRow: tableActions.setEditingRow,
        setDeletingRow: tableActions.setDeletingRow,
      }}
    />
  );
}
