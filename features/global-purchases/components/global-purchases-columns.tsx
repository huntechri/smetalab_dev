'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ColumnDef } from '@tanstack/react-table';
import { Trash2 } from 'lucide-react';
import type { PurchaseRow, PurchaseRowPatch } from '../types/dto';

type GlobalPurchasesColumnActions = {
    onPatch: (rowId: string, patch: PurchaseRowPatch) => void;
    onRemove: (rowId: string) => void;
};

export function getGlobalPurchasesColumns({
    onPatch,
    onRemove
}: GlobalPurchasesColumnActions): ColumnDef<PurchaseRow>[] {
    return [
        {
            accessorKey: 'projectName',
            header: 'Объект (наименование)',
            size: 240,
            minSize: 220,
            cell: ({ row }) => (
                <Input
                    value={row.original.projectName}
                    onChange={(event) => onPatch(row.original.id, { projectName: event.target.value })}
                    placeholder="Укажите объект"
                    list="global-purchases-projects"
                    className="h-8"
                />
            ),
        },
        {
            accessorKey: 'materialName',
            header: 'Наименование материала',
            size: 300,
            minSize: 260,
            cell: ({ row }) => (
                <Input
                    value={row.original.materialName}
                    onChange={(event) => onPatch(row.original.id, { materialName: event.target.value })}
                    placeholder="Введите материал"
                    className="h-8"
                />
            ),
        },
        {
            accessorKey: 'unit',
            header: 'Ед. изм.',
            size: 120,
            minSize: 100,
            cell: ({ row }) => (
                <Input
                    value={row.original.unit}
                    onChange={(event) => onPatch(row.original.id, { unit: event.target.value })}
                    placeholder="шт"
                    className="h-8"
                />
            ),
        },
        {
            accessorKey: 'qty',
            header: () => <div className="text-right">Кол-во</div>,
            size: 120,
            minSize: 100,
            cell: ({ row }) => (
                <Input
                    type="number"
                    min={0}
                    step="0.01"
                    value={row.original.qty}
                    onChange={(event) => onPatch(row.original.id, { qty: Number(event.target.value) })}
                    className="h-8 text-right"
                />
            ),
        },
        {
            accessorKey: 'price',
            header: () => <div className="text-right">Цена</div>,
            size: 140,
            minSize: 120,
            cell: ({ row }) => (
                <Input
                    type="number"
                    min={0}
                    step="0.01"
                    value={row.original.price}
                    onChange={(event) => onPatch(row.original.id, { price: Number(event.target.value) })}
                    className="h-8 text-right"
                />
            ),
        },
        {
            accessorKey: 'amount',
            header: () => <div className="text-right">Сумма</div>,
            size: 140,
            minSize: 120,
            cell: ({ row }) => (
                <div className="text-right text-sm font-medium pr-2">
                    {new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 2 }).format(row.original.amount)} ₽
                </div>
            ),
        },
        {
            accessorKey: 'note',
            header: 'Примечание',
            size: 260,
            minSize: 220,
            cell: ({ row }) => (
                <Input
                    value={row.original.note}
                    onChange={(event) => onPatch(row.original.id, { note: event.target.value })}
                    placeholder="Комментарий"
                    className="h-8"
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
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => onRemove(row.original.id)}
                        aria-label="Удалить строку"
                    >
                        <Trash2 className="size-4 text-muted-foreground" />
                    </Button>
                </div>
            ),
        }
    ];
}
