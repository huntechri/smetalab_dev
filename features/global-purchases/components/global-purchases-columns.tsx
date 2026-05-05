'use client';

import React from 'react';
import { Button } from '@/shared/ui/button';
import { ColumnDef } from '@tanstack/react-table';
import { Check, ChevronsUpDown, Loader2, Trash2 } from 'lucide-react';
import { EditableCell } from '@/shared/ui/cells/editable-cell';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/ui/alert-dialog';
import { parseIsoDateSafe } from '../lib/date';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/shared/ui/command';
import { cn } from '@/lib/utils';
import { Badge } from '@/shared/ui/badge';
import {
  DenseListColorIndicator,
  DenseListPickerButton,
  denseListPickerPopoverClassName,
  denseListTableActionsClassName,
  denseListTableAmountClassName,
  denseListTableNumericCellClassName,
  denseListTableTextClassName,
} from '@/shared/ui/dense-list';
import type { ProjectOption, PurchaseRow, PurchaseRowPatch, SupplierOption } from '@/shared/types/domain/purchase-row';

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
    try {
      await onPatchAction(row.id, { supplierId });
      setOpen(false);
    } catch {
      // keep popover open so user can retry after toast in parent
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <DenseListPickerButton
          disabled={disabled}
          aria-label="Назначить поставщика"
        >
          {disabled ? <Loader2 /> : <DenseListColorIndicator color={color} />}
          {name ? <Badge variant="secondary" size="xs">{name}</Badge> : <span>Поставщик</span>}
          <ChevronsUpDown />
        </DenseListPickerButton>
      </PopoverTrigger>
      <PopoverContent className={denseListPickerPopoverClassName} align="start">
        <Command>
          <CommandInput placeholder="Поиск поставщика..." />
          <CommandList>
            <CommandEmpty>Поставщик не найден.</CommandEmpty>
            <CommandGroup>
              {name && (
                <CommandItem onSelect={() => void handleSelect(null)}>
                  <DenseListColorIndicator />
                  Снять поставщика
                </CommandItem>
              )}
              {options.map((supplier) => (
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
  const [open, setOpen] = React.useState(false);

  const current = projectId ? projectOptions.find((p) => p.id === projectId) : null;
  const name = current?.name;

  const handleSelect = async (val: string | null) => {
    try {
      await onPatchAction(rowId, { projectId: val });
      setOpen(false);
    } catch {
      // toast is handled in parent
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <DenseListPickerButton
          disabled={disabled}
          aria-label="Выбрать объект"
        >
          {disabled && (
            <Loader2 />
          )}
          {name ? <Badge variant="secondary" size="xs">{name}</Badge> : <span>Без привязки</span>}
          <ChevronsUpDown className="ml-auto size-3 opacity-60" />
        </DenseListPickerButton>
      </PopoverTrigger>
      <PopoverContent className={denseListPickerPopoverClassName} align="start">
        <Command>
          <CommandInput placeholder="Поиск объекта..." />
          <CommandList>
            <CommandEmpty>Объект не найден.</CommandEmpty>
            <CommandGroup>
              <CommandItem onSelect={() => void handleSelect(null)}>
                <Check className={cn('size-4', !projectId ? 'opacity-100' : 'opacity-0')} />
                Без привязки
              </CommandItem>
              {projectOptions.map((project) => (
                <CommandItem key={project.id} value={project.name} onSelect={() => void handleSelect(project.id)}>
                  <Check className={cn('size-4', project.id === projectId ? 'opacity-100' : 'opacity-0')} />
                  <span className="truncate">{project.name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
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
          <Button
            type="button"
            variant="destructive"
            size="icon-xs"
            onClick={() => setOpen(true)}
            disabled={disabled}
            aria-label="Удалить строку"
          >
            <Trash2 />
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
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
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
      size: 140,
      minSize: 130,
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
      size: 90,
      minSize: 85,
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
          <div className="min-w-0">
            <EditableCell
              type="date"
              value={dateString}
              displayValue={displayValue}
              disabled={isPending}
              ariaLabel="Дата закупки"
              onCommit={async (value: string) => {
                try {
                  await onPatchAction(row.original.id, { purchaseDate: value });
                } catch (_error) {
                  return;
                }
              }}
            />
          </div>
        );
      },
    },
    {
      accessorKey: 'materialName',
      header: 'Наименование материала',
      size: 500,
      minSize: 300,
      cell: ({ row }) => (
        <div className="min-w-0">
          <EditableCell
            value={row.original.materialName}
            disabled={pendingIds.has(row.original.id)}
            ariaLabel="Наименование материала"
            onCommit={async (value: string) => {
              try {
                await onPatchAction(row.original.id, { materialName: value });
              } catch (_error) {
                return;
              }
            }}
          />
        </div>
      ),
    },
    {
      accessorKey: 'unit',
      header: 'Ед. изм.',
      size: 70,
      minSize: 65,
      cell: ({ row }) => (
        <div className="min-w-0">
          <EditableCell
            value={row.original.unit}
            disabled={pendingIds.has(row.original.id)}
            ariaLabel="Единица измерения"
            onCommit={async (value: string) => {
              try {
                await onPatchAction(row.original.id, { unit: value });
              } catch (_error) {
                return;
              }
            }}
          />
        </div>
      ),
    },
    {
      accessorKey: 'qty',
      header: () => <div className="text-right">Кол-во</div>,
      size: 80,
      minSize: 75,
      cell: ({ row }) => (
        <div className={denseListTableNumericCellClassName}>
          <EditableCell
            type="number"
            align="right"
            clearOnFocus
            cancelOnEmpty
            value={row.original.qty}
            disabled={pendingIds.has(row.original.id)}
            ariaLabel="Количество"
            className={denseListTableTextClassName}
            onCommit={async (value: string) => {
              try {
                await onPatchAction(row.original.id, { qty: Number(value) });
              } catch (_error) {
                return;
              }
            }}
          />
        </div>
      ),
    },
    {
      accessorKey: 'price',
      header: () => <div className="text-right">Цена</div>,
      size: 90,
      minSize: 85,
      cell: ({ row }) => (
        <div className={denseListTableNumericCellClassName}>
          <EditableCell
            type="number"
            align="right"
            clearOnFocus
            cancelOnEmpty
            value={row.original.price}
            disabled={pendingIds.has(row.original.id)}
            ariaLabel="Цена"
            className={cn(denseListTableTextClassName, 'font-bold tracking-tight')}
            onCommit={async (value: string) => {
              try {
                await onPatchAction(row.original.id, { price: Number(value) });
              } catch (_error) {
                return;
              }
            }}
          />
        </div>
      ),
    },
    {
      accessorKey: 'amount',
      header: () => <div className="text-right">Сумма</div>,
      size: 100,
      minSize: 95,
      cell: ({ row }) => <div className={denseListTableAmountClassName}>{amountFormatter.format(row.original.amount)} ₽</div>,
    },
    {
      accessorKey: 'supplierName',
      header: 'Поставщик',
      size: 160,
      minSize: 140,
      cell: ({ row }) => (
        <SupplierBadgePicker
          row={row.original}
          options={supplierOptions}
          disabled={pendingIds.has(row.original.id)}
          onPatchAction={onPatchAction}
        />
      ),
    },
    {
      id: 'actions',
      header: 'Действия',
      size: 110,
      minSize: 100,
      cell: ({ row }) => (
        <div className={denseListTableActionsClassName}>
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
