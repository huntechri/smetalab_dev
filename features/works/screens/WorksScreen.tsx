'use client';

import * as React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import { Skeleton } from '@/shared/ui/skeleton';
import { useBreadcrumbs } from '@/components/providers/breadcrumb-provider';
import { TooltipProvider } from "@/shared/ui/tooltip";
import { Button } from '@/shared/ui/button';

import { WorkRow } from '@/types/work-row';
import { WorksEditDialog } from '../components/WorksEditDialog';
import { WorksDeleteDialog } from '../components/WorksDeleteDialog';

// Internal Components
import { WorksHeader } from '../components/WorksHeader';
import { WorksToolbar } from '../components/WorksToolbar';
import { WorksTableWrapper } from '../components/WorksTableWrapper';
import { WorksSidebar } from '../components/WorksSidebar';

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

    useBreadcrumbs([
        { label: 'Главная', href: '/app' },
        { label: 'Справочники' },
        { label: 'Работы' },
    ]);

    useEffect(() => {
        setData(initialData);
    }, [initialData, setData]);

    const handleEditFieldChange = useCallback((field: string, val: unknown) => {
        editor.setEditFormData((prev) => {
            if (!prev) return prev;
            return { ...prev, [field]: val };
        });
    }, [editor.setEditFormData]);

    if (!mounted) {
        return (
            <div className="space-y-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-[420px] w-full" />
            </div>
        );
    }

    return (
        <div className="space-y-2">
            <input
                type="file"
                ref={actions.fileInputRef}
                onChange={actions.handleFileChange}
                className="hidden"
                accept=".csv, .xlsx, .xls"
                aria-label="Загрузить файл"
                title="Загрузить файл"
            />

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between px-1 md:px-0 mb-2">
                <div className="flex items-center gap-3">
                    <WorksHeader isLoading={search.isAiSearching} totalCount={totalCount} />
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6 items-start relative px-1 md:px-0">
                <aside className="hidden lg:block w-64 shrink-0 sticky top-4">
                    <WorksSidebar filters={search.filters} setFilters={search.setFilters} />
                </aside>

                <div className="flex-1 min-w-0 w-full relative">
                    {(actions.isImporting || isInserting) && (
                        <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/50 backdrop-blur-[1px] rounded-2xl">
                            <div className="flex flex-col items-center gap-3 p-6 bg-card border shadow-xl rounded-xl animate-in fade-in zoom-in duration-200">
                                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                                <div className="flex flex-col items-center gap-1">
                                    <p className="text-[12px] font-semibold">{isInserting ? "Сохранение записи..." : "Идет импорт данных..."}</p>
                                    <p className="text-[12px] text-muted-foreground uppercase tracking-wider font-medium">Пожалуйста, подождите</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <TooltipProvider>
                        <WorksTableWrapper
                            data={data}
                            isAiMode={search.isAiMode}
                            isSearching={search.isAiSearching || search.isSearching}
                            loadingMore={search.isLoadingMore}
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
                                    filters={search.filters}
                                    setFilters={search.setFilters}
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
