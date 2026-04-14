'use client';

import * as React from 'react';
import { useState, useEffect, useCallback } from 'react';

import { useBreadcrumbs } from '@/components/providers/breadcrumb-provider';
import { Skeleton } from '@/shared/ui/skeleton';
import { CatalogScreenShell, type CatalogScreenAdapter } from '@/features/guide-catalog';
import { MaterialRow } from '@/shared/types/domain/material-row';
import { MaterialsEditDialog } from '../components/MaterialsEditDialog';
import { MaterialsDeleteDialog } from '../components/MaterialsDeleteDialog';
import { MaterialsHeader } from '../components/MaterialsHeader';
import { MaterialsToolbar } from '../components/MaterialsToolbar';
import { MaterialsTableWrapper } from '../components/MaterialsTableWrapper';
import { MaterialsSidebar } from '../components/MaterialsSidebar';
import { useMaterialsActions } from '../hooks/useMaterialsActions';
import { useMaterialsSearch } from '../hooks/useMaterialsSearch';
import { useMaterialsTable } from '../hooks/useMaterialsTable';
import { useMaterialsRowActions } from '../hooks/useMaterialsRowActions';
import { useDataTableEditor } from '@/shared/hooks/use-data-table-editor';

interface MaterialsScreenProps {
  initialData: MaterialRow[];
  tenantId: number;
}

const materialsScreenAdapter: CatalogScreenAdapter = {
  fileInputLabel: 'Загрузить материалы из файла',
  fileInputTitle: 'Загрузить материалы из файла',
  overlayInsertTitle: 'Сохранение...',
  overlayImportTitle: 'Импорт...',
};

export function MaterialsScreen({ initialData, tenantId }: MaterialsScreenProps) {
  const [mounted, setMounted] = useState(false);
  const [data, setData] = useState<MaterialRow[]>(initialData);
  const [showSidebar, setShowSidebar] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setData(initialData);
  }, [initialData]);

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
    <>
      <CatalogScreenShell
        fileInputRef={actions.fileInputRef}
        onFileChange={actions.handleFileChange}
        fileInputLabel={materialsScreenAdapter.fileInputLabel}
        fileInputTitle={materialsScreenAdapter.fileInputTitle}
        fileInputAccept={materialsScreenAdapter.fileInputAccept}
        header={<MaterialsHeader isLoading={search.isAiSearching} />}
        sidebar={<MaterialsSidebar filters={search.filters} setFilters={search.setFilters} />}
        showSidebar={showSidebar}
        isOverlayVisible={actions.isImporting || actions.isInserting}
        overlayTitle={actions.isInserting ? materialsScreenAdapter.overlayInsertTitle : materialsScreenAdapter.overlayImportTitle}
      >
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
      </CatalogScreenShell>

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
    </>
  );
}

export const MaterialsClient = MaterialsScreen;
