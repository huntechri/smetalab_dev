"use client";

import { useAppToast } from "@/components/providers/use-app-toast";
import {
  ESTIMATE_COEF_MAX,
  ESTIMATE_COEF_MIN,
} from "@/lib/utils/estimate-coefficient";
import { estimatesActionRepo } from "../repository/estimates.actions";
import { EstimateRowsStateModel } from "./use-estimate-rows-state";

interface UseEstimateRowsDataCoefficientParams {
  estimateId: string;
  state: EstimateRowsStateModel;
  reloadRows: () => Promise<void>;
}

export function useEstimateRowsDataCoefficient({
  estimateId,
  state,
  reloadRows,
}: UseEstimateRowsDataCoefficientParams) {
  const { toast } = useAppToast();

  const applyCoefficient = async () => {
    const parsed = Number(state.coefInputValue.replace(",", "."));

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
      state._setIsApplyingCoefficient(true);
      const result = await estimatesActionRepo.updateCoefficient(estimateId, parsed);
      state._setCoefPercent(result.coefPercent);
      await reloadRows();
      state.setIsCoefficientDialogOpen(false);
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
      state._setIsApplyingCoefficient(false);
    }
  };

  const resetCoefficient = async () => {
    try {
      state._setIsApplyingCoefficient(true);
      await estimatesActionRepo.resetCoefficient(estimateId);
      state._setCoefPercent(0);
      state.setCoefInputValue("0");
      await reloadRows();
      state.setIsCoefficientDialogOpen(false);
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
      state._setIsApplyingCoefficient(false);
    }
  };

  return {
    applyCoefficient,
    resetCoefficient,
  };
}
