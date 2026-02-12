'use client';

import * as React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { TooltipProvider } from "@/components/ui/tooltip";

import { WorkRow } from '@/types/work-row';
import { WorksEditDialog } from '../components/WorksEditDialog';
import { WorksDeleteDialog } from '../components/WorksDeleteDialog';

// Internal Components
import { WorksHeader } from '../components/WorksHeader';
import { WorksToolbar } from '../components/WorksToolbar';
import { WorksTableWrapper } from '../components/WorksTableWrapper';

// Internal Hooks
import { useWorksTable } from '../hooks/useWorksTable';
import { useWorksActions } from '../hooks/useWorksActions';
import { useWorksSearch } from '../hooks/useWorksSearch';
import { useDataTableEditor } from '@/hooks/use-data-table-editor';

interface WorksScreenProps {
    initialData: WorkRow[];
    totalCount: number;
    tenantId: number;
}

export function WorksScreen({ initialData, totalCount, tenantId }: WorksScreenProps) {
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

    const handleEditFieldChange = useCallback((field: string, val: unknown) => {
        editor.setEditFormData((prev) => {
            if (!prev) return prev;
            return { ...prev, [field]: val };
        });
    }, [editor.setEditFormData]);

    if (!mounted) return null;

    return (
        <div className="space-y-6">
            <input
                type="file"
                ref={actions.fileInputRef}
                onChange={actions.handleFileChange}
                className="hidden"
                accept=".csv, .xlsx, .xls"
                aria-label="Загрузить файл"
                title="Загрузить файл"
            />

            <Breadcrumb className="px-1 md:px-0">
                <BreadcrumbList>
                    <BreadcrumbItem><BreadcrumbLink href="/app">Главная</BreadcrumbLink></BreadcrumbItem>
                    <BreadcrumbSeparator /><BreadcrumbItem><BreadcrumbLink>Справочники</BreadcrumbLink></BreadcrumbItem>
                    <BreadcrumbSeparator /><BreadcrumbItem><BreadcrumbPage>Работы</BreadcrumbPage></BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between px-1 md:px-0">
                <WorksHeader isLoading={search.isAiSearching} totalCount={totalCount} />
                <div className="hidden" aria-hidden="true" />
            </div>

            <div className="relative">
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

                <TooltipProvider>
                    <WorksTableWrapper
                        data={data}
                        isAiMode={search.isAiMode}
                        isSearching={search.isAiSearching || search.isLoadingMore}
                        searchTerm={search.searchTerm}
                        onSearch={search.handleSearch}
                        onAiModeChange={search.setIsAiMode}
                        onSearchValueChange={search.setSearchTerm}
                        onEndReached={search.loadMore}
                        actions={(
                            <WorksToolbar
                                isImporting={actions.isImporting}
                                isExporting={actions.isExporting}
                                isDeletingAll={actions.isDeletingAll}
                                hasData={data.length > 0}
                                handleImportClick={actions.handleImportClick}
                                handleExport={actions.handleExport}
                                handleDeleteAll={actions.handleDeleteAll}
                            />
                        )}
                        tableActions={{
                            onInsertRequest,
                            onCancelInsert,
                            onSaveInsert,
                            updatePlaceholderRow,
                            onReorder: actions.handleReorder,
                            setEditingRow: editor.setEditingRow,
                            setDeletingRow: editor.setDeletingRow,
                        }}
                    />
                </TooltipProvider>
            </div>

            <WorksEditDialog
                open={!!editor.editingRow}
                data={editor.editFormData}
                isUpdating={editor.isUpdating}
                onOpenChange={(open) => !open && editor.setEditingRow(null)}
                onFieldChange={handleEditFieldChange}
                onSubmit={editor.handleUpdate}
                onCancel={() => editor.setEditingRow(null)}
            />

            <WorksDeleteDialog
                open={!!editor.deletingRow}
                isDeleting={editor.isDeleting}
                name={editor.deletingRow?.name}
                onOpenChange={(open) => !open && editor.setDeletingRow(null)}
                onConfirm={() => editor.handleDelete()}
            />
        </div>
    );
}
export const WorksClient = WorksScreen;
