import * as React from "react";
import { Upload, Download, Trash2, Filter } from "lucide-react";

import { ToolbarButton } from "@/shared/ui/toolbar-button";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/shared/ui/alert-dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/ui/tooltip";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/shared/ui/sheet";
import {
  CatalogFiltersUpdater,
  CatalogSidebarProps,
} from "@/features/guide-catalog/types";

interface CatalogToolbarProps<TFilters> {
  isImporting: boolean;
  isExporting: boolean;
  isDeletingAll: boolean;
  hasData: boolean;
  onImportClick: () => void;
  onExport: () => void;
  onDeleteAll: () => void;
  filters?: TFilters;
  setFilters?: (next: CatalogFiltersUpdater<TFilters>) => void;
  SidebarComponent?: React.ComponentType<CatalogSidebarProps<TFilters>>;
  showSidebar?: boolean;
  setShowSidebar?: (show: boolean) => void;
  importTooltip: string;
  exportTooltip: string;
  deleteTooltip: string;
  deleteDescription: string;
}

export function CatalogToolbar<TFilters>({
  isImporting,
  isExporting,
  isDeletingAll,
  hasData,
  onImportClick,
  onExport,
  onDeleteAll,
  filters,
  setFilters,
  SidebarComponent,
  showSidebar,
  setShowSidebar,
  importTooltip,
  exportTooltip,
  deleteTooltip,
  deleteDescription,
}: CatalogToolbarProps<TFilters>) {
  const isActionDisabled = isDeletingAll || !hasData;

  return (
    <>
      <div className="lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <ToolbarButton variant="outline" size="icon-xs">
              <Filter className="h-4 w-4" />
            </ToolbarButton>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] p-6 focus-visible:ring-0">
            <SheetHeader className="mb-4">
              <SheetTitle className="text-[16px] font-bold uppercase tracking-wider text-left">
                Параметры
              </SheetTitle>
            </SheetHeader>
            <div className="h-full">
              {SidebarComponent && filters && setFilters ? (
                <SidebarComponent
                  filters={filters}
                  setFilters={setFilters}
                  isMobile
                />
              ) : null}
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="hidden lg:block">
        <ToolbarButton
          variant="outline"
          size="icon-xs"
          onClick={() => setShowSidebar?.(!showSidebar)}
        >
          <Filter
            className={cn(
              "h-4 w-4 transition-transform",
              showSidebar && "scale-110"
            )}
          />
        </ToolbarButton>
      </div>

      <Tooltip>
        <TooltipTrigger asChild>
          <ToolbarButton
            variant="outline"
            onClick={onImportClick}
            loading={isImporting}
            iconLeft={<Upload />}
          >
            Импорт
          </ToolbarButton>
        </TooltipTrigger>
        <TooltipContent>
          <p>{importTooltip}</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <ToolbarButton
            variant="outline"
            onClick={onExport}
            loading={isExporting}
            iconLeft={<Download />}
          >
            Экспорт
          </ToolbarButton>
        </TooltipTrigger>
        <TooltipContent>
          <p>{exportTooltip}</p>
        </TooltipContent>
      </Tooltip>

      <AlertDialog>
        <Tooltip>
          <TooltipTrigger asChild>
            <span
              tabIndex={isActionDisabled ? 0 : -1}
              className="inline-block outline-none"
            >
              <AlertDialogTrigger asChild>
                <ToolbarButton
                  variant="destructive"
                  disabled={isActionDisabled}
                  loading={isDeletingAll}
                  iconLeft={<Trash2 />}
                  labelClassName="hidden sm:inline"
                >
                  Удалить всё
                </ToolbarButton>
              </AlertDialogTrigger>
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p>{!hasData ? "Нет данных для удаления" : deleteTooltip}</p>
          </TooltipContent>
        </Tooltip>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Вы уверены?</AlertDialogTitle>
            <AlertDialogDescription>{deleteDescription}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={onDeleteAll}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Удалить всё
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

