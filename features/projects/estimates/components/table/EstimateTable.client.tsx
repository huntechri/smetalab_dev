"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/shared/ui/button";
import { DataTable } from "@/shared/ui/data-table";
import { useAppToast } from "@/components/providers/use-app-toast";
import {
  Calculator,
  Save,
  FileStack,
  Percent,
  FileUp,
  FileDown,
  Trash2,
  MoreHorizontal,
} from "lucide-react";
import { Badge } from "@/shared/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/shared/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { estimatesActionRepo } from "../../repository/estimates.actions";
import { getVisibleRows } from "../../lib/rows-visible";
import { EstimateRow, RowPatch } from "../../types/dto";
import { getEstimateColumns } from "./columns";
import { WorkCatalogPicker } from "@/features/catalog/components/WorkCatalogPicker.client";
import { MaterialCatalogDialog } from "@/features/catalog/components/MaterialCatalogDialog.client";
import { CatalogMaterial, CatalogWork } from "@/features/catalog/types/dto";
import {
  ESTIMATE_COEF_MAX,
  ESTIMATE_COEF_MIN,
  getEstimateCoefMultiplier,
} from "@/lib/utils/estimate-coefficient";
import {
  estimatePatternsActionRepo,
  EstimatePatternListItem,
  EstimatePatternPreviewRow,
} from "../../repository/patterns.actions";

type ActiveWorkForMaterial = { id: string; name: string };
type ActiveMaterialForReplace = { id: string; name: string };
type PendingInsertAfterWork = { id: string; name: string };

export function EstimateTable({
  estimateId,
  initialRows,
  initialCoefPercent,
}: {
  estimateId: string;
  initialRows: EstimateRow[];
  initialCoefPercent: number;
}) {
  const [rows, setRows] = useState(initialRows);
  const [coefPercent, setCoefPercent] = useState(initialCoefPercent);
  const [coefInputValue, setCoefInputValue] = useState(
    String(initialCoefPercent),
  );
  const [isCoefficientDialogOpen, setIsCoefficientDialogOpen] = useState(false);
  const [isApplyingCoefficient, setIsApplyingCoefficient] = useState(false);
  const [expandedWorkIds, setExpandedWorkIds] = useState<Set<string>>(
    new Set(rows.filter((r) => r.kind === "work").map((r) => r.id)),
  );
  const [isCalculationModeOpen, setIsCalculationModeOpen] = useState(false);
  const [activeWorkForMaterial, setActiveWorkForMaterial] =
    useState<ActiveWorkForMaterial | null>(null);
  const [activeMaterialForReplace, setActiveMaterialForReplace] =
    useState<ActiveMaterialForReplace | null>(null);
  const [pendingInsertAfterWork, setPendingInsertAfterWork] =
    useState<PendingInsertAfterWork | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isSavePatternOpen, setIsSavePatternOpen] = useState(false);
  const [isApplyPatternOpen, setIsApplyPatternOpen] = useState(false);
  const [patternName, setPatternName] = useState("");
  const [patternDescription, setPatternDescription] = useState("");
  const [isPatternSaving, setIsPatternSaving] = useState(false);
  const [isPatternApplying, setIsPatternApplying] = useState(false);
  const [isPatternsLoading, setIsPatternsLoading] = useState(false);
  const [patterns, setPatterns] = useState<EstimatePatternListItem[]>([]);
  const [previewRows, setPreviewRows] = useState<EstimatePatternPreviewRow[]>([]);
  const [selectedPatternId, setSelectedPatternId] = useState<string | null>(null);
  const { toast } = useAppToast();

  const fetchPatterns = async () => {
    try {
      setIsPatternsLoading(true);
      const nextPatterns = await estimatePatternsActionRepo.list();
      setPatterns(nextPatterns);
    } catch (patternsError) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description:
          patternsError instanceof Error
            ? patternsError.message
            : "Не удалось загрузить шаблоны.",
      });
    } finally {
      setIsPatternsLoading(false);
    }
  };

  useEffect(() => {
    void fetchPatterns();
  }, []);

  // При открытии диалога «Применить шаблон» — авто-выбор первого шаблона
  useEffect(() => {
    if (isApplyPatternOpen && patterns.length > 0 && !selectedPatternId) {
      void previewPattern(patterns[0].id);
    }
  }, [isApplyPatternOpen, patterns]);

  const visibleRows = useMemo(
    () => getVisibleRows(rows, expandedWorkIds),
    [rows, expandedWorkIds],
  );
  const totals = useMemo(
    () =>
      rows.reduce(
        (acc, row) => {
          if (row.kind === "work") acc.works += row.sum || 0;
          if (row.kind === "material") acc.materials += row.sum || 0;
          return acc;
        },
        { works: 0, materials: 0 },
      ),
    [rows],
  );

  const addedWorkNames = useMemo(
    () => new Set(rows.filter((r) => r.kind === "work").map((r) => r.name)),
    [rows],
  );
  const addedMaterialNamesForActiveWork = useMemo(() => {
    if (!activeWorkForMaterial) return new Set<string>();
    return new Set(
      rows
        .filter(
          (r) =>
            r.kind === "material" &&
            r.parentWorkId === activeWorkForMaterial.id,
        )
        .map((r) => r.name),
    );
  }, [rows, activeWorkForMaterial]);

  const reloadRows = async () => {
    const refreshed = await estimatesActionRepo.list(estimateId);
    setRows(refreshed);
    window.dispatchEvent(
      new CustomEvent("estimate:coefficient-updated", {
        detail: { estimateId },
      }),
    );
  };

  const openCoefficientDialog = () => {
    setCoefInputValue(String(coefPercent));
    setIsCoefficientDialogOpen(true);
  };

  const applyCoefficient = async () => {
    const parsed = Number(coefInputValue.replace(",", "."));
    if (
      !Number.isFinite(parsed) ||
      parsed < ESTIMATE_COEF_MIN ||
      parsed > ESTIMATE_COEF_MAX
    ) {
      toast({
        variant: "destructive",
        title: "Некорректный коэффициент",
        description: `Введите число от ${ESTIMATE_COEF_MIN} до ${ESTIMATE_COEF_MAX}.`,
      });
      return;
    }

    try {
      setIsApplyingCoefficient(true);
      const result = await estimatesActionRepo.updateCoefficient(
        estimateId,
        parsed,
      );
      setCoefPercent(result.coefPercent);
      await reloadRows();
      setIsCoefficientDialogOpen(false);
      toast({
        title: "Коэффициент применён",
        description: `Текущий коэффициент: ${result.coefPercent}%`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description:
          error instanceof Error
            ? error.message
            : "Не удалось применить коэффициент.",
      });
    } finally {
      setIsApplyingCoefficient(false);
    }
  };

  const resetCoefficient = async () => {
    try {
      setIsApplyingCoefficient(true);
      await estimatesActionRepo.resetCoefficient(estimateId);
      setCoefPercent(0);
      setCoefInputValue("0");
      await reloadRows();
      setIsCoefficientDialogOpen(false);
      toast({ title: "Коэффициент сброшен" });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description:
          error instanceof Error
            ? error.message
            : "Не удалось сбросить коэффициент.",
      });
    } finally {
      setIsApplyingCoefficient(false);
    }
  };

  const patch = async (
    rowId: string,
    field: "name" | "qty" | "price" | "expense",
    rawValue: string,
  ) => {
    const previousRows = rows;
    let parsedValue = field === "name" ? rawValue : Number(rawValue);
    // Для количества разрешаем дробные значения (например, 10.5 м2), 
    // но округляем до 3 знаков для чистоты
    if (field === "qty") parsedValue = Math.round(Number(rawValue) * 1000) / 1000;

    const targetRow = rows.find((r) => r.id === rowId);
    if (!targetRow) return;

    const patchData: RowPatch = { [field]: parsedValue };

    // 1. Расчет базовой цены при изменении цены работы (с учетом коэффициента)
    if (field === "price" && targetRow.kind === "work") {
      patchData.price =
        Number(parsedValue) / getEstimateCoefMultiplier(coefPercent);
    }

    // 2. Двусторонняя связь Qty <-> Expense для материалов
    if (targetRow.kind === "material" && targetRow.parentWorkId) {
      const parentWork = rows.find((r) => r.id === targetRow.parentWorkId);
      if (parentWork) {
        if (field === "expense") {
          // Расход -> Количество
          const expense = Number(parsedValue);
          patchData.qty = expense > 0 ? Math.ceil(parentWork.qty * expense) : 1;
        } else if (field === "qty") {
          // Количество -> Расход
          const qty = Number(parsedValue);
          const calculatedExpense = parentWork.qty > 0 ? qty / parentWork.qty : 0;
          patchData.expense = Math.round(calculatedExpense * 10000) / 10000;
        }
      }
    }

    // 3. Оптимистичное обновление
    const optimistic = rows.map((row) => {
      if (row.id === rowId) {
        const updated = { ...row, ...patchData };
        if (field === "price" && row.kind === "work") {
          updated.price = Number(parsedValue);
          updated.basePrice = patchData.price;
        }
        if (field === "qty" || field === "price" || field === "expense") {
          updated.sum = updated.qty * updated.price;
        }
        return updated;
      }

      // Каскадное обновление количества материалов в UI при изменении объема работы (оптимистично)
      if (field === "qty" && targetRow.kind === "work" && row.parentWorkId === rowId) {
        const newWorkQty = Number(parsedValue);
        // Если расход у материала 0, но есть количество, пытаемся восстановить расход на лету
        const effectiveExpense = row.expense > 0 ? row.expense : (targetRow.qty > 0 ? row.qty / targetRow.qty : 0);
        const newChildQty = Math.round(newWorkQty * effectiveExpense * 1000) / 1000;
        return {
          ...row,
          expense: effectiveExpense,
          qty: newChildQty,
          sum: newChildQty * row.price
        };
      }

      return row;
    });

    setRows(optimistic);

    try {
      const updated = await estimatesActionRepo.patchRow(
        estimateId,
        rowId,
        patchData,
      );

      if (targetRow.kind === 'work' && field === 'qty') {
        // Если изменили объем работы, лучше перегрузить все строки, 
        // так как на сервере пересчитались все вложенные материалы
        await reloadRows();
      } else {
        setRows((currentRows) =>
          currentRows.map((row) => (row.id === rowId ? updated : row)),
        );
      }
    } catch {
      setRows(previousRows);
      toast({
        variant: "destructive",
        title: "Ошибка сохранения",
        description: "Не удалось сохранить изменение.",
      });
    }
  };


  const removeRow = async (rowId: string) => {
    /* unchanged logic */
    const previousRows = rows;
    const rowToRemove = previousRows.find((row) => row.id === rowId);
    if (!rowToRemove) return;
    const optimisticRows =
      rowToRemove.kind === "work"
        ? previousRows.filter(
          (row) => row.id !== rowId && row.parentWorkId !== rowId,
        )
        : previousRows.filter((row) => row.id !== rowId);
    setRows(optimisticRows);
    try {
      const result = await estimatesActionRepo.removeRow(estimateId, rowId);
      setRows((currentRows) =>
        currentRows.filter((row) => !result.removedIds.includes(row.id)),
      );
      if (rowToRemove.kind === "work")
        setExpandedWorkIds((prev) => {
          const next = new Set(prev);
          next.delete(rowToRemove.id);
          return next;
        });
      toast({ title: "Строка удалена", description: rowToRemove.name });
    } catch {
      setRows(previousRows);
      toast({
        variant: "destructive",
        title: "Ошибка удаления",
        description: "Не удалось удалить строку.",
      });
    }
  };

  const addMaterialFromCatalog = async (material: CatalogMaterial) => {
    if (!activeWorkForMaterial) return;
    try {
      const safePrice = Number(material.price);
      const created = await estimatesActionRepo.addMaterial(
        estimateId,
        activeWorkForMaterial.id,
        {
          name: material.name,
          materialId: material.id,
          unit: material.unit || "шт",
          imageUrl: material.imageUrl ?? null,
          price: Number.isFinite(safePrice) ? safePrice : 0,
          qty: 1,
        },
      );
      setRows((prev) => [...prev, created]);
      setExpandedWorkIds(
        (prev) => new Set([...prev, activeWorkForMaterial.id]),
      );
      toast({ title: "Материал добавлен", description: material.name });
    } catch {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось добавить материал из справочника.",
      });
    }
  };
  const replaceMaterialFromCatalog = async (material: CatalogMaterial) => {
    if (!activeMaterialForReplace) return;
    const targetMaterialId = activeMaterialForReplace.id;
    try {
      const safePrice = Number(material.price);
      const updated = await estimatesActionRepo.patchRow(
        estimateId,
        targetMaterialId,
        {
          name: material.name,
          materialId: material.id,
          unit: material.unit || "шт",
          imageUrl: material.imageUrl ?? null,
          price: Number.isFinite(safePrice) ? safePrice : 0,
        },
      );
      setRows((prev) =>
        prev.map((row) => (row.id === targetMaterialId ? updated : row)),
      );
      setActiveMaterialForReplace(null);
      toast({ title: "Материал обновлен", description: material.name });
    } catch {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось заменить материал.",
      });
    }
  };

  const insertWorkAfter = (workId: string, workName: string) => {
    setPendingInsertAfterWork({ id: workId, name: workName });
    setIsCalculationModeOpen(true);
  };

  const addWorkFromCatalog = async (catalogWork: CatalogWork) => {
    try {
      const safePrice = Number(catalogWork.price);
      const created = await estimatesActionRepo.addWork(estimateId, {
        name: catalogWork.name,
        unit: catalogWork.unit || "шт",
        price: Number.isFinite(safePrice) ? safePrice : 0,
        qty: 1,
        insertAfterWorkId: pendingInsertAfterWork?.id,
      });

      setRows((prev) => {
        if (prev.some((row) => row.id === created.id)) {
          return prev;
        }

        return [...prev, created].sort((left, right) => left.order - right.order);
      });
      setExpandedWorkIds((prev) => new Set([...prev, created.id]));
      setPendingInsertAfterWork(null);

      void reloadRows();

      toast({
        title: "Работа добавлена",
        description: pendingInsertAfterWork
          ? `Позиция добавлена ниже: ${pendingInsertAfterWork.name}`
          : catalogWork.name,
      });
    } catch {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось добавить работу из справочника.",
      });
    }
  };

  const importEstimate = async () => {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept =
      ".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

    fileInput.onchange = async () => {
      const file = fileInput.files?.[0];
      if (!file) {
        return;
      }

      const formData = new FormData();
      formData.append("file", file);

      try {
        setIsImporting(true);
        const response = await fetch(`/api/estimates/${estimateId}/import`, {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          let message = "Не удалось импортировать смету.";
          try {
            const payload = (await response.json()) as { message?: string };
            if (payload?.message) {
              message = payload.message;
            }
          } catch {
            void 0;
          }

          throw new Error(message);
        }

        await reloadRows();
        toast({
          title: "Импорт завершен",
          description: "Смета успешно обновлена из файла.",
        });
      } catch (importError) {
        toast({
          variant: "destructive",
          title: "Ошибка импорта",
          description:
            importError instanceof Error
              ? importError.message
              : "Не удалось импортировать смету.",
        });
      } finally {
        setIsImporting(false);
      }
    };

    fileInput.click();
  };

  const savePattern = async () => {
    if (!patternName.trim()) {
      toast({
        variant: "destructive",
        title: "Укажите название",
        description: "Для сохранения шаблона нужно заполнить название.",
      });
      return;
    }

    try {
      setIsPatternSaving(true);
      await estimatePatternsActionRepo.create({
        estimateId,
        name: patternName,
        description: patternDescription || undefined,
      });
      await fetchPatterns();
      setIsSavePatternOpen(false);
      setPatternName("");
      setPatternDescription("");
      toast({ title: "Шаблон сохранен" });
    } catch (saveError) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description:
          saveError instanceof Error
            ? saveError.message
            : "Не удалось сохранить шаблон.",
      });
    } finally {
      setIsPatternSaving(false);
    }
  };

  const previewPattern = async (patternId: string) => {
    try {
      setSelectedPatternId(patternId);
      const preview = await estimatePatternsActionRepo.preview(patternId);
      const sortedRows = [...preview.rows].sort((a, b) => a.order - b.order);
      setPreviewRows(sortedRows);
    } catch (previewError) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description:
          previewError instanceof Error
            ? previewError.message
            : "Не удалось показать превью шаблона.",
      });
    }
  };

  const applyPattern = async () => {
    if (!selectedPatternId) {
      toast({
        variant: "destructive",
        title: "Выберите шаблон",
        description: "Сначала выберите шаблон для применения.",
      });
      return;
    }

    try {
      setIsPatternApplying(true);
      await estimatePatternsActionRepo.apply({
        estimateId,
        patternId: selectedPatternId,
      });
      await reloadRows();
      setIsApplyPatternOpen(false);
      setSelectedPatternId(null);
      setPreviewRows([]);
      toast({ title: "Шаблон применен" });
    } catch (applyError) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description:
          applyError instanceof Error
            ? applyError.message
            : "Не удалось применить шаблон.",
      });
    } finally {
      setIsPatternApplying(false);
    }
  };

  const exportEstimate = async (format: "xlsx" | "pdf") => {
    /* unchanged */
    try {
      setIsExporting(true);
      const response = await fetch(
        `/api/estimates/${estimateId}/export?format=${format}`,
      );
      if (!response.ok) {
        let message = "Не удалось выгрузить смету.";
        try {
          const payload = (await response.json()) as { message?: string };
          if (payload?.message) message = payload.message;
        } catch {
          void 0;
        }
        throw new Error(message);
      }
      const blob = await response.blob();
      const disposition = response.headers.get("content-disposition");
      const fallbackName = `estimate.${format}`;
      const fileNameMatch = disposition?.match(/filename="?([^"]+)"?/i);
      const fileName = fileNameMatch?.[1] ?? fallbackName;
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(objectUrl);
      toast({
        title: "Экспорт завершен",
        description:
          format === "xlsx"
            ? "Excel-файл успешно сформирован."
            : "PDF-файл успешно сформирован.",
      });
    } catch (exportError) {
      toast({
        variant: "destructive",
        title: "Ошибка экспорта",
        description:
          exportError instanceof Error
            ? exportError.message
            : "Не удалось выгрузить смету.",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-3">
      <DataTable
        columns={getEstimateColumns({
          expandedWorkIds,
          onToggleExpand: (workId) =>
            setExpandedWorkIds((prev) => {
              const next = new Set(prev);
              if (next.has(workId)) next.delete(workId);
              else next.add(workId);
              return next;
            }),
          onPatch: patch,
          onOpenMaterialCatalog: (workId, workName) =>
            setActiveWorkForMaterial({ id: workId, name: workName }),
          onInsertWorkAfter: (workId, workName) =>
            insertWorkAfter(workId, workName),
          onReplaceMaterial: (materialId, materialName) =>
            setActiveMaterialForReplace({ id: materialId, name: materialName }),
          onRemoveRow: removeRow,
        })}
        data={visibleRows}
        filterColumn="name"
        filterPlaceholder="Поиск по строкам сметы..."
        height="580px"
        actions={
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 px-2 md:px-3"
              onClick={() => {
                setPendingInsertAfterWork(null);
                setIsCalculationModeOpen(true);
              }}
            >
              <Calculator className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="hidden sm:inline text-xs md:text-sm">
                Режим расчета
              </span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 px-2 md:px-3"
              onClick={() => setIsSavePatternOpen(true)}
            >
              <Save className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="hidden sm:inline text-xs md:text-sm">
                Сохранить
              </span>
            </Button>
            <div className="hidden lg:flex items-center gap-1.5">
              <Button variant="outline" size="sm" className="h-8 gap-1.5 px-3" onClick={() => setIsApplyPatternOpen(true)}>
                <FileStack className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs md:text-sm">Шаблон</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1.5 px-3"
                onClick={openCoefficientDialog}
              >
                <Percent className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs md:text-sm">Коэффициент</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1.5 px-3"
                onClick={() => void importEstimate()}
                disabled={isImporting}
              >
                <FileUp className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs md:text-sm">
                  {isImporting ? "Импорт..." : "Импорт"}
                </span>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1.5 px-3"
                    disabled={isExporting}
                  >
                    <FileDown className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-xs md:text-sm">
                      {isExporting ? "Экспорт..." : "Экспорт"}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem
                    className="gap-2"
                    onClick={() => void exportEstimate("xlsx")}
                  >
                    <FileDown className="h-4 w-4 text-muted-foreground" />
                    <span>Экспорт в Excel (.xlsx)</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="gap-2"
                    onClick={() => void exportEstimate("pdf")}
                  >
                    <FileDown className="h-4 w-4 text-muted-foreground" />
                    <span>Экспорт в PDF (.pdf)</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="lg:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon-sm">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">More actions</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem className="gap-2" onClick={() => setIsApplyPatternOpen(true)}>
                    <FileStack className="h-4 w-4 text-muted-foreground" />
                    <span>Шаблон</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="gap-2"
                    onClick={openCoefficientDialog}
                  >
                    <Percent className="h-4 w-4 text-muted-foreground" />
                    <span>Коэффициент</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="gap-2"
                    disabled={isImporting}
                    onClick={() => void importEstimate()}
                  >
                    <FileUp className="h-4 w-4 text-muted-foreground" />
                    <span>{isImporting ? "Импорт..." : "Импорт"}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="gap-2"
                    disabled={isExporting}
                    onClick={() => void exportEstimate("xlsx")}
                  >
                    <FileDown className="h-4 w-4 text-muted-foreground" />
                    <span>Экспорт в Excel</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="gap-2"
                    disabled={isExporting}
                    onClick={() => void exportEstimate("pdf")}
                  >
                    <FileDown className="h-4 w-4 text-muted-foreground" />
                    <span>Экспорт в PDF</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <Button
              variant="destructive"
              size="sm"
              className="h-8 gap-1.5 px-2 md:px-3"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline text-xs md:text-sm">
                Удалить
              </span>
            </Button>
          </div>
        }
      />
      <div className="flex flex-wrap items-center justify-end gap-2 px-1">
        <Badge variant="outline" className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg border bg-muted/30 hover:bg-muted/30 text-foreground font-normal">
          <span className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wider">Работы:</span>
          <span className="text-xs sm:text-sm font-semibold tabular-nums">
            {new Intl.NumberFormat("ru-RU", { style: 'currency', currency: 'RUB', maximumFractionDigits: 2 }).format(totals.works)}
          </span>
        </Badge>
        <Badge variant="outline" className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg border bg-muted/30 hover:bg-muted/30 text-foreground font-normal">
          <span className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wider">Материалы:</span>
          <span className="text-xs sm:text-sm font-semibold tabular-nums">
            {new Intl.NumberFormat("ru-RU", { style: 'currency', currency: 'RUB', maximumFractionDigits: 2 }).format(totals.materials)}
          </span>
        </Badge>
        <Badge variant="outline" className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg border bg-muted/30 hover:bg-muted/30 text-foreground font-normal">
          <span className="text-[10px] sm:text-xs font-medium uppercase tracking-wider">Итого:</span>
          <span className="text-xs sm:text-sm font-bold tabular-nums">
            {new Intl.NumberFormat("ru-RU", { style: 'currency', currency: 'RUB', maximumFractionDigits: 2 }).format(totals.works + totals.materials)}
          </span>
        </Badge>
      </div>
      <Sheet
        open={isCalculationModeOpen}
        onOpenChange={(nextOpen) => {
          setIsCalculationModeOpen(nextOpen);
          if (!nextOpen) {
            setPendingInsertAfterWork(null);
          }
        }}
      >
        <SheetContent
          side="right"
          className="w-full sm:max-w-xl p-0 flex flex-col"
        >
          <div className="p-6 border-b">
            <SheetTitle className="text-xl md:text-2xl">
              Справочник работ
            </SheetTitle>
            <SheetDescription className="text-sm space-y-1">
              <span>
                Выберите необходимые позиции для автоматического добавления в
                смету.
              </span>
              {pendingInsertAfterWork ? (
                <span className="block text-primary font-medium">
                  Режим вставки: ниже работы «{pendingInsertAfterWork.name}»
                </span>
              ) : null}
            </SheetDescription>
          </div>
          <div className="flex-1 overflow-hidden flex flex-col">
            <WorkCatalogPicker
              onAddWork={addWorkFromCatalog}
              addedWorkNames={addedWorkNames}
            />
          </div>
        </SheetContent>
      </Sheet>
      <MaterialCatalogDialog
        isOpen={Boolean(activeWorkForMaterial)}
        onClose={() => setActiveWorkForMaterial(null)}
        onSelect={addMaterialFromCatalog}
        parentWorkName={activeWorkForMaterial?.name ?? ""}
        addedMaterialNames={addedMaterialNamesForActiveWork}
      />
      <MaterialCatalogDialog
        isOpen={Boolean(activeMaterialForReplace)}
        onClose={() => setActiveMaterialForReplace(null)}
        onSelect={replaceMaterialFromCatalog}
        parentWorkName={activeMaterialForReplace?.name ?? ""}
        mode="replace"
      />
      <Dialog
        open={isCoefficientDialogOpen}
        onOpenChange={setIsCoefficientDialogOpen}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Коэффициент сметы</DialogTitle>
            <DialogDescription>
              Введите процент для пересчета единичных расценок работ. Материалы
              не изменяются.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="estimate-coef">Коэффициент, %</Label>
            <Input
              id="estimate-coef"
              value={coefInputValue}
              onChange={(event) => setCoefInputValue(event.target.value)}
              placeholder="Например: 20"
            />
            <p className="text-xs text-muted-foreground">
              Допустимый диапазон: от {ESTIMATE_COEF_MIN}% до{" "}
              {ESTIMATE_COEF_MAX}%.
            </p>
          </div>
          <DialogFooter className="gap-2 sm:justify-between">
            <Button
              variant="outline"
              onClick={() => setIsCoefficientDialogOpen(false)}
              disabled={isApplyingCoefficient}
            >
              Отмена
            </Button>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                onClick={() => void resetCoefficient()}
                disabled={isApplyingCoefficient || coefPercent === 0}
              >
                Сбросить
              </Button>
              <Button
                onClick={() => void applyCoefficient()}
                disabled={isApplyingCoefficient}
              >
                {isApplyingCoefficient ? "Сохранение..." : "Применить"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={isSavePatternOpen} onOpenChange={setIsSavePatternOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Сохранить как шаблон</DialogTitle>
            <DialogDescription>
              Шаблон сохранится в разделе «Шаблоны» и будет доступен для быстрого
              применения в других сметах.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="pattern-name">Название</Label>
            <Input
              id="pattern-name"
              value={patternName}
              onChange={(event) => setPatternName(event.target.value)}
              placeholder="Например: Квартира 60м² — базовый ремонт"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pattern-description">Описание (опционально)</Label>
            <Input
              id="pattern-description"
              value={patternDescription}
              onChange={(event) => setPatternDescription(event.target.value)}
              placeholder="Краткое описание состава работ"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSavePatternOpen(false)}>
              Отмена
            </Button>
            <Button onClick={() => void savePattern()} disabled={isPatternSaving}>
              {isPatternSaving ? "Сохранение..." : "Сохранить шаблон"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={isApplyPatternOpen} onOpenChange={setIsApplyPatternOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Применить шаблон</DialogTitle>
            <DialogDescription>
              Выберите сохраненный шаблон, просмотрите состав и примените его к
              текущей смете.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 md:grid-cols-[280px_1fr]">
            <div className="space-y-2 border rounded-md p-2 max-h-80 overflow-y-auto">
              {isPatternsLoading ? (
                <p className="text-sm text-muted-foreground">Загрузка шаблонов...</p>
              ) : null}
              {!isPatternsLoading && patterns.length === 0 ? (
                <p className="text-sm text-muted-foreground">Шаблоны еще не созданы.</p>
              ) : null}
              {patterns.map((pattern) => (
                <Button
                  key={pattern.id}
                  variant={selectedPatternId === pattern.id ? "secondary" : "ghost"}
                  className="w-full justify-start h-auto py-2"
                  onClick={() => void previewPattern(pattern.id)}
                >
                  <div className="text-left">
                    <div className="font-medium text-sm">{pattern.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {pattern.worksCount} работ / {pattern.materialsCount} материалов
                    </div>
                  </div>
                </Button>
              ))}
            </div>
            <div className="border rounded-md p-3 max-h-80 overflow-y-auto">
              {previewRows.length === 0 ? (
                <p className="text-sm text-muted-foreground">Выберите шаблон слева, чтобы посмотреть превью.</p>
              ) : (
                <div className="space-y-1 text-sm">
                  {previewRows.map((row) => (
                    <div key={row.tempKey} className="flex items-center justify-between gap-3 py-1 border-b last:border-b-0">
                      <div className={row.kind === "material" ? "pl-4 text-muted-foreground" : "font-medium"}>{row.code} {row.name}</div>
                      <div className="text-xs text-muted-foreground">{row.qty} {row.unit} × {row.price.toLocaleString("ru-RU")}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsApplyPatternOpen(false)}>
              Отмена
            </Button>
            <Button onClick={() => void applyPattern()} disabled={isPatternApplying || !selectedPatternId}>
              {isPatternApplying ? "Применение..." : "Применить шаблон"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
