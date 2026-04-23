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
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Button variant="outline" onClick={() => model.openCreateSectionDialog()}>
            <FolderTree className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
            Создать раздел
          </Button>
          <Button variant="outline" onClick={model.openCalculationMode}>
            <Calculator className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
            Добавить работу
          </Button>
          <Button
            variant="outline"
            onClick={() => void model.importEstimate()}
            disabled={model.isImporting}
          >
            <FileUp className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
            Импорт из Excel
          </Button>
        </div>
      }
    />
  );

  return (
    <div className="space-y-1.5 sm:space-y-2 [--table-height:calc(100vh-320px)] sm:[--table-height:calc(100vh-280px)]">
      <section className="flex flex-col rounded-lg border border-[#e4e4e7] bg-white text-[#09090b] shadow-none">
        {/* Тулбар внутри контейнера */}
        <div className="p-1.5 sm:p-3 pb-0">
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
            hasFilterControls={model.rows.length > 0}
            isAiMode={isAiMode}
            setIsAiMode={setIsAiMode}
            searchValue={searchValue}
            setSearchValue={setSearchValue}
            compactMobileToolbar
          />
        </div>

        {/* Прокручиваемая область карточек */}
        <div className="max-h-[var(--table-height)] overflow-y-auto bg-white px-1.5 pb-20 pt-1.5 sm:px-4 sm:pt-2">
          {model.rows.length === 0 ? (
            <div className="px-3 py-8">{emptyState}</div>
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
        </div>
      </section>

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
    </div>
  );
}
