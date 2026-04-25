'use client';

import type React from 'react';
import { useState } from 'react';
import { Check, ChevronsUpDown, Loader2, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { MoneyCell } from '@/shared/ui/cells/money-cell';
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
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/shared/ui/command';
import { parseIsoDateSafe } from '../lib/date';
import type { ProjectOption, PurchaseRow, PurchaseRowPatch, SupplierOption } from '../types/dto';

const amountFormatter = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 2 });
const dateFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

const inlineCellClassName =
  'h-6 min-w-0 rounded-sm border-0 bg-transparent px-1 py-0 text-[11px] font-semibold leading-none !shadow-none focus-visible:!ring-0 focus-visible:!ring-offset-0';
const inlineNumberCellClassName = cn(inlineCellClassName, 'w-16 justify-end text-right tabular-nums');
const inlineTextCellClassName = cn(
  inlineCellClassName,
  'min-h-8 w-full !whitespace-normal !justify-start break-words text-left text-slate-800',
);

type GlobalPurchasesCardsListProps = {
  rows: PurchaseRow[];
  projectOptions: ProjectOption[];
  supplierOptions: SupplierOption[];
  pendingIds: Set<string>;
  emptyState: React.ReactNode;
  onPatchAction: (rowId: string, patch: PurchaseRowPatch) => Promise<void>;
  onRemoveAction: (rowId: string) => Promise<void>;
};

function ProjectPicker({
  row,
  projectOptions,
  disabled,
  onPatchAction,
}: {
  row: PurchaseRow;
  projectOptions: ProjectOption[];
  disabled: boolean;
  onPatchAction: (rowId: string, patch: PurchaseRowPatch) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const current = row.projectId ? projectOptions.find((project) => project.id === row.projectId) : null;
  const name = current?.name ?? row.projectName;

  const handleSelect = async (projectId: string | null) => {
    try {
      await onPatchAction(row.id, { projectId });
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
          aria-label="Выбрать объект"
          className="h-6 max-w-full justify-start gap-1.5 rounded-md px-1.5 text-[10px]"
        >
          {disabled ? <Loader2 className="size-3 animate-spin" aria-hidden="true" /> : null}
          <span className="truncate">{name || 'Без привязки'}</span>
          <ChevronsUpDown className="ml-auto size-3 opacity-60" aria-hidden="true" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[min(20rem,calc(100vw-2rem))] p-0" align="start">
        <Command>
          <CommandInput placeholder="Поиск объекта..." />
          <CommandList>
            <CommandEmpty>Объект не найден.</CommandEmpty>
            <CommandGroup>
              <CommandItem onSelect={() => void handleSelect(null)}>
                <Check className={cn('size-4', !row.projectId ? 'opacity-100' : 'opacity-0')} />
                Без привязки
              </CommandItem>
              {projectOptions.map((project) => (
                <CommandItem key={project.id} value={project.name} onSelect={() => void handleSelect(project.id)}>
                  <Check className={cn('size-4', project.id === row.projectId ? 'opacity-100' : 'opacity-0')} />
                  <span className="truncate">{project.name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

function SupplierPicker({
  row,
  supplierOptions,
  disabled,
  onPatchAction,
}: {
  row: PurchaseRow;
  supplierOptions: SupplierOption[];
  disabled: boolean;
  onPatchAction: (rowId: string, patch: PurchaseRowPatch) => Promise<void>;
}) {
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
          className="h-6 max-w-full justify-start gap-1.5 rounded-md px-1.5 text-[10px]"
        >
          {disabled ? (
            <Loader2 className="size-3 animate-spin" aria-hidden="true" />
          ) : (
            <span
              className="size-2.5 shrink-0 rounded-full bg-muted-foreground/40"
              style={color ? { backgroundColor: color } : undefined}
              aria-hidden="true"
            />
          )}
          <span className="truncate">{name || 'Поставщик'}</span>
          <ChevronsUpDown className="ml-auto size-3 opacity-60" aria-hidden="true" />
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

function DeletePurchaseAction({
  row,
  disabled,
  onRemoveAction,
}: {
  row: PurchaseRow;
  disabled: boolean;
  onRemoveAction: (rowId: string) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);

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
            className="size-6 rounded-lg sm:size-7"
          >
            <Trash2 className="size-3.5" aria-hidden="true" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Удалить строку закупки</TooltipContent>
      </Tooltip>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent onClick={(event) => event.stopPropagation()}>
          <AlertDialogHeader>
            <AlertDialogTitle>Вы уверены?</AlertDialogTitle>
            <AlertDialogDescription>
              Закупка {row.materialName ? `"${row.materialName}"` : 'этого материала'} будет удалена безвозвратно.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={disabled}>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={async (event) => {
                event.preventDefault();
                await onRemoveAction(row.id);
                setOpen(false);
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
}

function PurchaseMetric({
  label,
  value,
  tone = 'neutral',
}: {
  label: string;
  value: React.ReactNode;
  tone?: 'neutral' | 'info' | 'success';
}) {
  const toneClasses = {
    neutral: 'border-slate-200 bg-slate-50 text-slate-600',
    info: 'border-blue-200 bg-blue-50 text-blue-600',
    success: 'border-green-200 bg-green-50 text-green-600',
  };

  return (
    <Badge
      variant="outline"
      className={cn(
        'h-5 px-1.5 text-[10px] font-semibold normal-case leading-none tracking-tight border shadow-none',
        toneClasses[tone],
      )}
    >
      <span className="opacity-70">{label}:</span>
      <span className="ml-0.5 tabular-nums">{value}</span>
    </Badge>
  );
}

function formatDate(value: string) {
  try {
    return dateFormatter.format(parseIsoDateSafe(value));
  } catch {
    return value;
  }
}

function GlobalPurchaseCard({
  row,
  projectOptions,
  supplierOptions,
  pendingIds,
  onPatchAction,
  onRemoveAction,
}: Omit<GlobalPurchasesCardsListProps, 'rows' | 'emptyState'> & { row: PurchaseRow }) {
  const isPending = pendingIds.has(row.id);

  return (
    <article className="overflow-hidden rounded-md border border-border bg-card shadow-[0_1px_2px_rgba(0,0,0,0.04)] sm:rounded-lg">
      <div className="grid grid-cols-1 gap-4 p-2 sm:p-3 lg:grid-cols-[2.2fr_1fr_1.25fr_1.15fr_auto] lg:gap-5">
        <div className="min-w-0 space-y-2">
          <div className="flex min-w-0 items-start gap-1.5">
            {isPending ? <Loader2 className="mt-1 size-3.5 shrink-0 animate-spin text-muted-foreground" aria-hidden="true" /> : null}
            <EditableCell
              value={row.materialName}
              disabled={isPending}
              ariaLabel="Наименование материала"
              title={row.materialName}
              className={inlineTextCellClassName}
              onCommit={async (value: string) => {
                await onPatchAction(row.id, { materialName: value });
              }}
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <Badge
              variant="outline"
              className="h-5 border-slate-200 bg-white px-1.5 py-0 text-[10px] font-bold leading-none text-slate-600 shadow-none"
            >
              <EditableCell
                value={row.unit}
                disabled={isPending}
                ariaLabel="Единица измерения"
                className="h-4 w-14 border-0 bg-transparent px-0 py-0 text-[10px] font-bold !shadow-none focus-visible:!ring-0 focus-visible:!ring-offset-0"
                onCommit={async (value: string) => {
                  await onPatchAction(row.id, { unit: value });
                }}
              />
            </Badge>
            <Badge
              variant="outline"
              className="h-5 border-slate-200 bg-slate-50 px-1.5 py-0 text-[10px] font-semibold leading-none text-slate-500 shadow-none"
            >
              {row.source === 'catalog' ? 'Каталог' : 'Ручная'}
            </Badge>
          </div>
        </div>

        <div className="space-y-2.5">
          <div className="flex items-center gap-2 border-b border-blue-100/50 pb-1.5 dark:border-blue-900/30">
            <div className="h-1.5 w-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" aria-hidden="true" />
            <span className="text-[9px] font-bold uppercase tracking-widest text-blue-600 sm:text-[10px]">Привязка</span>
          </div>
          <div className="grid gap-1.5">
            <ProjectPicker
              row={row}
              projectOptions={projectOptions}
              disabled={isPending}
              onPatchAction={onPatchAction}
            />
            <EditableCell
              type="date"
              value={row.purchaseDate}
              displayValue={formatDate(row.purchaseDate)}
              disabled={isPending}
              ariaLabel="Дата закупки"
              className="h-6 justify-start rounded-md px-1.5 text-[10px] font-semibold"
              onCommit={async (value: string) => {
                await onPatchAction(row.id, { purchaseDate: value });
              }}
            />
          </div>
        </div>

        <div className="space-y-2.5">
          <div className="flex items-center gap-2 border-b border-green-100/50 pb-1.5 dark:border-green-900/30">
            <div className="h-1.5 w-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" aria-hidden="true" />
            <span className="text-[9px] font-bold uppercase tracking-widest text-green-600 sm:text-[10px]">Закупка</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <div className="inline-flex h-5 items-center gap-1 rounded-full border border-slate-300 bg-slate-50 px-1.5 py-0 text-[10px] text-slate-600">
              <span className="opacity-70">Кол-во</span>
              <EditableCell
                type="number"
                align="right"
                clearOnFocus
                cancelOnEmpty
                value={row.qty}
                disabled={isPending}
                ariaLabel="Количество"
                className={inlineNumberCellClassName}
                onCommit={async (value: string) => {
                  await onPatchAction(row.id, { qty: Number(value) });
                }}
              />
            </div>
            <div className="inline-flex h-5 items-center gap-1 rounded-full border border-slate-300 bg-slate-50 px-1.5 py-0 text-[10px] text-slate-600">
              <span className="opacity-70">Цена</span>
              <EditableCell
                type="number"
                align="right"
                clearOnFocus
                cancelOnEmpty
                value={row.price}
                disabled={isPending}
                ariaLabel="Цена"
                className={cn(inlineNumberCellClassName, 'font-bold')}
                onCommit={async (value: string) => {
                  await onPatchAction(row.id, { price: Number(value) });
                }}
              />
              <span>₽</span>
            </div>
            <PurchaseMetric label="Сумма" value={<MoneyCell value={row.amount} />} tone="success" />
          </div>
        </div>

        <div className="space-y-2.5">
          <div className="flex items-center gap-2 border-b border-orange-100/50 pb-1.5 dark:border-orange-900/30">
            <div className="h-1.5 w-1.5 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]" aria-hidden="true" />
            <span className="text-[9px] font-bold uppercase tracking-widest text-orange-600 sm:text-[10px]">Поставщик</span>
          </div>
          <SupplierPicker
            row={row}
            supplierOptions={supplierOptions}
            disabled={isPending}
            onPatchAction={onPatchAction}
          />
          <div className="flex flex-wrap gap-1.5">
            <PurchaseMetric label="Цена" value={`${amountFormatter.format(row.price)} ₽`} />
          </div>
        </div>

        <div className="flex items-start justify-end">
          <DeletePurchaseAction row={row} disabled={isPending} onRemoveAction={onRemoveAction} />
        </div>
      </div>
    </article>
  );
}

export function GlobalPurchasesCardsList({
  rows,
  projectOptions,
  supplierOptions,
  pendingIds,
  emptyState,
  onPatchAction,
  onRemoveAction,
}: GlobalPurchasesCardsListProps) {
  if (rows.length === 0) {
    return <div className="px-3 py-8">{emptyState}</div>;
  }

  return (
    <div className="max-h-[625px] overflow-y-auto px-1.5 pb-1.5 sm:px-3 sm:pb-3">
      <div className="space-y-2">
        {rows.map((row) => (
          <GlobalPurchaseCard
            key={row.id}
            row={row}
            projectOptions={projectOptions}
            supplierOptions={supplierOptions}
            pendingIds={pendingIds}
            onPatchAction={onPatchAction}
            onRemoveAction={onRemoveAction}
          />
        ))}
      </div>
    </div>
  );
}
