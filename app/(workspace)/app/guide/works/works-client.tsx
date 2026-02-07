'use client';

import * as React from 'react';
import { useRef, useTransition, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, Download, Trash2, Loader2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { UnitSelect } from '@/components/unit-select';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "./columns";
import { importWorks, exportWorks, deleteAllWorks, reorderWorks, updateWork, deleteWork } from '@/app/actions/works';
import * as XLSX from 'xlsx';
import { useToast } from "@/components/ui/use-toast";
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
} from "@/components/ui/alert-dialog";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from '@/components/ui/badge';

import { WorkRow } from '@/types/work-row';
import { useWorksTable } from './hooks/useWorksTable';

interface WorksClientProps {
    initialData: WorkRow[];
    totalCount: number;
    tenantId: number;
}

import { useWorksSearch } from './hooks/useWorksSearch';

export function WorksClient({ initialData, totalCount, tenantId }: WorksClientProps) {
    const { toast } = useToast();
    const [isExporting, startExportTransition] = useTransition();
    const [isImporting, startImportTransition] = useTransition();
    const [isDeletingAll, startDeleteAllTransition] = useTransition();
    const [mounted, setMounted] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setMounted(true);
    }, []);


    const handleExport = () => {
        startExportTransition(async () => {
            const result = await exportWorks();
            if (result.success) {
                const worksheet = XLSX.utils.json_to_sheet(result.data);
                const workbook = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(workbook, worksheet, 'Works');
                XLSX.writeFile(workbook, 'works_export.xlsx');
                toast({
                    title: "Экспорт успешен",
                    description: "Данные работ были успешно экспортированы.",
                });
            } else {
                toast({
                    variant: "destructive",
                    title: "Ошибка экспорта",
                    description: result.message,
                });
            }
        });
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const formData = new FormData();
            formData.append('file', file);

            startImportTransition(async () => {
                const result = await importWorks(formData);
                if (result.success) {
                    toast({
                        title: "Импорт завершен",
                        description: result.message,
                    });
                } else {
                    toast({
                        variant: "destructive",
                        title: "Ошибка импорта",
                        description: result.message,
                    });
                }
            });
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleDeleteAll = () => {
        startDeleteAllTransition(async () => {
            const result = await deleteAllWorks();
            if (result.success) {
                toast({
                    title: "Справочник очищен",
                    description: result.message,
                });
                setData([]);
            } else {
                toast({
                    variant: "destructive",
                    title: "Ошибка при очистке",
                    description: result.message,
                });
            }
        });
    };



    const {
        data,
        setData,
        isInserting,
        onInsertRequest,
        onCancelInsert,
        updatePlaceholderRow,
        onSaveInsert
    } = useWorksTable(initialData, tenantId);

    const search = useWorksSearch(initialData, data, setData);

    useEffect(() => {
        setData(initialData);
    }, [initialData, setData]);


    // Sorting reset
    const [, startReorderTransition] = useTransition();

    const handleReorder = () => {
        startReorderTransition(async () => {
            const result = await reorderWorks();
            if (result.success) {
                toast({ title: "Сортировка сброшена", description: "Порядок записей успешно обновлен." });
            } else {
                toast({ variant: "destructive", title: "Ошибка", description: result.message });
            }
        });
    };

    const handleRowUpdate = async (id: string, data: Partial<WorkRow>) => {
        return await updateWork(id, {
            ...data,
            price: data.price ? Number(data.price) : undefined
        });
    };

    const handleRowDelete = async (id: string) => {
        return await deleteWork(id);
    };

    const renderEditFields = (data: WorkRow, onChange: (field: string, val: unknown) => void) => (
        <>
            <div className="grid grid-cols-1 sm:grid-cols-4 items-start sm:items-center gap-2 sm:gap-4">
                <Label htmlFor="name" className="sm:text-right text-xs text-muted-foreground sm:text-foreground">Название</Label>
                <Input
                    id="name"
                    value={data.name || ""}
                    onChange={(e) => onChange("name", e.target.value)}
                    className="sm:col-span-3 h-8 text-sm"
                    required
                />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 items-start sm:items-center gap-2 sm:gap-4">
                <Label htmlFor="unit" className="sm:text-right text-xs text-muted-foreground sm:text-foreground">Ед. изм.</Label>
                <div className="sm:col-span-3">
                    <UnitSelect
                        value={data.unit || ""}
                        onChange={(val) => onChange("unit", val)}
                    />
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 items-start sm:items-center gap-2 sm:gap-4">
                <Label htmlFor="price" className="sm:text-right text-xs text-muted-foreground sm:text-foreground">Цена</Label>
                <Input
                    id="price"
                    type="number"
                    value={data.price || ""}
                    onChange={(e) => onChange("price", e.target.value)}
                    className="sm:col-span-3 h-8 text-sm"
                    required
                />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="phase" className="text-right">Этап</Label>
                <Input
                    id="phase"
                    value={data.phase || ""}
                    onChange={(e) => onChange("phase", e.target.value)}
                    className="col-span-3 h-8 text-sm"
                />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right">Категория</Label>
                <Input
                    id="category"
                    value={data.category || ""}
                    onChange={(e) => onChange("category", e.target.value)}
                    className="col-span-3 h-8 text-sm"
                />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="subcategory" className="text-right">Подкатегория</Label>
                <Input
                    id="subcategory"
                    value={data.subcategory || ""}
                    onChange={(e) => onChange("subcategory", e.target.value)}
                    className="col-span-3 h-8 text-sm"
                />
            </div>
        </>
    );


    return (
        <div className="space-y-6">
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                aria-label="Загрузить файл"
            />
            <Breadcrumb className="px-1 md:px-0">
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/app">Главная</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage>Справочники</BreadcrumbPage>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage>Работы</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between px-1 md:px-0">
                <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-3">
                        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Работы</h1>
                        <Badge variant="outline" className="text-muted-foreground">{totalCount.toLocaleString('ru-RU')} записей</Badge>
                        {search.isAiSearching && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                    </div>
                    <p className="text-sm text-muted-foreground md:text-base">
                        Базовая стоимость работ.
                    </p>
                </div>
                <div className="hidden" aria-hidden="true" />
            </div>

            <div className="relative rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
                {(isImporting || isInserting) && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/50 backdrop-blur-[1px] rounded-2xl">
                        <div className="flex flex-col items-center gap-3 p-6 bg-card border shadow-xl rounded-xl animate-in fade-in zoom-in duration-200">
                            <Loader2 className="h-10 w-10 animate-spin text-primary" />
                            <div className="flex flex-col items-center gap-1">
                                <p className="text-sm font-semibold">
                                    {isInserting ? "Сохранение записи..." : "Идет импорт данных..."}
                                </p>
                                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Пожалуйста, подождите</p>
                            </div>
                        </div>
                    </div>
                )}
                <DataTable
                    columns={columns}
                    data={data}
                    height="600px"
                    filterColumn="name"
                    filterPlaceholder="Поиск по наименованию..."
                    showAiSearch={true}
                    onSearch={search.handleSearch}
                    isSearching={search.isAiSearching}
                    externalSearchValue={search.searchTerm}
                    onSearchValueChange={search.setSearchTerm}
                    onEndReached={search.loadMore}
                    onRowUpdate={handleRowUpdate}
                    onRowDelete={handleRowDelete}
                    editDialogFields={renderEditFields}
                    actions={mounted ? (
                        <>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="outline" className="flex-1 sm:flex-none h-9 text-xs md:text-sm" onClick={handleImportClick} disabled={isImporting}>
                                            {isImporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                                            <span className="hidden sm:inline ml-2">Импорт</span>
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Загрузить данные из файла</p>
                                    </TooltipContent>
                                </Tooltip>

                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="outline" className="flex-1 sm:flex-none h-9 text-xs md:text-sm" onClick={handleExport} disabled={isExporting}>
                                            {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                                            <span className="hidden sm:inline ml-2">Экспорт</span>
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Выгрузить данные в файл</p>
                                    </TooltipContent>
                                </Tooltip>

                                <AlertDialog>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <AlertDialogTrigger asChild>
                                                <Button
                                                    variant="destructive"
                                                    className="flex-1 sm:flex-none h-9 text-xs md:text-sm"
                                                    disabled={isDeletingAll || initialData.length === 0}
                                                >
                                                    {isDeletingAll ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                                                    <span className="hidden sm:inline ml-2">Удалить всё</span>
                                                </Button>
                                            </AlertDialogTrigger>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Удалить все записи</p>
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
                                            <AlertDialogAction onClick={handleDeleteAll} className="bg-red-700 text-white hover:bg-red-800">Удалить всё</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </TooltipProvider>
                        </>
                    ) : undefined}
                    meta={{
                        onInsertRequest,
                        onCancelInsert,
                        onSaveInsert,
                        updatePlaceholderRow,
                        onReorder: handleReorder
                    }}
                />
            </div>
        </div>
    );
}
