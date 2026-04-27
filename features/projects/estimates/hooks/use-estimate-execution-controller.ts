"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAppToast } from "@/components/providers/use-app-toast";
import { CatalogWork } from "@/features/catalog/types/dto";
import {
  addEstimateCoefficientUpdatedListener,
  addEstimateRowsMutatedListener,
} from "../lib/estimate-client-events";
import { buildExtraWorkFromCatalog } from "../lib/execution-extra-work";
import { calculateExecutionTotals } from "../lib/execution-totals";
import { estimateExecutionActionsRepo } from "../repository/execution.actions";
import { EstimateExecutionRow, EstimateExecutionStatus } from "../types/execution.dto";
import { useEstimateExternalRefresh } from "./use-estimate-external-refresh";

type EstimateExecutionPatch = {
  actualQty?: number;
  actualPrice?: number;
  status?: EstimateExecutionStatus;
};

interface UseEstimateExecutionControllerParams {
  estimateId: string;
  initialRows?: EstimateExecutionRow[];
}

export function useEstimateExecutionController({
  estimateId,
  initialRows,
}: UseEstimateExecutionControllerParams) {
  const [rows, setRows] = useState<EstimateExecutionRow[]>(() => initialRows ?? []);
  const [isLoading, setIsLoading] = useState(() => initialRows === undefined);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const requestVersionRef = useRef<Record<string, number>>({});
  const { toast } = useAppToast();
  const router = useRouter();

  const loadRows = useCallback(
    async (silent = false) => {
      try {
        if (!silent) {
          setIsLoading(true);
        }

        setErrorMessage(null);
        const data = await estimateExecutionActionsRepo.list(estimateId);
        setRows(data);
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Не удалось загрузить выполнение сметы",
        );
      } finally {
        if (!silent) {
          setIsLoading(false);
        }
      }
    },
    [estimateId],
  );

  const reloadSilently = useCallback(() => {
    void loadRows(true);
  }, [loadRows]);

  const subscribeExternalRefresh = useCallback(
    (callback: () => void) => [
      addEstimateRowsMutatedListener(estimateId, callback),
      addEstimateCoefficientUpdatedListener(estimateId, callback),
    ],
    [estimateId],
  );

  useEffect(() => {
    if (initialRows !== undefined) {
      setRows(initialRows);
      setIsLoading(false);
      setErrorMessage(null);
      return;
    }

    void loadRows();
  }, [initialRows, loadRows]);

  useEstimateExternalRefresh({
    onRefresh: reloadSilently,
    subscribe: subscribeExternalRefresh,
  });

  const patchRow = useCallback(
    async (rowId: string, patch: EstimateExecutionPatch) => {
      requestVersionRef.current[rowId] =
        (requestVersionRef.current[rowId] ?? 0) + 1;
      const requestVersion = requestVersionRef.current[rowId];
      let previousRow: EstimateExecutionRow | null = null;

      setRows((currentRows) =>
        currentRows.map((row) => {
          if (row.id !== rowId) {
            return row;
          }

          previousRow = row;

          const nextQty = patch.actualQty ?? row.actualQty;
          const nextPrice = patch.actualPrice ?? row.actualPrice;

          return {
            ...row,
            ...patch,
            isCompleted: patch.status ? patch.status === "done" : row.isCompleted,
            actualQty: nextQty,
            actualPrice: nextPrice,
            actualSum: nextQty * nextPrice,
          };
        }),
      );

      try {
        const updated = await estimateExecutionActionsRepo.patch(
          estimateId,
          rowId,
          patch,
        );
        if (requestVersion !== requestVersionRef.current[rowId]) {
          return;
        }

        setRows((current) =>
          current.map((item) => (item.id === rowId ? { ...item, ...updated } : item)),
        );
        router.refresh();
      } catch (error) {
        const rollbackRow = previousRow;
        if (requestVersion === requestVersionRef.current[rowId] && rollbackRow) {
          setRows((current) =>
            current.map((row) => (row.id === rowId ? rollbackRow : row)),
          );
        }

        toast({
          variant: "destructive",
          title: "Ошибка",
          description:
            error instanceof Error
              ? error.message
              : "Не удалось сохранить изменения.",
        });
      }
    },
    [estimateId, router, toast],
  );

  const addExtraWorkFromCatalog = useCallback(
    async (catalogWork: CatalogWork) => {
      try {
        const created = await estimateExecutionActionsRepo.addExtraWork(
          estimateId,
          buildExtraWorkFromCatalog(catalogWork),
        );
        setRows((prev) => [...prev, created]);
        router.refresh();
        toast({
          title: "Работа добавлена во вкладку «Выполнение»",
          description: created.name,
        });
        return true;
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Ошибка",
          description:
            error instanceof Error
              ? error.message
              : "Не удалось добавить работу из справочника.",
        });
        return false;
      }
    },
    [estimateId, router, toast],
  );

  const handleExport = useCallback(() => {
    window.open(
      `/api/estimates/${estimateId}/export/execution`,
      "_blank",
      "noopener,noreferrer",
    );
  }, [estimateId]);

  const totals = useMemo(() => calculateExecutionTotals(rows), [rows]);
  const addedWorkNames = useMemo(
    () => new Set(rows.map((row) => row.name)),
    [rows],
  );

  return {
    rows,
    isLoading,
    errorMessage,
    patchRow,
    addExtraWorkFromCatalog,
    handleExport,
    totals,
    addedWorkNames,
    reloadRows: loadRows,
  };
}

export type EstimateExecutionControllerModel = ReturnType<
  typeof useEstimateExecutionController
>;
