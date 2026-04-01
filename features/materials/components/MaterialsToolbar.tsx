import { Button } from '@/shared/ui/button';
import { cn } from '@/lib/utils';
import { Upload, Download, Trash2, Loader2, Filter } from 'lucide-react';
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
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/shared/ui/tooltip";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/shared/ui/sheet";
import { MaterialsSidebar } from './MaterialsSidebar';

interface MaterialsToolbarProps {
    isImporting: boolean;
    isExporting: boolean;
    isDeletingAll: boolean;
    hasData: boolean;
    handleImportClick: () => void;
    handleExport: () => void;
    handleDeleteAll: () => void;
    filters?: { 
        categoryLv1?: string;
        categoryLv2?: string;
        categoryLv3?: string;
        categoryLv4?: string;
    };
    setFilters?: (filters: any) => void;
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
    const isActionDisabled = isDeletingAll || !hasData;


    return (
        <>
            {/* Mobile Filter Button */}
            <div className="lg:hidden">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="standard" size="icon-sm" className="h-8 w-8 mr-1">
                            <Filter className="h-4 w-4" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-[300px] p-6 focus-visible:ring-0">
                        <SheetHeader className="mb-4">
                            <SheetTitle className="text-[16px] font-bold uppercase tracking-wider text-left">Параметры</SheetTitle>
                        </SheetHeader>
                        <div className="h-full">
                            {filters && setFilters && (
                                <MaterialsSidebar filters={filters} setFilters={setFilters} isMobile />
                            )}
                        </div>
                    </SheetContent>
                </Sheet>
            </div>

            {/* Desktop Toggle Sidebar Button */}
            <div className="hidden lg:block">
                <Button 
                    variant="standard" 
                    size="icon-sm" 
                    className={cn(
                        "h-8 w-8 mr-1 transition-all duration-200",
                        showSidebar && "bg-secondary text-secondary-foreground ring-1 ring-border/50"
                    )}
                    onClick={() => setShowSidebar?.(!showSidebar)}
                >
                    <Filter className={cn("h-4 w-4 transition-transform", showSidebar && "scale-110")} />
                </Button>
            </div>

            <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="standard" className="flex-1 sm:flex-none" onClick={handleImportClick} disabled={isImporting}>
                        {isImporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                        <span className="inline">Импорт</span>
                    </Button>
                </TooltipTrigger>
                <TooltipContent><p>Загрузить данные</p></TooltipContent>
            </Tooltip>

            <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="standard" className="flex-1 sm:flex-none" onClick={handleExport} disabled={isExporting}>
                        {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                        <span className="inline">Экспорт</span>
                    </Button>
                </TooltipTrigger>
                <TooltipContent><p>Выгрузить данные</p></TooltipContent>
            </Tooltip>

            <AlertDialog>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <span tabIndex={isActionDisabled ? 0 : -1} className="inline-block outline-none">
                            <AlertDialogTrigger asChild>
                                <Button
                                    variant="destructive"
                                    className={cn("flex-1 sm:flex-none h-8 rounded-[7.6px] px-2 sm:px-4 active:scale-95 shadow-none", isActionDisabled ? 'pointer-events-none' : '')}
                                    disabled={isActionDisabled}
                                >
                                    {isDeletingAll ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4 sm:mr-2" />}
                                    <span className="hidden sm:inline">Удалить всё</span>
                                </Button>
                            </AlertDialogTrigger>
                        </span>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>{!hasData ? "Нет данных для удаления" : "Удалить все материалы"}</p>
                    </TooltipContent>
                </Tooltip>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Вы уверены?</AlertDialogTitle>
                        <AlertDialogDescription>Все материалы будут удалены.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Отмена</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteAll} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Удалить всё</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
