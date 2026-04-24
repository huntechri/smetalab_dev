"use client";

import { useAppToast } from "@/components/providers/use-app-toast";
import { CatalogMaterial, CatalogWork } from "@/features/catalog/types/dto";
import { estimatesActionRepo } from "../repository/estimates.actions";
import { notifyEstimateRowsMutated } from "../lib/estimate-client-events";
import { EstimateRowsStateModel } from "./use-estimate-rows-state";

interface UseEstimateRowsDataCatalogSectionParams {
  estimateId: string;
  state: EstimateRowsStateModel;
  reloadRows: () => Promise<void>;
}

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

      state._setRows((prev) => {
        const shifted = prev.map((row) => {
          if (row.order >= created.order) {
            return { ...row, order: row.order + 1 };
          }
          return row;
        });
        return [...shifted, created];
      });
      state._setExpandedWorkIds((prev) => new Set([...prev, activeWorkForMaterial.id]));
      notifyEstimateRowsMutated(estimateId);
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

    try {
      const safePrice = Number(catalogWork.price);
      const created = await estimatesActionRepo.addWork(estimateId, {
        name: catalogWork.name,
        unit: catalogWork.unit || "шт",
        price: Number.isFinite(safePrice) ? safePrice : 0,
        qty: 1,
        insertAfterWorkId: insertAfterWork?.id,
      });

      state._setRows((prev) => {
        const shifted = prev.map((row) => {
          if (row.order >= created.order) {
            return { ...row, order: row.order + 100 };
          }
          return row;
        });

        if (shifted.some((row) => row.id === created.id)) {
          return shifted;
        }

        return [...shifted, created];
      });

      state._setExpandedWorkIds((prev) => new Set([...prev, created.id]));

      if (insertAfterWork) {
        state.setPendingInsertAfterWork({ id: created.id, name: created.name });
      }

      notifyEstimateRowsMutated(estimateId);

      toast({
        title: "Работа добавлена",
        description: catalogWork.name,
      });
    } catch {
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
