import type { ColumnDef } from "@tanstack/react-table";
import type { LucideIcon } from "lucide-react";

export type CatalogFiltersUpdater<TFilters> =
  | TFilters
  | ((prev: TFilters) => TFilters);

export interface CatalogSidebarProps<TFilters> {
  filters: TFilters;
  setFilters: (next: CatalogFiltersUpdater<TFilters>) => void;
  className?: string;
  isMobile?: boolean;
}

export interface CatalogTableActions<TData> {
  onInsertRequest: (afterId?: string) => void;
  onCancelInsert: () => void;
  onSaveInsert: (id: string) => void;
  updatePlaceholderRow: (id: string, partial: Partial<TData>) => void;
  onReorder?: () => void;
  setEditingRow?: (row: TData | null) => void;
  setDeletingRow?: (row: TData | null) => void;
}

export interface CatalogEmptyStateConfig {
  title: string;
  description: string;
  addLabel: string;
  icon?: LucideIcon;
}

export interface CatalogTableAdapter<TData, TValue = unknown> {
  columns: ColumnDef<TData, TValue>[];
  emptyState: CatalogEmptyStateConfig;
  filterPlaceholder?: string;
}

export interface CatalogScreenAdapter {
  fileInputLabel: string;
  fileInputTitle: string;
  fileInputAccept?: string;
  overlayInsertTitle: string;
  overlayImportTitle: string;
  overlayImportDescription?: string;
}
