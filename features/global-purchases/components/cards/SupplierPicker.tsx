import { useState } from 'react';
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DenseListColorIndicator,
  DenseListPickerButton,
  denseListPickerPopoverClassName,
} from '@/shared/ui/dense-list';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/shared/ui/command';
import type { PurchaseRow, PurchaseRowPatch, SupplierOption } from '@/shared/types/domain/purchase-row';

type SupplierPickerProps = {
  row: PurchaseRow;
  supplierOptions: SupplierOption[];
  disabled: boolean;
  onPatchAction: (rowId: string, patch: PurchaseRowPatch) => Promise<void>;
};

export function SupplierPicker({ row, supplierOptions, disabled, onPatchAction }: SupplierPickerProps) {
  const [open, setOpen] = useState(false);
  const current = row.supplierId ? supplierOptions.find((supplier) => supplier.id === row.supplierId) : null;
  const name = current?.name ?? row.supplierName;
  const color = current?.color ?? row.supplierColor;

  const handleSelect = async (supplierId: string | null) => {
    try {
      await onPatchAction(row.id, { supplierId });
      setOpen(false);
    } catch {
      // Toast and rollback are handled by the parent/controller layer.
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <DenseListPickerButton
          disabled={disabled}
          aria-label="Назначить поставщика"
        >
          {disabled ? (
            <Loader2 className="size-3 shrink-0 animate-spin" aria-hidden="true" />
          ) : (
            <DenseListColorIndicator color={color} />
          )}
          <span className="truncate">{name || 'Без поставщика'}</span>
          <ChevronsUpDown className="size-3 shrink-0 opacity-60" aria-hidden="true" />
        </DenseListPickerButton>
      </PopoverTrigger>
      <PopoverContent className={denseListPickerPopoverClassName} align="start">
        <Command>
          <CommandInput placeholder="Поиск поставщика..." />
          <CommandList>
            <CommandEmpty>Поставщик не найден.</CommandEmpty>
            <CommandGroup>
              {name ? (
                <CommandItem onSelect={() => void handleSelect(null)}>
                  <DenseListColorIndicator />
                  Снять поставщика
                </CommandItem>
              ) : null}
              {supplierOptions.map((supplier) => (
                <CommandItem key={supplier.id} value={`${supplier.name} ${supplier.color}`} onSelect={() => void handleSelect(supplier.id)}>
                  <Check className={cn('size-4', supplier.id === row.supplierId ? 'opacity-100' : 'opacity-0')} />
                  <DenseListColorIndicator color={supplier.color} />
                  <span className="truncate">{supplier.name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
