"use client";

import { useMemo, useState } from "react";
import { Button } from "@repo/ui";
import { DataTable } from "@repo/ui";
import {
  Calculator,
  FileDown,
  FilePlus,
  FileStack,
  FileUp,
  FolderTree,
  MoreHorizontal,
  Percent,
  Save,
  Trash2,
} from "lucide-react";
import { TableEmptyState } from "@repo/ui";
import { Badge } from "@repo/ui";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@repo/ui";
import { useRouter } from "next/navigation";
import { useEstimateMutations } from "../../hooks/use-estimate-mutations";
import { EstimateRow } from "../../types/dto";
import { getEstimateColumns } from "./columns";
import { EstimateTableDialogs } from "./EstimateTableDialogs";
import { useEstimateTableController } from "../../hooks/use-estimate-table-controller";

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
        compactMobileToolbar
        actions={
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="hidden sm:flex items-center gap-1.5 sm:gap-2">
              <Button variant="outline" aria-label="Режим расчета" onClick={model.openCalculationMode}>
                <Calculator className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="hidden sm:inline">Режим расчета</span>
              </Button>
              <Button
                variant="outline"
                aria-label="Добавить раздел"
                onClick={() => model.openCreateSectionDialog()}
              >
                <FolderTree className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="hidden sm:inline">Раздел</span>
              </Button>
              <Button
                variant="outline"
                aria-label="Сохранить смету"
                onClick={() => model.setIsSavePatternOpen(true)}
              >
                <Save className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="hidden sm:inline">Сохранить</span>
              </Button>
            </div>
            <div className="hidden lg:flex items-center gap-1.5">
              <Button variant="outline" onClick={() => model.setIsApplyPatternOpen(true)}>
                <FileStack className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Шаблон</span>
              </Button>
              <Button variant="outline" onClick={model.openCoefficientDialog}>
                <Percent className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Коэффициент</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => void model.importEstimate()}
                disabled={model.isImporting}
              >
                <FileUp className="h-3.5 w-3.5 text-muted-foreground" />
                <span>{model.isImporting ? "Импорт..." : "Импорт"}</span>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" disabled={model.isExporting}>
                    <FileDown className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{model.isExporting ? "Экспорт..." : "Экспорт"}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem
                    className="gap-2"
                    onClick={() => void model.exportEstimate("xlsx")}
                  >
                    <FileDown className="h-4 w-4 text-muted-foreground" />
                    <span>Экспорт в Excel (.xlsx)</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="gap-2"
                    onClick={() => void model.exportEstimate("pdf")}
                  >
                    <FileDown className="h-4 w-4 text-muted-foreground" />
                    <span>Экспорт в PDF (.pdf)</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="hidden sm:flex">
              <Button
                variant="destructive"
                aria-label="Удалить смету"
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Удалить</span>
              </Button>
            </div>
            <div className="sm:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon-xs" aria-label="Действия по смете">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Действия по смете</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem className="gap-2" onClick={model.openCalculationMode}>
                    <Calculator className="h-4 w-4 text-muted-foreground" />
                    <span>Режим расчета</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="gap-2"
                    onClick={() => model.openCreateSectionDialog()}
                  >
                    <FolderTree className="h-4 w-4 text-muted-foreground" />
                    <span>Раздел</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="gap-2"
                    onClick={() => model.setIsSavePatternOpen(true)}
                  >
                    <Save className="h-4 w-4 text-muted-foreground" />
                    <span>Сохранить</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="gap-2"
                    onClick={() => model.setIsApplyPatternOpen(true)}
                  >
                    <FileStack className="h-4 w-4 text-muted-foreground" />
                    <span>Шаблон</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="gap-2" onClick={model.openCoefficientDialog}>
                    <Percent className="h-4 w-4 text-muted-foreground" />
                    <span>Коэффициент</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="gap-2"
                    disabled={model.isImporting}
                    onClick={() => void model.importEstimate()}
                  >
                    <FileUp className="h-4 w-4 text-muted-foreground" />
                    <span>{model.isImporting ? "Импорт..." : "Импорт"}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="gap-2"
                    disabled={model.isExporting}
                    onClick={() => void model.exportEstimate("xlsx")}
                  >
                    <FileDown className="h-4 w-4 text-muted-foreground" />
                    <span>Экспорт в Excel</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="gap-2"
                    disabled={model.isExporting}
                    onClick={() => void model.exportEstimate("pdf")}
                  >
                    <FileDown className="h-4 w-4 text-muted-foreground" />
                    <span>Экспорт в PDF</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="gap-2 text-destructive focus:text-destructive"
                    onClick={() => setIsDeleteDialogOpen(true)}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Удалить смету</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        }
      />

      <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border/60 bg-background/95 px-1 pt-1">
        <Badge variant="neutral" size="xs">
          <span>Работы:</span>
          <span className="text-[10px] font-bold tabular-nums normal-case tracking-normal leading-[15px]">
            {currencyFormatter.format(model.totals.works)}
          </span>
        </Badge>
        <Badge variant="neutral" size="xs">
          <span>Материалы:</span>
          <span className="text-[10px] font-bold tabular-nums normal-case tracking-normal leading-[15px]">
            {currencyFormatter.format(model.totals.materials)}
          </span>
        </Badge>
      </div>

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
