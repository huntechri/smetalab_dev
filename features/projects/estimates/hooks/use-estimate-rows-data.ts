"use client";

import { estimatesActionRepo } from "../repository/estimates.actions";
import { notifyEstimateCoefficientUpdated } from "../lib/estimate-client-events";
import { EstimateRowsStateModel } from "./use-estimate-rows-state";
import { useEstimateRowsDataCatalogSection } from "./use-estimate-rows-data-catalog-section";
import { useEstimateRowsDataCoefficient } from "./use-estimate-rows-data-coefficient";
import { useEstimateRowsDataRowMutations } from "./use-estimate-rows-data-row-mutations";

interface UseEstimateRowsDataParams {
  estimateId: string;
  state: EstimateRowsStateModel;
}

export function useEstimateRowsData({ estimateId, state }: UseEstimateRowsDataParams) {
  const reloadRows = async () => {
    const refreshed = await estimatesActionRepo.list(estimateId);
    state._setRows(refreshed);
    notifyEstimateCoefficientUpdated(estimateId);
  };

  const coefficientActions = useEstimateRowsDataCoefficient({
    estimateId,
    state,
    reloadRows,
  });

  const rowMutationActions = useEstimateRowsDataRowMutations({
    estimateId,
    state,
    reloadRows,
  });

  const catalogSectionActions = useEstimateRowsDataCatalogSection({
    estimateId,
    state,
    reloadRows,
  });

  return {
    reloadRows,
    ...coefficientActions,
    ...rowMutationActions,
    ...catalogSectionActions,
  };
}
