'use client';

import { useToast } from '@/components/ui/use-toast';
import { deleteMaterialSupplier } from '@/app/actions/material-suppliers';
import { MaterialSupplierRow } from '@/types/material-supplier-row';

export function useMaterialSuppliersActions() {
  const { toast } = useToast();

  const handleDelete = async (materialSupplier: MaterialSupplierRow) => {
    if (!confirm('Вы уверены, что хотите удалить этого поставщика материалов?')) {
      return;
    }

    try {
      const result = await deleteMaterialSupplier(materialSupplier.id);
      if (result.success) {
        toast({ title: 'Поставщик материалов удален' });
      } else {
        toast({ variant: 'destructive', title: result.message || 'Не удалось удалить поставщика материалов' });
      }
    } catch {
      toast({ variant: 'destructive', title: 'Не удалось удалить поставщика материалов' });
    }
  };

  return { handleDelete };
}
