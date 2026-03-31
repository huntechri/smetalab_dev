'use client';

import * as React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { useBreadcrumbs } from '@/components/providers/breadcrumb-provider';
import { Loader2 } from 'lucide-react';
import { MaterialRow } from '@/types/material-row';
import { Skeleton } from '@/shared/ui/skeleton';
import { MaterialsEditDialog } from '../components/MaterialsEditDialog';
import { MaterialsDeleteDialog } from '../components/MaterialsDeleteDialog';

// Internal Components
import { MaterialsHeader } from '../components/MaterialsHeader';
import { MaterialsToolbar } from '../components/MaterialsToolbar';
import { MaterialsTableWrapper } from '../components/MaterialsTableWrapper';
import { MaterialsSidebar } from '../components/MaterialsSidebar';
import { cn } from '@/lib/utils';
import { Filter } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/shared/ui/sheet";

// Internal Hooks
import { useMaterialsActions } from '../hooks/useMaterialsActions';
import { useMaterialsSearch } from '../hooks/useMaterialsSearch';
import { useMaterialsTable } from '../hooks/useMaterialsTable';
import { useMaterialsRowActions } from '../hooks/useMaterialsRowActions';
import { useDataTableEditor } from '@/hooks/use-data-table-editor';

interface MaterialsScreenProps {
    initialData: MaterialRow[];
    totalCount: number;
    tenantId: number;
}

export function MaterialsScreen({ initialData, totalCount, tenantId }: MaterialsScreenProps) {
    const [mounted, setMounted] = useState(false);
    const [data, setData] = useState<MaterialRow[]>(initialData);
    const [showSidebar, setShowSidebar] = useState(true);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        setData(initialData);
    }, [initialData]);

    // Initialize hooks
    const actions = useMaterialsActions(data, setData, tenantId);
    const search = useMaterialsSearch(initialData, data, setData);
    const table = useMaterialsTable(data, setData, tenantId);
    const rowActions = useMaterialsRowActions();
    const editor = useDataTableEditor<MaterialRow>({
        onRowUpdate: rowActions.handleRowUpdate,
        onRowDelete: rowActions.handleRowDelete,
    });

    useBreadcrumbs([
        { label: 'Главная', href: '/app' },
        { label: 'Справочники' },
        { label: 'Материалы' },
    ]);

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
                aria-label="Загрузить материалы из файла"
                title="Загрузить материалы из файла"
            />

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between px-1 md:px-0 mb-2">
                <div className="flex items-center gap-3">
                    <MaterialsHeader isLoading={search.isAiSearching} totalCount={totalCount} />
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6 items-start relative px-1 md:px-0 transition-all duration-300">
                {showSidebar && (
                    <aside className="hidden lg:block w-64 shrink-0 sticky top-4 animate-in slide-in-from-left duration-200">
                        <MaterialsSidebar filters={search.filters} setFilters={search.setFilters} />
                    </aside>
                )}

                <div className="flex-1 min-w-0 w-full relative">
                    {(actions.isImporting || actions.isInserting) && (
                        <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/50 backdrop-blur-[1px] rounded-2xl">
                            <div className="flex flex-col items-center gap-3 p-6 bg-card border shadow-xl rounded-xl">
                                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                                <p className="text-[12px] font-semibold">{actions.isInserting ? "Сохранение..." : "Импорт..."}</p>
                            </div>
                        </div>
                    )}

                    <MaterialsTableWrapper
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
                            <MaterialsToolbar
                                isImporting={actions.isImporting}
                                isExporting={actions.isExporting}
                                isDeletingAll={actions.isDeletingAll}
                                hasData={data.length > 0}
                                handleImportClick={actions.handleImportClick}
                                handleExport={actions.handleExport}
                                handleDeleteAll={actions.handleDeleteAll}
                                filters={search.filters}
                                setFilters={search.setFilters}
                                showSidebar={showSidebar}
                                setShowSidebar={setShowSidebar}
                            />
                        )}
                        tableActions={{
                            onInsertRequest: table.onInsertRequest,
                            onCancelInsert: table.onCancelInsert,
                            onSaveInsert: actions.onSaveInsert,
                            updatePlaceholderRow: table.updatePlaceholderRow,
                            setEditingRow: editor.setEditingRow,
                            setDeletingRow: editor.setDeletingRow,
                        }}
                    />
                </div>
            </div>

            <MaterialsEditDialog
                open={!!editor.editingRow}
                data={editor.editFormData}
                isUpdating={editor.isUpdating}
                onOpenChange={(open) => !open && editor.setEditingRow(null)}
                onFieldChange={handleEditFieldChange}
                onSubmit={editor.handleUpdate}
                onCancel={() => editor.setEditingRow(null)}
            />

            <MaterialsDeleteDialog
                open={!!editor.deletingRow}
                isDeleting={editor.isDeleting}
                name={editor.deletingRow?.name}
                onOpenChange={(open) => !open && editor.setDeletingRow(null)}
                onConfirm={() => editor.handleDelete()}
            />
        </div>
    );
}
export const MaterialsClient = MaterialsScreen;
