import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Plus, FilePlus } from "lucide-react";

import { DataTable } from "@/shared/ui/data-table";
import { Button } from "@/components/ui/button";
import { TableEmptyState } from "@/shared/ui/table-empty-state";
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
}: CatalogTableWrapperProps<TData, TValue>) {
  const [tableHeight, setTableHeight] = React.useState("720px");

  React.useEffect(() => {
    const updateHeight = () => {
      setTableHeight(window.innerWidth < 768 ? "400px" : "720px");
    };

    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, []);

  return (
    <DataTable
      columns={columns}
      data={data}
      height={tableHeight}
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
              variant="default"
              className="h-8 rounded-[7.6px] px-6 font-medium"
              onClick={() => tableActions.onInsertRequest()}
            >
              <Plus className="size-3.5 mr-2" />
              {emptyState.addLabel}
            </Button>
          }
        />
      }
      showAiSearch
      onSearch={onSearch}
      isAiMode={isAiMode}
      onAiModeChange={onAiModeChange}
      isSearching={isSearching}
      loadingMore={loadingMore}
      externalSearchValue={searchTerm}
      onSearchValueChange={onSearchValueChange}
      onEndReached={onEndReached}
      actions={actions}
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
