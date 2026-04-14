import { CatalogFiltersUpdater, CatalogToolbar } from "@/features/guide-catalog";
import { WorksSidebar } from "./WorksSidebar";

type WorksFilters = {
  category?: string;
  phase?: string;
};

interface WorksToolbarProps {
  isImporting: boolean;
  isExporting: boolean;
  isDeletingAll: boolean;
  hasData: boolean;
  handleImportClick: () => void;
  handleExport: () => void;
  handleDeleteAll: () => void;
  filters?: WorksFilters;
  setFilters?: (next: CatalogFiltersUpdater<WorksFilters>) => void;
  showSidebar?: boolean;
  setShowSidebar?: (show: boolean) => void;
}

export function WorksToolbar({
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
}: WorksToolbarProps) {
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
      SidebarComponent={WorksSidebar}
      showSidebar={showSidebar}
      setShowSidebar={setShowSidebar}
      importTooltip="Загрузить данные из файла"
      exportTooltip="Выгрузить данные в файл"
      deleteTooltip="Удалить все работы"
      deleteDescription="Это действие необратимо. Весь справочник работ для вашей команды будет полностью удален."
    />
  );
}

