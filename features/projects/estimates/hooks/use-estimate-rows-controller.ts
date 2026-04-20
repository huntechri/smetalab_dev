"use client";

import { EstimateRow } from "../types/dto";
import { useEstimateRowsData } from "./use-estimate-rows-data";
import { useEstimateRowsState } from "./use-estimate-rows-state";

interface UseEstimateRowsControllerParams {
  estimateId: string;
  initialRows: EstimateRow[];
  initialCoefPercent: number;
}

export function useEstimateRowsController({
  estimateId,
  initialRows,
  initialCoefPercent,
}: UseEstimateRowsControllerParams) {
  const rowsState = useEstimateRowsState({
    initialRows,
    initialCoefPercent,
  });

  const rowsData = useEstimateRowsData({
    estimateId,
    state: rowsState,
  });

  const {
    _setRows,
    _setCoefPercent,
    _setIsApplyingCoefficient,
    _setExpandedWorkIds,
    _setSectionInsertAfterRowId,
    _setSectionInsertBeforeRowId,
    ...rowsStatePublic
  } = rowsState;

  return {
    ...rowsStatePublic,
    ...rowsData,
  };
}
