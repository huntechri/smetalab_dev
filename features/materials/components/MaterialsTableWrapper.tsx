import * as React from "react";

import {
  CatalogTableAdapter,
  CatalogTableActions,
  CatalogTableWrapper,
} from "@/features/guide-catalog";
import { columns } from "./columns";
import { MaterialRow } from "@/shared/types/domain/material-row";

interface MaterialsTableWrapperProps {
  data: MaterialRow[];
  isAiMode: boolean;
  isSearching: boolean;
  loadingMore: boolean;
  searchTerm: string;
  onSearch: (query: string) => void;
  onAiModeChange: (val: boolean) => void;
  onSearchValueChange: (val: string) => void;
  onEndReached?: () => void;
  actions?: React.ReactNode;
  tableActions: CatalogTableActions<MaterialRow>;
}

const materialsTableAdapter: CatalogTableAdapter<MaterialRow> = {
  columns,
  emptyState: {
    title: "Справочник материалов пуст",
    description: "Добавьте первый материал или импортируйте базу из файла",
    addLabel: "Добавить материал",
  },
  filterPlaceholder: "Поиск...",
};

export function MaterialsTableWrapper({
  data,
  isAiMode,
  isSearching,
  loadingMore,
  searchTerm,
  onSearch,
  onAiModeChange,
  onSearchValueChange,
  onEndReached,
  actions,
  tableActions,
}: MaterialsTableWrapperProps) {
  return (
    <CatalogTableWrapper
      columns={materialsTableAdapter.columns}
      data={data}
      isAiMode={isAiMode}
      isSearching={isSearching}
      loadingMore={loadingMore}
      searchTerm={searchTerm}
      onSearch={onSearch}
      onAiModeChange={onAiModeChange}
      onSearchValueChange={onSearchValueChange}
      onEndReached={onEndReached}
      filterPlaceholder={materialsTableAdapter.filterPlaceholder}
      actions={actions}
      tableActions={tableActions}
      emptyState={materialsTableAdapter.emptyState}
    />
  );
}
