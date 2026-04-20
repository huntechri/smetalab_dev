"use client";

import { EstimateRow } from "../types/dto";
import { useEstimateImportExportController } from "./use-estimate-import-export-controller";
import { useEstimatePatternsController } from "./use-estimate-patterns-controller";
import { useEstimateRowsController } from "./use-estimate-rows-controller";

interface UseEstimateTableControllerParams {
  estimateId: string;
  initialRows: EstimateRow[];
  initialCoefPercent: number;
}

export function useEstimateTableController({
  estimateId,
  initialRows,
  initialCoefPercent,
}: UseEstimateTableControllerParams) {
  const rowsController = useEstimateRowsController({
    estimateId,
    initialRows,
    initialCoefPercent,
  });

  const patternsController = useEstimatePatternsController({
    estimateId,
    reloadRows: rowsController.reloadRows,
  });

  const importExportController = useEstimateImportExportController({
    estimateId,
    reloadRows: rowsController.reloadRows,
  });

  return {
    ...rowsController,
    ...patternsController,
    ...importExportController,
  };
}

export type EstimateTableController = ReturnType<typeof useEstimateTableController>;
