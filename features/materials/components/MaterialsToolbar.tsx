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

interface MaterialsToolbarProps {
    isImporting: boolean;
    isExporting: boolean;
    isDeletingAll: boolean;
    hasData: boolean;
    handleImportClick: () => void;
    handleExport: () => void;
    handleDeleteAll: () => void;
}

export function MaterialsToolbar({
    isImporting,
    isExporting,
    isDeletingAll,
    hasData,
    handleImportClick,
    handleExport,
    handleDeleteAll,
}: MaterialsToolbarProps) {
    const isActionDisabled = isDeletingAll || !hasData;

    return (
        <>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="outline" className="flex-1 sm:flex-none h-9 text-xs md:text-sm" onClick={handleImportClick} disabled={isImporting}>
                        {isImporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                        Импорт
                    </Button>
                </TooltipTrigger>
                <TooltipContent><p>Загрузить данные</p></TooltipContent>
            </Tooltip>

            <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="outline" className="flex-1 sm:flex-none h-9 text-xs md:text-sm" onClick={handleExport} disabled={isExporting}>
                        {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                        Экспорт
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
                                    className={`flex-1 sm:flex-none h-9 text-xs md:text-sm ${isActionDisabled ? 'pointer-events-none' : ''}`}
                                    disabled={isActionDisabled}
                                >
                                    {isDeletingAll ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                                    Удалить всё
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
                        <AlertDialogAction onClick={handleDeleteAll} className="bg-red-700 text-white hover:bg-red-800">Удалить всё</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
