"use client";

import { useToast } from "@/components/ui/use-toast";
import { deleteCounterparty } from "@/app/actions/counterparties";
import { CounterpartyRow } from "@/types/counterparty-row";

interface DeleteOptions {
  onOptimisticDelete?: () => void;
  onRollback?: () => void;
  onSuccess?: (deleted: CounterpartyRow) => void;
}

export function useCounterpartiesActions() {
  const { toast } = useToast();

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
