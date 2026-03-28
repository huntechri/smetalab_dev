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
    const buttonClassName = "flex-1 sm:flex-none h-9 bg-transparent hover:bg-[hsl(240_4.7%_96%_/_0.82)] text-[14px] leading-[21px] font-medium font-[Manrope] tracking-tight transition-all active:scale-95 shadow-none rounded-[7.6px] border border-[hsl(240_5.9%_90%_/_0.7)] text-[hsl(240_10%_3.9%)] px-2 gap-1.5 justify-center";

    return (
        <>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="outline" className={buttonClassName} onClick={handleImportClick} disabled={isImporting}>
                        {isImporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                        <span className="inline">Импорт</span>
                    </Button>
                </TooltipTrigger>
                <TooltipContent><p>Загрузить данные</p></TooltipContent>
            </Tooltip>

            <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="outline" className={buttonClassName} onClick={handleExport} disabled={isExporting}>
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
                                    className={`${buttonClassName} ${isActionDisabled ? 'pointer-events-none' : ''}`}
                                    disabled={isActionDisabled}
                                >
                                    {isDeletingAll ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
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
