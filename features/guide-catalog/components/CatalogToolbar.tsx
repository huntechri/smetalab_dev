import * as React from "react";
import { Upload, Download, Trash2, Loader2, Filter } from "lucide-react";

import { Button } from "@/shared/ui/button";
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
            <Button variant="outline" size="icon" className="mr-1 h-9 transition-all active:scale-95">
              <Filter className="h-4 w-4" />
            </Button>
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
        <Button
          variant="outline"
          size="icon"
          className={cn(
            "mr-1 h-9 transition-all active:scale-95 duration-200",
            showSidebar &&
              "bg-secondary text-secondary-foreground ring-1 ring-border/50"
          )}
          onClick={() => setShowSidebar?.(!showSidebar)}
        >
          <Filter
            className={cn(
              "h-4 w-4 transition-transform",
              showSidebar && "scale-110"
            )}
          />
        </Button>
      </div>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            className="flex-1 sm:flex-none h-9 text-xs md:text-sm font-semibold tracking-tight shadow-sm transition-all active:scale-95 gap-1.5"
            onClick={onImportClick}
            disabled={isImporting}
          >
            {isImporting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Upload className="mr-2 h-4 w-4" />
            )}
            <span className="inline">Импорт</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{importTooltip}</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            className="flex-1 sm:flex-none h-9 text-xs md:text-sm font-semibold tracking-tight shadow-sm transition-all active:scale-95 gap-1.5"
            onClick={onExport}
            disabled={isExporting}
          >
            {isExporting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            <span className="inline">Экспорт</span>
          </Button>
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
                <Button
                  variant="destructive"
                  className={cn(
                    "flex-1 sm:flex-none h-9 px-2 sm:px-4 text-xs md:text-sm font-semibold tracking-tight shadow-sm transition-all active:scale-95 gap-1.5",
                    isActionDisabled ? "pointer-events-none" : ""
                  )}
                  disabled={isActionDisabled}
                >
                  {isDeletingAll ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4 sm:mr-2" />
                  )}
                  <span className="hidden sm:inline">Удалить всё</span>
                </Button>
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

