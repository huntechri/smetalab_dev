"use client";

import { useMemo, useState } from "react";
import { Button } from "@/shared/ui/button";
import { DataTableToolbar } from "@/shared/ui/data-table/data-table-toolbar";
import {
  Calculator,
  FilePlus,
  FileUp,
  FolderTree,
} from "lucide-react";
import {
  EditableDataSurface,
  EditableDataSurfaceActions,
  EditableDataSurfaceEmptyInset,
  EditableDataSurfaceToolbar,
  EditableDataSurfaceViewport,
} from "@/shared/ui/editable-data-surface";
import { TableEmptyState } from "@/shared/ui/table-empty-state";
import { useRouter } from "next/navigation";
import { useEstimateMutations } from "../../hooks/use-estimate-mutations";
import { EstimateRow } from "../../types/dto";
import { EstimateTableDialogs } from "./EstimateTableDialogs";
import { useEstimateTableController } from "../../hooks/use-estimate-table-controller";
import { EstimateTableToolbar } from "./EstimateTableToolbar";
import { EstimateTableSummary } from "./EstimateTableSummary";
import { EstimateCardsTable } from "./EstimateCardsTable";

export function EstimateTable({
  estimateId,
  initialRows,
  initialCoefPercent,
  projectSlug,
  estimateName,
}: {
  estimateId: string;
  initialRows: EstimateRow[];
  initialCoefPercent: number;
  projectSlug: string;
  estimateName: string;
}) {
  const router = useRouter();
  const { deleteEstimate } = useEstimateMutations();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [isAiMode, setIsAiMode] = useState(false);

  const model = useEstimateTableController({
    estimateId,
    initialRows,
    initialCoefPercent,
  });

  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat("ru-RU", {
        style: "currency",
        currency: "RUB",
        maximumFractionDigits: 2,
      }),
    [],
  );

  const handleDeleteEstimate = async () => {
    setIsDeleting(true);
    const success = await deleteEstimate({ estimateId, estimateName });
    if (success) {
      router.push(`/app/projects/${projectSlug}`);
      return;
    }

    setIsDeleting(false);
    setIsDeleteDialogOpen(false);
  };

  const emptyState = (
    <TableEmptyState
      title="Смета еще не заполнена"
      description="Добавьте разделы, работы и материалы или импортируйте готовую смету из Excel"
      icon={FilePlus}
      action={
        <EditableDataSurfaceActions>
          <Button variant="outline" size="xs" onClick={() => model.openCreateSectionDialog()}>
            <FolderTree aria-hidden="true" />
            Создать раздел
          </Button>
          <Button variant="outline" size="xs" onClick={model.openCalculationMode}>
            <Calculator aria-hidden="true" />
            Добавить работу
          </Button>
          <Button
            size="xs"
            variant="outline"
            onClick={() => void model.importEstimate()}
            disabled={model.isImporting}
          >
            <FileUp aria-hidden="true" />
            Импорт из Excel
          </Button>
        </EditableDataSurfaceActions>
      }
    />
  );

  return (
    <>
      <EditableDataSurface>
        <EditableDataSurfaceToolbar>
          <DataTableToolbar
            actions={
              <EstimateTableToolbar
                isImporting={model.isImporting}
                isExporting={model.isExporting}
                onOpenCalculationMode={model.openCalculationMode}
                onOpenCreateSectionDialog={() => model.openCreateSectionDialog()}
                onOpenSavePattern={() => model.setIsSavePatternOpen(true)}
                onOpenApplyPattern={() => model.setIsApplyPatternOpen(true)}
                onOpenCoefficientDialog={model.openCoefficientDialog}
                onImportEstimate={() => void model.importEstimate()}
                onExportXlsx={() => void model.exportEstimate("xlsx")}
                onExportPdf={() => void model.exportEstimate("pdf")}
                onOpenDeleteDialog={() => setIsDeleteDialogOpen(true)}
              />
            }
            filterPlaceholder="Поиск..."
            hasFilterControls={true}
            isAiMode={isAiMode}
            setIsAiMode={setIsAiMode}
            searchValue={searchValue}
            setSearchValue={setSearchValue}
            compactMobileToolbar
          />
        </EditableDataSurfaceToolbar>

        <EditableDataSurfaceViewport size="estimate">
          {model.rows.length === 0 ? (
            <EditableDataSurfaceEmptyInset>{emptyState}</EditableDataSurfaceEmptyInset>
          ) : (
            <EstimateCardsTable
              rows={model.rows}
              expandedWorkIds={model.expandedWorkIds}
              sectionTotalsById={model.sectionTotalsById}
              searchValue={searchValue}
              onToggleExpand={model.toggleWorkExpand}
              onPatch={model.patch}
              onOpenMaterialCatalog={model.openMaterialCatalog}
              onInsertWorkAfter={model.insertWorkAfter}
              onReplaceWork={model.openWorkReplaceDialog}
              onReplaceMaterial={model.openMaterialReplaceDialog}
              onRequestCreateSectionBefore={model.openCreateSectionDialogBefore}
              onRequestCreateSection={model.openCreateSectionDialog}
              onRemoveRow={model.removeRow}
            />
          )}
        </EditableDataSurfaceViewport>
      </EditableDataSurface>

      <EstimateTableSummary
        worksTotal={currencyFormatter.format(model.totals.works)}
        materialsTotal={currencyFormatter.format(model.totals.materials)}
      />

      <EstimateTableDialogs
        model={model}
        estimateName={estimateName}
        isDeleteDialogOpen={isDeleteDialogOpen}
        isDeleting={isDeleting}
        onDeleteDialogChange={setIsDeleteDialogOpen}
        onDeleteConfirm={handleDeleteEstimate}
      />
    </>
  );
}
