'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ColumnDef } from '@tanstack/react-table';
import { Check, ChevronsUpDown, Loader2, Trash2 } from 'lucide-react';
import { EditableCell } from '@/features/projects/estimates/components/table/cells/EditableCell';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { parseIsoDateSafe } from '../lib/date';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { cn } from '@/lib/utils';
import type { ProjectOption, PurchaseRow, PurchaseRowPatch, SupplierOption } from '../types/dto';

const amountFormatter = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 2 });
const dateFormatter = new Intl.DateTimeFormat('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });

type GlobalPurchasesColumnActions = {
  projectOptions: ProjectOption[];
  supplierOptions: SupplierOption[];
  pendingIds: Set<string>;
  onPatchAction: (rowId: string, patch: PurchaseRowPatch) => Promise<void>;
  onRemoveAction: (rowId: string) => Promise<void>;
};

const SupplierBadgePicker = React.memo(function SupplierBadgePicker({
  row,
  options,
  disabled,
  onPatchAction,
}: {
  row: PurchaseRow;
  options: SupplierOption[];
  disabled: boolean;
  onPatchAction: (rowId: string, patch: PurchaseRowPatch) => Promise<void>;
}) {
  const [open, setOpen] = React.useState(false);

  const current = row.supplierId ? options.find((item) => item.id === row.supplierId) : null;
  const name = current?.name ?? row.supplierName;
  const color = current?.color ?? row.supplierColor;

  const handleSelect = async (supplierId: string | null) => {
    await onPatchAction(row.id, { supplierId });
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn('h-7 px-2 gap-1 max-w-[220px] justify-start border border-transparent hover:border-border', !name && 'text-muted-foreground')}
          disabled={disabled}
          aria-label="Назначить поставщика"
        >
          {disabled ? (
            <Loader2 className="size-3 animate-spin" />
          ) : color ? (
            <span className="size-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} aria-hidden="true" />
          ) : (
            <span className="size-2.5 rounded-full bg-muted-foreground/40 shrink-0" aria-hidden="true" />
          )}
          {name ? <Badge variant="secondary" className="h-5 px-1.5 truncate">{name}</Badge> : <span className="text-xs">Поставщик</span>}
          <ChevronsUpDown className="size-3 opacity-60" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-0" align="start">
        <Command>
          <CommandInput placeholder="Поиск поставщика..." />
          <CommandList>
            <CommandEmpty>Поставщик не найден.</CommandEmpty>
            <CommandGroup>
              {name && (
                <CommandItem onSelect={() => void handleSelect(null)}>
                  <span className="size-2.5 rounded-full bg-muted-foreground/40" />
                  Снять поставщика
                </CommandItem>
              )}
              {options.map((supplier) => (
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
});

const ProjectCell = React.memo(function ProjectCell({
  projectId,
  rowId,
  onPatchAction,
  projectOptions,
  disabled,
}: {
  projectId: string | null;
  rowId: string;
  onPatchAction: (rowId: string, patch: PurchaseRowPatch) => Promise<void>;
  projectOptions: ProjectOption[];
  disabled?: boolean;
}) {
  return (
    <Select
      value={projectId ?? 'none'}
      onValueChange={(value) => void onPatchAction(rowId, { projectId: value === 'none' ? null : value })}
      disabled={disabled}
    >
      <SelectTrigger className="h-8" aria-label="Выберите объект">
        <SelectValue placeholder="Выберите объект" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="none">Без привязки</SelectItem>
        {projectOptions.map((project) => (
          <SelectItem key={project.id} value={project.id}>{project.name}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
});

const DeleteRowAction = React.memo(function DeleteRowAction({ rowId, onRemoveAction, materialName, disabled }: {
  rowId: string;
  onRemoveAction: (rowId: string) => Promise<void>;
  materialName: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive transition-colors" onClick={() => setOpen(true)} disabled={disabled} aria-label="Удалить строку">
            <Trash2 className="size-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Удалить строку закупки</TooltipContent>
      </Tooltip>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
          <AlertDialogHeader>
            <AlertDialogTitle>Вы уверены?</AlertDialogTitle>
            <AlertDialogDescription>Закупка {materialName ? `"${materialName}"` : 'этого материала'} будет удалена безвозвратно.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={disabled}>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={async (event) => {
                event.preventDefault();
                await onRemoveAction(rowId);
                if (open) setOpen(false);
              }}
              className="bg-red-700 text-white hover:bg-red-800"
              disabled={disabled}
            >
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
});

export function getGlobalPurchasesColumns({
  projectOptions,
  supplierOptions,
  pendingIds,
  onPatchAction,
  onRemoveAction,
}: GlobalPurchasesColumnActions): ColumnDef<PurchaseRow>[] {
  return [
    {
      accessorKey: 'projectName',
      header: 'Объект',
      size: 260,
      minSize: 240,
      cell: ({ row }) => (
        <ProjectCell
          projectId={row.original.projectId}
          rowId={row.original.id}
          onPatchAction={onPatchAction}
          projectOptions={projectOptions}
          disabled={pendingIds.has(row.original.id)}
        />
      ),
    },
    {
      accessorKey: 'purchaseDate',
      header: 'Дата',
      size: 125,
      minSize: 115,
      cell: ({ row }) => {
        const dateString = row.original.purchaseDate;
        const isPending = pendingIds.has(row.original.id);
        let displayValue = dateString;
        try {
          displayValue = dateFormatter.format(parseIsoDateSafe(dateString));
        } catch {
          // no-op
        }

        return (
          <EditableCell
            type="date"
            value={dateString}
            displayValue={displayValue}
            disabled={isPending}
            ariaLabel="Дата закупки"
            onCommit={(value) => onPatchAction(row.original.id, { purchaseDate: value })}
          />
        );
      },
    },
    {
      accessorKey: 'materialName',
      header: 'Наименование материала',
      size: 460,
      minSize: 380,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <SupplierBadgePicker
            row={row.original}
            options={supplierOptions}
            disabled={pendingIds.has(row.original.id)}
            onPatchAction={onPatchAction}
          />
          <EditableCell
            value={row.original.materialName}
            disabled={pendingIds.has(row.original.id)}
            ariaLabel="Наименование материала"
            onCommit={(value) => onPatchAction(row.original.id, { materialName: value })}
          />
        </div>
      ),
    },
    {
      accessorKey: 'unit',
      header: 'Ед. изм.',
      size: 100,
      minSize: 90,
      cell: ({ row }) => (
        <EditableCell
          value={row.original.unit}
          disabled={pendingIds.has(row.original.id)}
          ariaLabel="Единица измерения"
          onCommit={(value) => onPatchAction(row.original.id, { unit: value })}
        />
      ),
    },
    {
      accessorKey: 'qty',
      header: () => <div className="text-right">Кол-во</div>,
      size: 110,
      minSize: 90,
      cell: ({ row }) => (
        <div className="text-right">
          <EditableCell
            type="number"
            align="right"
            clearOnFocus
            cancelOnEmpty
            value={row.original.qty}
            disabled={pendingIds.has(row.original.id)}
            ariaLabel="Количество"
            onCommit={(value) => onPatchAction(row.original.id, { qty: Number(value) })}
          />
        </div>
      ),
    },
    {
      accessorKey: 'price',
      header: () => <div className="text-right">Цена</div>,
      size: 130,
      minSize: 110,
      cell: ({ row }) => (
        <div className="text-right">
          <EditableCell
            type="number"
            align="right"
            clearOnFocus
            cancelOnEmpty
            value={row.original.price}
            disabled={pendingIds.has(row.original.id)}
            ariaLabel="Цена"
            onCommit={(value) => onPatchAction(row.original.id, { price: Number(value) })}
          />
        </div>
      ),
    },
    {
      accessorKey: 'amount',
      header: () => <div className="text-right">Сумма</div>,
      size: 140,
      minSize: 120,
      cell: ({ row }) => <div className="text-right text-sm font-medium pr-2 tabular-nums">{amountFormatter.format(row.original.amount)} ₽</div>,
    },
    {
      accessorKey: 'note',
      header: 'Примечание',
      size: 180,
      minSize: 150,
      cell: ({ row }) => (
        <EditableCell
          value={row.original.note}
          disabled={pendingIds.has(row.original.id)}
          ariaLabel="Примечание"
          onCommit={(value) => onPatchAction(row.original.id, { note: value })}
        />
      ),
    },
    {
      id: 'actions',
      header: '',
      size: 60,
      maxSize: 60,
      cell: ({ row }) => (
        <div className="flex justify-center">
          <DeleteRowAction
            rowId={row.original.id}
            materialName={row.original.materialName}
            onRemoveAction={onRemoveAction}
            disabled={pendingIds.has(row.original.id)}
          />
        </div>
      ),
    },
  ];
}
