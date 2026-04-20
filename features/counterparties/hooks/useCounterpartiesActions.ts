"use client";

import { useAppToast } from "@/components/providers/use-app-toast";
import { deleteCounterparty } from "@/app/actions/counterparties";
import { CounterpartyRow } from "@/shared/types/domain/counterparty-row";

interface DeleteOptions {
  onOptimisticDelete?: () => void;
  onRollback?: () => void;
  onSuccess?: (deleted: CounterpartyRow) => void;
}

export function useCounterpartiesActions() {
  const { toast } = useAppToast();

  const handleDelete = async (counterparty: CounterpartyRow, options?: DeleteOptions) => {
    if (!confirm("Вы уверены, что хотите удалить этого контрагента?")) {
      return;
    }

    options?.onOptimisticDelete?.();

    try {
      const result = await deleteCounterparty(counterparty.id);
      if (result.success) {
        toast({ title: "Контрагент удален" });
        options?.onSuccess?.(result.data);
      } else {
        options?.onRollback?.();
        toast({ variant: "destructive", title: result.message || "Не удалось удалить контрагента" });
      }
    } catch {
      options?.onRollback?.();
      toast({ variant: "destructive", title: "Не удалось удалить контрагента" });
    }
  };

  return { handleDelete };
}
