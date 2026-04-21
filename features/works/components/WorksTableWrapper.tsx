import * as React from "react";

import {
  CatalogTableAdapter,
  CatalogTableActions,
  CatalogFeatureTableWrapper,
} from "@/features/guide-catalog";
import { columns } from "./columns";
import { WorkRow } from "@/shared/types/domain/work-row";

interface WorksTableWrapperProps {
  data: WorkRow[];
  isAiMode: boolean;
  isSearching: boolean;
  loadingMore: boolean;
  searchTerm: string;
  onSearch: (query: string) => void;
  onAiModeChange: (val: boolean) => void;
  onSearchValueChange: (val: string) => void;
  onEndReached?: () => void;
  actions?: React.ReactNode;
  tableActions: CatalogTableActions<WorkRow>;
}

const worksTableAdapter: CatalogTableAdapter<WorkRow> = {
  columns,
  emptyState: {
    title: "Справочник работ пуст",
    description: "Добавьте первую работу или импортируйте базу работ из файла",
    addLabel: "Добавить работу",
  },
  filterPlaceholder: "Поиск...",
};

export function WorksTableWrapper({
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
}: WorksTableWrapperProps) {
  return (
    <CatalogFeatureTableWrapper
      adapter={worksTableAdapter}
      data={data}
      isAiMode={isAiMode}
      isSearching={isSearching}
      loadingMore={loadingMore}
      searchTerm={searchTerm}
      onSearch={onSearch}
      onAiModeChange={onAiModeChange}
      onSearchValueChange={onSearchValueChange}
      onEndReached={onEndReached}
      actions={actions}
      tableActions={tableActions}
    />
  );
}
