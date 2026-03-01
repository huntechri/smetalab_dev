import type React from 'react';
import { useAppToast } from '@/components/providers/use-app-toast';
import { estimatesActionRepo } from '../repository/estimates.actions';
import type { EstimateMeta, EstimateStatus } from '../types/dto';

interface UpdateStatusPayload {
  estimateId: string;
  currentStatus: EstimateStatus;
  nextStatus: EstimateStatus;
  setRows: React.Dispatch<React.SetStateAction<EstimateMeta[]>>;
}

interface DeleteEstimatePayload {
  estimateId: string;
  estimateName: string;
  setRows?: React.Dispatch<React.SetStateAction<EstimateMeta[]>>;
}

export function useEstimateMutations() {
  const { toast } = useAppToast();

  async function updateEstimateStatus({ estimateId, currentStatus, nextStatus, setRows }: UpdateStatusPayload): Promise<void> {
    if (nextStatus === currentStatus) {
      return;
    }

    setRows((current) => current.map((item) => (item.id === estimateId ? { ...item, status: nextStatus } : item)));

    try {
      await estimatesActionRepo.updateStatus(estimateId, nextStatus);
    } catch (error) {
      setRows((current) => current.map((item) => (item.id === estimateId ? { ...item, status: currentStatus } : item)));
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось обновить статус сметы.',
      });
    }
  }

  async function deleteEstimate({ estimateId, estimateName, setRows }: DeleteEstimatePayload): Promise<boolean> {
    try {
      await estimatesActionRepo.delete(estimateId);
      setRows?.((current) => current.filter((item) => item.id !== estimateId));
      toast({
        title: 'Смета удалена',
        description: `Смета "${estimateName}" была успешно удалена.`,
      });
      return true;
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось удалить смету.',
      });
      return false;
    }
  }

  return {
    updateEstimateStatus,
    deleteEstimate,
  };
}
