"use client";

import { useAppToast } from "@/components/providers/use-app-toast";
import { CatalogMaterial, CatalogWork } from "@/features/catalog/types/dto";
import { estimatesActionRepo } from "../repository/estimates.actions";
import { notifyEstimateRowsMutated } from "../lib/estimate-client-events";
import { EstimateRow } from "../types/dto";
import { EstimateRowsStateModel } from "./use-estimate-rows-state";

interface UseEstimateRowsDataCatalogSectionParams {
  estimateId: string;
  state: EstimateRowsStateModel;
  reloadRows: () => Promise<void>;
}

const createTempRowId = (prefix: string) => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

const getNextWorkCode = (rows: EstimateRow[]) => {
  const workCount = rows.filter((row) => row.kind === "work").length;
  return String(workCount + 1);
};

const getNextMaterialCode = (rows: EstimateRow[], parentWork: EstimateRow) => {
  const materialCount = rows.filter(
    (row) => row.kind === "material" && row.parentWorkId === parentWork.id,
  ).length;

  return `${parentWork.code}.${materialCount + 1}`;
};

const getOptimisticWorkOrder = (rows: EstimateRow[], insertAfterWorkId?: string) => {
  if (!insertAfterWorkId) {
    const maxOrder = rows.reduce((max, row) => Math.max(max, row.order), 0);
    return maxOrder + 100;
  }

  const anchor = rows.find((row) => row.id === insertAfterWorkId);
  if (!anchor) {
    const maxOrder = rows.reduce((max, row) => Math.max(max, row.order), 0);
    return maxOrder + 100;
  }

  const anchorGroup = anchor.kind === "work"
    ? rows.filter((row) => row.id === anchor.id || row.parentWorkId === anchor.id)
    : [anchor];
  const boundaryOrder = Math.max(...anchorGroup.map((row) => row.order));
  const nextRow = rows
    .filter((row) => row.order > boundaryOrder)
    .sort((left, right) => left.order - right.order)[0];

  if (!nextRow) {
    return boundaryOrder + 100;
  }

  const gap = nextRow.order - boundaryOrder;
  return gap > 1 ? boundaryOrder + Math.floor(gap / 2) : boundaryOrder + 0.5;
};

const getOptimisticMaterialOrder = (rows: EstimateRow[], parentWork: EstimateRow) => {
  const children = rows
    .filter((row) => row.parentWorkId === parentWork.id)
    .sort((left, right) => left.order - right.order);
  const boundaryOrder = children.at(-1)?.order ?? parentWork.order;
  const nextRow = rows
    .filter((row) => row.order > boundaryOrder)
    .sort((left, right) => left.order - right.order)[0];

  if (!nextRow) {
    return boundaryOrder + 1;
  }

  const gap = nextRow.order - boundaryOrder;
  return gap > 1 ? boundaryOrder + Math.floor(gap / 2) : boundaryOrder + 0.5;
};

export function useEstimateRowsDataCatalogSection({
  estimateId,
  state,
  reloadRows,
}: UseEstimateRowsDataCatalogSectionParams) {
  const { toast } = useAppToast();

  const addMaterialFromCatalog = async (material: CatalogMaterial) => {
    const activeWorkForMaterial = state.activeWorkForMaterial;

    if (!activeWorkForMaterial) {
      return;
    }

    const parentWork = state.rows.find((row) => row.id === activeWorkForMaterial.id && row.kind === "work");
    if (!parentWork) {
      return;
    }

    const safePrice = Number(material.price);
    const price = Number.isFinite(safePrice) ? safePrice : 0;
    const tempRowId = createTempRowId("temp-material");
    const optimisticRow: EstimateRow = {
      id: tempRowId,
      kind: "material",
      parentWorkId: parentWork.id,
      code: getNextMaterialCode(state.rows, parentWork),
      name: material.name,
      materialId: material.id,
      imageUrl: material.imageUrl ?? undefined,
      unit: material.unit || "шт",
      qty: 1,
      basePrice: price,
      price,
      sum: price,
      expense: parentWork.qty > 0 ? Math.round((1 / parentWork.qty) * 1000000) / 1000000 : 0,
      order: getOptimisticMaterialOrder(state.rows, parentWork),
    };

    state._setRows((prev) => [...prev, optimisticRow]);
    state._setExpandedWorkIds((prev) => new Set([...prev, parentWork.id]));

    try {
      const created = await estimatesActionRepo.addMaterial(
        estimateId,
        parentWork.id,
        {
          name: material.name,
          materialId: material.id,
          unit: material.unit || "шт",
          imageUrl: material.imageUrl ?? null,
          price,
          qty: 1,
        },
      );

      state._setRows((prev) => {
        if (prev.some((row) => row.id === tempRowId)) {
          return prev.map((row) => (row.id === tempRowId ? created : row));
        }

        return [...prev, created];
      });
      notifyEstimateRowsMutated(estimateId);
      toast({ title: "Материал добавлен", description: material.name });
    } catch {
      state._setRows((prev) => prev.filter((row) => row.id !== tempRowId));
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось добавить материал из справочника.",
      });
    }
  };

  const replaceMaterialFromCatalog = async (material: CatalogMaterial) => {
    if (!state.activeMaterialForReplace) {
      return;
    }

    const targetMaterialId = state.activeMaterialForReplace.id;

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

      state._setRows((prev) =>
        prev.map((row) => (row.id === targetMaterialId ? updated : row)),
      );
      state.setActiveMaterialForReplace(null);
      notifyEstimateRowsMutated(estimateId);
      toast({ title: "Материал обновлен", description: material.name });
    } catch {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось заменить материал.",
      });
    }
  };

  const replaceWorkFromCatalog = async (catalogWork: CatalogWork) => {
    if (!state.activeWorkForReplace) {
      return;
    }

    const targetWorkId = state.activeWorkForReplace.id;

    try {
      const safePrice = Number(catalogWork.price);
      const updated = await estimatesActionRepo.patchRow(estimateId, targetWorkId, {
        name: catalogWork.name,
        unit: catalogWork.unit || "шт",
        price: Number.isFinite(safePrice) ? safePrice : 0,
      });

      state._setRows((prev) =>
        prev.map((row) => (row.id === targetWorkId ? updated : row)),
      );
      state.setActiveWorkForReplace(null);
      notifyEstimateRowsMutated(estimateId);
      toast({ title: "Работа заменена", description: catalogWork.name });
    } catch {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось заменить работу.",
      });
    }
  };

  const addWorkFromCatalog = async (catalogWork: CatalogWork) => {
    const insertAfterWork = state.pendingInsertAfterWork;
    const safePrice = Number(catalogWork.price);
    const basePrice = Number.isFinite(safePrice) ? safePrice : 0;
    const tempRowId = createTempRowId("temp-work");
    const optimisticRow: EstimateRow = {
      id: tempRowId,
      kind: "work",
      code: getNextWorkCode(state.rows),
      name: catalogWork.name,
      unit: catalogWork.unit || "шт",
      qty: 1,
      basePrice,
      price: basePrice,
      sum: basePrice,
      expense: 0,
      order: getOptimisticWorkOrder(state.rows, insertAfterWork?.id),
    };

    state._setRows((prev) => [...prev, optimisticRow]);
    state._setExpandedWorkIds((prev) => new Set([...prev, tempRowId]));

    try {
      const created = await estimatesActionRepo.addWork(estimateId, {
        name: catalogWork.name,
        unit: catalogWork.unit || "шт",
        price: basePrice,
        qty: 1,
        insertAfterWorkId: insertAfterWork?.id,
      });

      state._setRows((prev) => {
        if (prev.some((row) => row.id === tempRowId)) {
          return prev.map((row) => (row.id === tempRowId ? created : row));
        }

        return [...prev, created];
      });

      state._setExpandedWorkIds((prev) => {
        const next = new Set(prev);
        next.delete(tempRowId);
        next.add(created.id);
        return next;
      });

      if (insertAfterWork) {
        state.setPendingInsertAfterWork({ id: created.id, name: created.name });
      }

      notifyEstimateRowsMutated(estimateId);

      toast({
        title: "Работа добавлена",
        description: catalogWork.name,
      });
    } catch {
      state._setRows((prev) => prev.filter((row) => row.id !== tempRowId));
      state._setExpandedWorkIds((prev) => {
        const next = new Set(prev);
        next.delete(tempRowId);
        return next;
      });
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось добавить работу из справочника.",
      });
    }
  };

  const createSection = async () => {
    if (!state.sectionCodeInput.trim() || !state.sectionNameInput.trim()) {
      toast({
        variant: "destructive",
        title: "Заполните поля",
        description: "Укажите номер и название раздела.",
      });
      return;
    }

    try {
      const created = await estimatesActionRepo.addSection(estimateId, {
        code: state.sectionCodeInput.trim(),
        name: state.sectionNameInput.trim(),
        insertAfterRowId: state.sectionInsertAfterRowId,
        insertBeforeRowId: state.sectionInsertBeforeRowId,
      });

      state._setRows((prev) => {
        const shifted = prev.map((row) => {
          if (row.order >= created.order) {
            return { ...row, order: row.order + 1 };
          }
          return row;
        });
        return [...shifted, created];
      });
      state.setIsSectionDialogOpen(false);
      state._setSectionInsertAfterRowId(undefined);
      state._setSectionInsertBeforeRowId(undefined);
      notifyEstimateRowsMutated(estimateId);
      toast({ title: "Раздел добавлен", description: `${created.code} ${created.name}` });
      void reloadRows();
    } catch (addSectionError) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description:
          addSectionError instanceof Error
            ? addSectionError.message
            : "Не удалось добавить раздел.",
      });
    }
  };

  return {
    addMaterialFromCatalog,
    replaceMaterialFromCatalog,
    replaceWorkFromCatalog,
    addWorkFromCatalog,
    createSection,
  };
}
