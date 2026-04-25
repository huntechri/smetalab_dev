import { useState } from 'react';
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/shared/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/shared/ui/command';
import type { PurchaseRow, PurchaseRowPatch, SupplierOption } from '../../types/dto';

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
        <Button
          type="button"
          variant="ghost"
          size="xs"
          disabled={disabled}
          aria-label="Назначить поставщика"
          className="h-6 sm:h-5 max-w-full justify-start gap-1 rounded-full border border-slate-200 bg-slate-50 px-1.5 text-[11px] sm:text-[10px] font-semibold text-slate-700 hover:bg-slate-100"
        >
          {disabled ? (
            <Loader2 className="size-3 shrink-0 animate-spin" aria-hidden="true" />
          ) : (
            <span
              className="size-2.5 shrink-0 rounded-full bg-muted-foreground/40"
              style={color ? { backgroundColor: color } : undefined}
              aria-hidden="true"
            />
          )}
          <span className="truncate">{name || 'Без поставщика'}</span>
          <ChevronsUpDown className="size-3 shrink-0 opacity-60" aria-hidden="true" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[min(20rem,calc(100vw-2rem))] p-0" align="start">
        <Command>
          <CommandInput placeholder="Поиск поставщика..." />
          <CommandList>
            <CommandEmpty>Поставщик не найден.</CommandEmpty>
            <CommandGroup>
              {name ? (
                <CommandItem onSelect={() => void handleSelect(null)}>
                  <span className="size-2.5 rounded-full bg-muted-foreground/40" aria-hidden="true" />
                  Снять поставщика
                </CommandItem>
              ) : null}
              {supplierOptions.map((supplier) => (
                <CommandItem key={supplier.id} value={`${supplier.name} ${supplier.color}`} onSelect={() => void handleSelect(supplier.id)}>
                  <Check className={cn('size-4', supplier.id === row.supplierId ? 'opacity-100' : 'opacity-0')} />
                  <span className="size-2.5 rounded-full" style={{ backgroundColor: supplier.color }} aria-hidden="true" />
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
