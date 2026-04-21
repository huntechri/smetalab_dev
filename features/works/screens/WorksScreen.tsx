'use client';

import { useEffect } from 'react';

import {
  CatalogScreenFallback,
  CatalogScreenShell,
  type CatalogScreenAdapter,
  useCatalogEditFieldChange,
  useCatalogScreenViewState,
} from '@/features/guide-catalog';
import { WorkRow } from '@/shared/types/domain/work-row';
import { WorksEditDialog } from '../components/WorksEditDialog';
import { WorksDeleteDialog } from '../components/WorksDeleteDialog';
import { WorksHeader } from '../components/WorksHeader';
import { WorksToolbar } from '../components/WorksToolbar';
import { WorksTableWrapper } from '../components/WorksTableWrapper';
import { WorksSidebar } from '../components/WorksSidebar';
import { useWorksTable } from '../hooks/useWorksTable';
import { useWorksActions } from '../hooks/useWorksActions';
import { useWorksSearch } from '../hooks/useWorksSearch';
import { useDataTableEditor } from '@/shared/hooks/use-data-table-editor';

interface WorksScreenProps {
  initialData: WorkRow[];
  tenantId: number;
}

const worksScreenAdapter: CatalogScreenAdapter = {
  fileInputLabel: 'Загрузить файл',
  fileInputTitle: 'Загрузить файл',
  overlayInsertTitle: 'Сохранение записи...',
  overlayImportTitle: 'Идет импорт данных...',
  overlayImportDescription: 'Пожалуйста, подождите',
};

export function WorksScreen({ initialData, tenantId }: WorksScreenProps) {
  const { mounted, showSidebar, setShowSidebar } = useCatalogScreenViewState({
    breadcrumbs: [
      { label: 'Главная', href: '/app' },
      { label: 'Справочники' },
      { label: 'Работы' },
    ],
  });

  const {
    data,
    setData,
    isInserting,
    onInsertRequest,
    onCancelInsert,
    updatePlaceholderRow,
    onSaveInsert,
  } = useWorksTable(initialData, tenantId);

  const actions = useWorksActions({ setData });
  const search = useWorksSearch(initialData, data, setData);
  const editor = useDataTableEditor<WorkRow>({
    onRowUpdate: actions.handleRowUpdate,
    onRowDelete: actions.handleRowDelete,
  });
  const handleEditDialogOpenChange = (open: boolean) => {
    if (!open) {
      editor.setEditingRow(null);
    }
  };
  const handleDeleteDialogOpenChange = (open: boolean) => {
    if (!open) {
      editor.setDeletingRow(null);
    }
  };

  useEffect(() => {
    setData(initialData);
  }, [initialData, setData]);

  const handleEditFieldChange = useCatalogEditFieldChange(editor.setEditFormData);

  if (!mounted) {
    return <CatalogScreenFallback />;
  }

  return (
    <>
      <CatalogScreenShell
        fileInputRef={actions.fileInputRef}
        onFileChange={actions.handleFileChange}
        fileInputLabel={worksScreenAdapter.fileInputLabel}
        fileInputTitle={worksScreenAdapter.fileInputTitle}
        fileInputAccept={worksScreenAdapter.fileInputAccept}
        header={<WorksHeader isLoading={search.isAiSearching} />}
        sidebar={<WorksSidebar filters={search.filters} setFilters={search.setFilters} />}
        showSidebar={showSidebar}
        isOverlayVisible={actions.isImporting || isInserting}
        overlayTitle={isInserting ? worksScreenAdapter.overlayInsertTitle : worksScreenAdapter.overlayImportTitle}
        overlayDescription={isInserting ? undefined : worksScreenAdapter.overlayImportDescription}
      >
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
              showSidebar={showSidebar}
              setShowSidebar={setShowSidebar}
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
      </CatalogScreenShell>

      <WorksEditDialog
        open={!!editor.editingRow}
        data={editor.editFormData}
        isUpdating={editor.isUpdating}
        onOpenChange={handleEditDialogOpenChange}
        onFieldChange={handleEditFieldChange}
        onSubmit={editor.handleUpdate}
        onCancel={() => editor.setEditingRow(null)}
      />

      <WorksDeleteDialog
        open={!!editor.deletingRow}
        isDeleting={editor.isDeleting}
        name={editor.deletingRow?.name}
        onOpenChange={handleDeleteDialogOpenChange}
        onConfirm={() => editor.handleDelete()}
      />
    </>
  );
}

export const WorksClient = WorksScreen;
