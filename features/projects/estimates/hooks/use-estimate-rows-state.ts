"use client";

import { useMemo, useState } from "react";
import { getVisibleRows } from "../lib/rows-visible";
import { getSectionTotals } from "../lib/section-totals";
import { EstimateRow } from "../types/dto";

type ActiveWorkForMaterial = { id: string; name: string };
type ActiveWorkForReplace = { id: string; name: string };
type ActiveMaterialForReplace = { id: string; name: string };
type PendingInsertAfterWork = { id: string; name: string };

interface UseEstimateRowsStateParams {
  initialRows: EstimateRow[];
  initialCoefPercent: number;
}

export function useEstimateRowsState({
  initialRows,
  initialCoefPercent,
}: UseEstimateRowsStateParams) {
  const [rows, setRows] = useState(initialRows);
  const [coefPercent, setCoefPercent] = useState(initialCoefPercent);
  const [coefInputValue, setCoefInputValue] = useState(
    String(initialCoefPercent),
  );
  const [isCoefficientDialogOpen, setIsCoefficientDialogOpen] = useState(false);
  const [isApplyingCoefficient, setIsApplyingCoefficient] = useState(false);
  const [expandedWorkIds, setExpandedWorkIds] = useState<Set<string>>(
    new Set(rows.filter((row) => row.kind === "work").map((row) => row.id)),
  );
  const [isCalculationModeOpen, setIsCalculationModeOpen] = useState(false);
  const [activeWorkForMaterial, setActiveWorkForMaterial] =
    useState<ActiveWorkForMaterial | null>(null);
  const [activeWorkForReplace, setActiveWorkForReplace] =
    useState<ActiveWorkForReplace | null>(null);
  const [activeMaterialForReplace, setActiveMaterialForReplace] =
    useState<ActiveMaterialForReplace | null>(null);
  const [pendingInsertAfterWork, setPendingInsertAfterWork] =
    useState<PendingInsertAfterWork | null>(null);
  const [isSectionDialogOpen, setIsSectionDialogOpen] = useState(false);
  const [sectionCodeInput, setSectionCodeInput] = useState("");
  const [sectionNameInput, setSectionNameInput] = useState("");
  const [sectionInsertAfterRowId, setSectionInsertAfterRowId] = useState<
    string | undefined
  >(undefined);
  const [sectionInsertBeforeRowId, setSectionInsertBeforeRowId] = useState<
    string | undefined
  >(undefined);

  const visibleRows = useMemo(
    () => getVisibleRows(rows, expandedWorkIds),
    [rows, expandedWorkIds],
  );

  const totals = useMemo(
    () =>
      rows.reduce(
        (acc, row) => {
          if (row.kind === "work") {
            acc.works += row.sum || 0;
          }

          if (row.kind === "material") {
            acc.materials += row.sum || 0;
          }

          return acc;
        },
        { works: 0, materials: 0 },
      ),
    [rows],
  );

  const sectionTotalsById = useMemo(() => getSectionTotals(rows), [rows]);

  const addedWorkNames = useMemo(
    () => new Set(rows.filter((row) => row.kind === "work").map((row) => row.name)),
    [rows],
  );

  const addedMaterialNamesForActiveWork = useMemo(() => {
    if (!activeWorkForMaterial) {
      return new Set<string>();
    }

    return new Set(
      rows
        .filter(
          (row) =>
            row.kind === "material" && row.parentWorkId === activeWorkForMaterial.id,
        )
        .map((row) => row.name),
    );
  }, [rows, activeWorkForMaterial]);

  const openCoefficientDialog = () => {
    setCoefInputValue(String(coefPercent));
    setIsCoefficientDialogOpen(true);
  };

  const toggleWorkExpand = (workId: string) => {
    setExpandedWorkIds((prev) => {
      const next = new Set(prev);
      if (next.has(workId)) {
        next.delete(workId);
      } else {
        next.add(workId);
      }
      return next;
    });
  };

  const openCalculationMode = () => {
    setPendingInsertAfterWork(null);
    setIsCalculationModeOpen(true);
  };

  const handleWorkCatalogOpenChange = (nextOpen: boolean) => {
    setIsCalculationModeOpen(nextOpen);
    if (!nextOpen) {
      setPendingInsertAfterWork(null);
      setActiveWorkForReplace(null);
    }
  };

  const openMaterialCatalog = (workId: string, workName: string) => {
    setActiveWorkForMaterial({ id: workId, name: workName });
  };

  const openMaterialReplaceDialog = (materialId: string, materialName: string) => {
    setActiveMaterialForReplace({ id: materialId, name: materialName });
  };

  const openWorkReplaceDialog = (workId: string, workName: string) => {
    setActiveWorkForReplace({ id: workId, name: workName });
  };

  const insertWorkAfter = (workId: string, workName: string) => {
    setPendingInsertAfterWork({ id: workId, name: workName });
    setIsCalculationModeOpen(true);
  };

  const openCreateSectionDialog = (insertAfterRowId?: string) => {
    setSectionCodeInput("");
    setSectionNameInput("");
    setSectionInsertAfterRowId(insertAfterRowId);
    setSectionInsertBeforeRowId(undefined);
    setIsSectionDialogOpen(true);
  };

  const openCreateSectionDialogBefore = (insertBeforeRowId: string) => {
    setSectionCodeInput("");
    setSectionNameInput("");
    setSectionInsertAfterRowId(undefined);
    setSectionInsertBeforeRowId(insertBeforeRowId);
    setIsSectionDialogOpen(true);
  };

  return {
    rows,
    visibleRows,
    totals,
    expandedWorkIds,
    sectionTotalsById,
    addedWorkNames,
    addedMaterialNamesForActiveWork,
    coefPercent,
    coefInputValue,
    setCoefInputValue,
    isCoefficientDialogOpen,
    setIsCoefficientDialogOpen,
    isApplyingCoefficient,
    isCalculationModeOpen,
    setIsCalculationModeOpen,
    activeWorkForMaterial,
    setActiveWorkForMaterial,
    activeWorkForReplace,
    setActiveWorkForReplace,
    activeMaterialForReplace,
    setActiveMaterialForReplace,
    pendingInsertAfterWork,
    setPendingInsertAfterWork,
    isSectionDialogOpen,
    setIsSectionDialogOpen,
    sectionCodeInput,
    setSectionCodeInput,
    sectionNameInput,
    setSectionNameInput,
    sectionInsertAfterRowId,
    sectionInsertBeforeRowId,
    openCoefficientDialog,
    openMaterialCatalog,
    openMaterialReplaceDialog,
    openWorkReplaceDialog,
    insertWorkAfter,
    openCreateSectionDialog,
    openCreateSectionDialogBefore,
    toggleWorkExpand,
    openCalculationMode,
    handleWorkCatalogOpenChange,
    _setRows: setRows,
    _setCoefPercent: setCoefPercent,
    _setIsApplyingCoefficient: setIsApplyingCoefficient,
    _setExpandedWorkIds: setExpandedWorkIds,
    _setSectionInsertAfterRowId: setSectionInsertAfterRowId,
    _setSectionInsertBeforeRowId: setSectionInsertBeforeRowId,
  };
}

export type EstimateRowsStateModel = ReturnType<typeof useEstimateRowsState>;
