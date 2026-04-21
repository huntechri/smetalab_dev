import type { ReactNode } from "react";

import { CatalogTableWrapper } from "@/features/guide-catalog/components/CatalogTableWrapper";
import {
  CatalogTableAdapter,
  CatalogTableActions,
} from "@/features/guide-catalog/types";

interface CatalogFeatureTableWrapperProps<TData, TValue = unknown> {
  adapter: CatalogTableAdapter<TData, TValue>;
  data: TData[];
  isAiMode: boolean;
  isSearching: boolean;
  loadingMore: boolean;
  searchTerm: string;
  onSearch: (query: string) => void;
  onAiModeChange: (val: boolean) => void;
  onSearchValueChange: (val: string) => void;
  onEndReached?: () => void;
  actions?: ReactNode;
  tableActions: CatalogTableActions<TData>;
}

export function CatalogFeatureTableWrapper<TData, TValue = unknown>({
  adapter,
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
}: CatalogFeatureTableWrapperProps<TData, TValue>) {
  return (
    <CatalogTableWrapper
      columns={adapter.columns}
      data={data}
      isAiMode={isAiMode}
      isSearching={isSearching}
      loadingMore={loadingMore}
      searchTerm={searchTerm}
      onSearch={onSearch}
      onAiModeChange={onAiModeChange}
      onSearchValueChange={onSearchValueChange}
      onEndReached={onEndReached}
      filterPlaceholder={adapter.filterPlaceholder}
      actions={actions}
      tableActions={tableActions}
      emptyState={adapter.emptyState}
    />
  );
}
