"use client";

import { useMemo, useState } from "react";
import { Button } from "@/shared/ui/button";
import { DataTable } from "@/shared/ui/data-table";
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
import { getEstimateColumns } from "./columns";
import { EstimateTableDialogs } from "./EstimateTableDialogs";
import { useEstimateTableController } from "../../hooks/use-estimate-table-controller";
import { EstimateTableToolbar } from "./EstimateTableToolbar";
import { EstimateTableSummary } from "./EstimateTableSummary";

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

  return (
    <div className="space-y-2 [--table-height:600px]">
      <DataTable
        columns={getEstimateColumns({
          expandedWorkIds: model.expandedWorkIds,
          onToggleExpand: model.toggleWorkExpand,
          onPatch: model.patch,
          onOpenMaterialCatalog: model.openMaterialCatalog,
          onInsertWorkAfter: model.insertWorkAfter,
          onReplaceWork: model.openWorkReplaceDialog,
          onReplaceMaterial: model.openMaterialReplaceDialog,
          onRequestCreateSectionBefore: model.openCreateSectionDialogBefore,
          onRequestCreateSection: model.openCreateSectionDialog,
          onRemoveRow: model.removeRow,
          sectionTotalsById: model.sectionTotalsById,
        })}
        data={model.visibleRows}
        getRowClassName={(row) =>
          row.kind === "section"
            ? "bg-slate-50/80 border-y border-slate-200/60 font-bold text-slate-900"
            : ""
        }
        emptyState={
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
        }
        filterColumn="name"
        filterPlaceholder="Поиск..."
        height="var(--table-height)"
        tableMinWidth="100%"
        tableContainerClassName="overflow-x-hidden md:overflow-x-auto"
        compactMobileToolbar
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
      />

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
