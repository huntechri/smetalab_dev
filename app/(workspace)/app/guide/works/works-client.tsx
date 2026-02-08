'use client';

import * as React from 'react';
import { useState, useEffect, useCallback } from 'react';
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

import { WorkRow } from '@/types/work-row';
import { useWorksTable } from './hooks/useWorksTable';
import { useWorksActions } from './hooks/useWorksActions';
import { useDataTableEditor } from '@/hooks/use-data-table-editor';

interface WorksClientProps {
    initialData: WorkRow[];
    totalCount: number;
    tenantId: number;
}

import { useWorksSearch } from './hooks/useWorksSearch';

export function WorksClient({ initialData, totalCount, tenantId }: WorksClientProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const {
        data,
        setData,
        isInserting,
        onInsertRequest,
        onCancelInsert,
        updatePlaceholderRow,
        onSaveInsert
    } = useWorksTable(initialData, tenantId);

    const actions = useWorksActions({ setData });

    const search = useWorksSearch(initialData, data, setData);
    const editor = useDataTableEditor<WorkRow>({
        onRowUpdate: actions.handleRowUpdate,
        onRowDelete: actions.handleRowDelete,
    });

    useEffect(() => {
        setData(initialData);
    }, [initialData, setData]);

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

    const handleEditFieldChange = useCallback((field: string, val: unknown) => {
        editor.setEditFormData((prev) => {
            if (!prev) return prev;
            return { ...prev, [field]: val };
        });
    }, [editor.setEditFormData]);


    return (
        <div className="space-y-6">
            <input
                type="file"
                ref={actions.fileInputRef}
                onChange={actions.handleFileChange}
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
                {(actions.isImporting || isInserting) && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/50 backdrop-blur-[1px] rounded-2xl">
                        <div className="flex flex-col items-center gap-3 p-6 bg-card border shadow-xl rounded-xl animate-in fade-in zoom-in duration-200">
                            <Loader2 className="h-10 w-10 animate-spin text-primary" />
                            <div className="flex flex-col items-center gap-1">
                                <p className="text-sm font-semibold">{isInserting ? "Сохранение записи..." : "Идет импорт данных..."}</p>
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
                    actions={mounted ? (
                        <>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="outline" className="flex-1 sm:flex-none h-9 text-xs md:text-sm" onClick={actions.handleImportClick} disabled={actions.isImporting}>
                                            {actions.isImporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                                            <span className="hidden sm:inline ml-2">Импорт</span>
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Загрузить данные из файла</p>
                                    </TooltipContent>
                                </Tooltip>

                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="outline" className="flex-1 sm:flex-none h-9 text-xs md:text-sm" onClick={actions.handleExport} disabled={actions.isExporting}>
                                            {actions.isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
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
                                                    disabled={actions.isDeletingAll || initialData.length === 0}
                                                >
                                                    {actions.isDeletingAll ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
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
                                                <AlertDialogAction onClick={actions.handleDeleteAll} className="bg-red-700 text-white hover:bg-red-800">Удалить всё</AlertDialogAction>
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
                        onReorder: actions.handleReorder,
                        setEditingRow: editor.setEditingRow,
                        setDeletingRow: editor.setDeletingRow,
                    }}
                />

                <Dialog open={!!editor.editingRow} onOpenChange={(open) => !open && editor.setEditingRow(null)}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Изменить запись</DialogTitle>
                            <DialogDescription>Внесите изменения и нажмите сохранить.</DialogDescription>
                        </DialogHeader>
                        {editor.editFormData ? (
                            <form onSubmit={editor.handleUpdate} className="grid gap-4 py-4">
                                {renderEditFields(editor.editFormData, handleEditFieldChange)}
                                <DialogFooter>
                                    <Button type="submit" disabled={editor.isUpdating} className="h-9 px-8">
                                        {editor.isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Сохранить
                                    </Button>
                                </DialogFooter>
                            </form>
                        ) : (
                            <div className="text-sm text-muted-foreground p-4 text-center">
                                Форма редактирования не настроена
                            </div>
                        )}
                    </DialogContent>
                </Dialog>

                <AlertDialog open={!!editor.deletingRow} onOpenChange={(open) => !open && editor.setDeletingRow(null)}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Вы уверены?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Запись {editor.deletingRow?.name ? `"${editor.deletingRow?.name}"` : ""} будет удалена безвозвратно.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Отмена</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={(event) => {
                                    event.preventDefault()
                                    editor.handleDelete()
                                }}
                                className="bg-red-700 text-white hover:bg-red-800"
                                disabled={editor.isDeleting}
                            >
                                {editor.isDeleting ? "Удаление..." : "Удалить"}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </div>
    );
}
