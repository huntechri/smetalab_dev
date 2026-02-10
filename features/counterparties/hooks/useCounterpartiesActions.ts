"use client";

import { useToast } from "@/components/ui/use-toast";
import { deleteCounterparty } from "@/app/actions/counterparties";
import { CounterpartyRow } from "@/types/counterparty-row";

export function useCounterpartiesActions() {
  const { toast } = useToast();

  const handleDelete = async (counterparty: CounterpartyRow) => {
    if (!confirm("Вы уверены, что хотите удалить этого контрагента?")) {
      return;
    }

    try {
      const result = await deleteCounterparty(counterparty.id);
      if (result.success) {
        toast({ title: "Контрагент удален" });
      } else {
        toast({ variant: "destructive", title: result.message || "Не удалось удалить контрагента" });
      }
    } catch {
      toast({ variant: "destructive", title: "Не удалось удалить контрагента" });
    }
  };

  return { handleDelete };
}
