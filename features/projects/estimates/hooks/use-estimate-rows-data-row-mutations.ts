"use client";

import { useAppToast } from "@/components/providers/use-app-toast";
import { getEstimateCoefMultiplier } from "@/lib/utils/estimate-coefficient";
import { estimatesActionRepo } from "../repository/estimates.actions";
import { notifyEstimateRowsMutated } from "../lib/estimate-client-events";
import { RowPatch } from "../types/dto";
import { EstimateRowsStateModel } from "./use-estimate-rows-state";

interface UseEstimateRowsDataRowMutationsParams {
  estimateId: string;
  state: EstimateRowsStateModel;
  reloadRows: () => Promise<void>;
}

export function useEstimateRowsDataRowMutations({
  estimateId,
  state,
  reloadRows,
}: UseEstimateRowsDataRowMutationsParams) {
  const { toast } = useAppToast();

  const patch = async (
    rowId: string,
    field: "name" | "qty" | "price" | "expense",
    rawValue: string,
  ) => {
    const previousRows = state.rows;
    let parsedValue = field === "name" ? rawValue : Number(rawValue);

    if (field === "qty") {
      parsedValue = Math.round(Number(rawValue) * 1000) / 1000;
    }

    const targetRow = state.rows.find((row) => row.id === rowId);

    if (!targetRow) {
      return;
    }

    const patchData: RowPatch = { [field]: parsedValue };

    if (field === "price" && targetRow.kind === "work") {
      patchData.price =
        Number(parsedValue) / getEstimateCoefMultiplier(state.coefPercent);
    }

    if (targetRow.kind === "material" && targetRow.parentWorkId) {
      const parentWork = state.rows.find((row) => row.id === targetRow.parentWorkId);
      if (parentWork) {
        if (field === "expense") {
          const expense = Number(parsedValue);
          patchData.qty = expense > 0 ? Math.ceil(parentWork.qty * expense) : 1;
        } else if (field === "qty") {
          const qty = Number(parsedValue);
          const calculatedExpense = parentWork.qty > 0 ? qty / parentWork.qty : 0;
          patchData.expense = Math.round(calculatedExpense * 10000) / 10000;
        }
      }
    }

    const optimistic = state.rows.map((row) => {
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

      if (
        field === "qty" &&
        targetRow.kind === "work" &&
        row.parentWorkId === rowId
      ) {
        const newWorkQty = Number(parsedValue);
        const effectiveExpense =
          row.expense > 0
            ? row.expense
            : targetRow.qty > 0
              ? row.qty / targetRow.qty
              : 0;
        const newChildQty = Math.ceil(newWorkQty * effectiveExpense);

        return {
          ...row,
          expense: effectiveExpense,
          qty: newChildQty,
          sum: newChildQty * row.price,
        };
      }

      return row;
    });

    state._setRows(optimistic);

    try {
      const updated = await estimatesActionRepo.patchRow(estimateId, rowId, patchData);

      if (targetRow.kind === "work" && field === "qty") {
        await reloadRows();
      } else {
        state._setRows((currentRows) =>
          currentRows.map((row) => (row.id === rowId ? updated : row)),
        );
      }

      notifyEstimateRowsMutated(estimateId);
    } catch {
      state._setRows(previousRows);
      toast({
        variant: "destructive",
        title: "Ошибка сохранения",
        description: "Не удалось сохранить изменение.",
      });
    }
  };

  const removeRow = async (rowId: string) => {
    const previousRows = state.rows;
    const rowToRemove = previousRows.find((row) => row.id === rowId);

    if (!rowToRemove) {
      return;
    }

    const optimisticRows =
      rowToRemove.kind === "work"
        ? previousRows.filter(
            (row) => row.id !== rowId && row.parentWorkId !== rowId,
          )
        : previousRows.filter((row) => row.id !== rowId);

    state._setRows(optimisticRows);

    try {
      const result = await estimatesActionRepo.removeRow(estimateId, rowId);
      state._setRows((currentRows) =>
        currentRows.filter((row) => !result.removedIds.includes(row.id)),
      );

      if (rowToRemove.kind === "work") {
        state._setExpandedWorkIds((prev) => {
          const next = new Set(prev);
          next.delete(rowToRemove.id);
          return next;
        });
      }

      notifyEstimateRowsMutated(estimateId);
      toast({ title: "Строка удалена", description: rowToRemove.name });
    } catch {
      state._setRows(previousRows);
      toast({
        variant: "destructive",
        title: "Ошибка удаления",
        description: "Не удалось удалить строку.",
      });
    }
  };

  return {
    patch,
    removeRow,
  };
}
