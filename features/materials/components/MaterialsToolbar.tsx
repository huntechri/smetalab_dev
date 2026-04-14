import { CatalogToolbar, CatalogFiltersUpdater } from "@/features/guide-catalog";
import { MaterialsSidebar } from "./MaterialsSidebar";

type MaterialsFilters = {
  categoryLv1?: string;
  categoryLv2?: string;
  categoryLv3?: string;
  categoryLv4?: string;
};

interface MaterialsToolbarProps {
  isImporting: boolean;
  isExporting: boolean;
  isDeletingAll: boolean;
  hasData: boolean;
  handleImportClick: () => void;
  handleExport: () => void;
  handleDeleteAll: () => void;
  filters?: MaterialsFilters;
  setFilters?: (next: CatalogFiltersUpdater<MaterialsFilters>) => void;
  showSidebar?: boolean;
  setShowSidebar?: (show: boolean) => void;
}

export function MaterialsToolbar({
  isImporting,
  isExporting,
  isDeletingAll,
  hasData,
  handleImportClick,
  handleExport,
  handleDeleteAll,
  filters,
  setFilters,
  showSidebar,
  setShowSidebar,
}: MaterialsToolbarProps) {
  return (
    <CatalogToolbar
      isImporting={isImporting}
      isExporting={isExporting}
      isDeletingAll={isDeletingAll}
      hasData={hasData}
      onImportClick={handleImportClick}
      onExport={handleExport}
      onDeleteAll={handleDeleteAll}
      filters={filters}
      setFilters={setFilters}
      SidebarComponent={MaterialsSidebar}
      showSidebar={showSidebar}
      setShowSidebar={setShowSidebar}
      importTooltip="Загрузить данные"
      exportTooltip="Выгрузить данные"
      deleteTooltip="Удалить все материалы"
      deleteDescription="Все материалы будут удалены."
    />
  );
}

