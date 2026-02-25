'use client';

import { useToast } from '@/components/ui/use-toast';
import { deleteMaterialSupplier } from '@/app/actions/material-suppliers';
import { MaterialSupplierRow } from '@/types/material-supplier-row';

type DeleteCallbacks = {
  onOptimisticDelete: (id: string) => MaterialSupplierRow | null;
  onRollbackDelete: (supplier: MaterialSupplierRow) => void;
  onDeleteSettled?: () => void;
  onDeleteSuccess?: () => void;
};

export function useMaterialSuppliersActions() {
  const { toast } = useToast();

  const handleDelete = async (materialSupplier: MaterialSupplierRow, callbacks?: DeleteCallbacks) => {
    if (!confirm('Вы уверены, что хотите удалить этого поставщика материалов?')) {
      return;
    }

    const removed = callbacks?.onOptimisticDelete(materialSupplier.id) ?? null;

    try {
      const result = await deleteMaterialSupplier(materialSupplier.id);
      if (result.success) {
        callbacks?.onDeleteSuccess?.();
        toast({ title: 'Поставщик материалов удален' });
      } else {
        if (removed) {
          callbacks?.onRollbackDelete(removed);
        }
        toast({ variant: 'destructive', title: result.message || 'Не удалось удалить поставщика материалов' });
      }
    } catch {
      if (removed) {
        callbacks?.onRollbackDelete(removed);
      }
      toast({ variant: 'destructive', title: 'Не удалось удалить поставщика материалов' });
    } finally {
      callbacks?.onDeleteSettled?.();
    }
  };

  return { handleDelete };
}
