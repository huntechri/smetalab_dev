import { Button } from '@/shared/ui/button';
import { Upload, Download, Trash2, Loader2 } from 'lucide-react';
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

interface WorksToolbarProps {
    isImporting: boolean;
    isExporting: boolean;
    isDeletingAll: boolean;
    hasData: boolean;
    handleImportClick: () => void;
    handleExport: () => void;
    handleDeleteAll: () => void;
}

export function WorksToolbar({
    isImporting,
    isExporting,
    isDeletingAll,
    hasData,
    handleImportClick,
    handleExport,
    handleDeleteAll,
}: WorksToolbarProps) {
    const isActionDisabled = isDeletingAll || !hasData;

    return (
        <>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="outline" className="flex-1 sm:flex-none h-8 text-xs md:text-sm font-semibold tracking-tight transition-all active:scale-95 shadow-xs" onClick={handleImportClick} disabled={isImporting}>
                        {isImporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                        <span className="inline">Импорт</span>
                    </Button>
                </TooltipTrigger>
                <TooltipContent><p>Загрузить данные из файла</p></TooltipContent>
            </Tooltip>

            <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="outline" className="flex-1 sm:flex-none h-8 text-xs md:text-sm font-semibold tracking-tight transition-all active:scale-95 shadow-xs" onClick={handleExport} disabled={isExporting}>
                        {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                        <span className="inline">Экспорт</span>
                    </Button>
                </TooltipTrigger>
                <TooltipContent><p>Выгрузить данные в файл</p></TooltipContent>
            </Tooltip>

            <AlertDialog>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <span tabIndex={isActionDisabled ? 0 : -1} className="inline-block outline-none">
                            <AlertDialogTrigger asChild>
                                <Button
                                    variant="destructive"
                                    className={`flex-1 sm:flex-none h-8 text-xs md:text-sm font-semibold tracking-tight transition-all active:scale-95 shadow-xs ${isActionDisabled ? 'pointer-events-none' : ''}`}
                                    disabled={isActionDisabled}
                                >
                                    {isDeletingAll ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                                    <span className="hidden sm:inline">Удалить всё</span>
                                </Button>
                            </AlertDialogTrigger>
                        </span>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>{!hasData ? "Нет данных для удаления" : "Удалить все работы"}</p>
                    </TooltipContent>
                </Tooltip>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Вы уверены?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Это действие необратимо. Весь справочник работ для вашей команды будет полностью удален.
                        </AlertDialogDescription>
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
