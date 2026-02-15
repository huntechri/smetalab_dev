'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ColumnDef } from '@tanstack/react-table';
import { ChevronDown, ChevronRight, Settings } from 'lucide-react';
import { VisibleEstimateRow } from '../../lib/rows-visible';
import { EditableCell } from './cells/EditableCell';
import { ImageCell } from './cells/ImageCell';
import { MoneyCell } from './cells/MoneyCell';

export type EstimateColumnActions = {
    expandedWorkIds: Set<string>;
    onToggleExpand: (workId: string) => void;
    onPatch: (rowId: string, field: 'name' | 'qty' | 'price' | 'expense', rawValue: string) => Promise<void>;
    onAddMaterial: (workId: string) => Promise<void>;
};

export const getEstimateColumns = (actions: EstimateColumnActions): ColumnDef<VisibleEstimateRow>[] => [
    {
        accessorKey: 'code',
        size: 80,
        minSize: 80,
        maxSize: 100,
        header: () => <div className="pl-1">№ / Код</div>,
        cell: ({ row }) => {
            const item = row.original;
            if (item.kind === 'work') {
                const expanded = actions.expandedWorkIds.has(item.id);
                return (
                    <div className="flex items-center gap-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="size-7 hover:bg-muted/80"
                            onClick={() => actions.onToggleExpand(item.id)}
                        >
                            {expanded ? (
                                <ChevronDown className="size-4 text-muted-foreground transition-transform duration-200" />
                            ) : (
                                <ChevronRight className="size-4 text-muted-foreground transition-transform duration-200" />
                            )}
                        </Button>
                        <span className="font-semibold tabular-nums text-sm">{item.code}</span>
                    </div>
                );
            }
            return <div className="pl-9 text-xs text-muted-foreground/80 font-medium tabular-nums">{item.code}</div>;
        },
    },
    {
        accessorKey: 'name',
        size: 600,
        minSize: 300,
        header: 'Наименование',
        cell: ({ row }) => {
            const item = row.original;
            return (
                <div className={item.kind === 'material' ? 'pl-8' : ''}>
                    <div className="text-sm font-medium">{item.name}</div>
                </div>
            );
        },
    },
    {
        accessorKey: 'imageUrl',
        header: 'Изображение',
        size: 110,
        cell: ({ row }) => <ImageCell imageUrl={row.original.imageUrl} name={row.original.name} />
    },
    {
        accessorKey: 'unit',
        header: 'Ед. изм.',
        size: 100,
    },
    {
        accessorKey: 'qty',
        size: 100,
        header: () => <div className="text-right">Кол-во</div>,
        cell: ({ row }) => <div className="text-right font-medium pr-6"><EditableCell type="number" align="right" clearOnFocus cancelOnEmpty value={row.original.qty} onCommit={(value) => actions.onPatch(row.original.id, 'qty', value)} /></div>
    },
    {
        accessorKey: 'price',
        size: 110,
        header: () => <div className="text-right">Цена</div>,
        cell: ({ row }) => <div className="text-right font-medium pr-6"><EditableCell type="number" align="right" clearOnFocus cancelOnEmpty value={row.original.price} onCommit={(value) => actions.onPatch(row.original.id, 'price', value)} /></div>
    },
    {
        accessorKey: 'sum',
        size: 120,
        header: () => <div className="text-right">Сумма</div>,
        cell: ({ row }) => <div className="text-right font-semibold text-primary/90 pr-6"><MoneyCell value={row.original.sum} /></div>
    },
    {
        accessorKey: 'expense',
        size: 100,
        header: () => <div className="text-right">Расход</div>,
        cell: ({ row }) => <div className="text-right pr-6"><EditableCell type="number" align="right" clearOnFocus cancelOnEmpty value={row.original.expense} onCommit={(value) => actions.onPatch(row.original.id, 'expense', value)} /></div>
    },
    {
        id: 'actions',
        header: () => <div className="text-center">Действия</div>,
        cell: ({ row }) => {
            const item = row.original;
            return (
                <div className="flex justify-center">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button size="icon" variant="ghost" className="size-8"><Settings className="size-4 text-muted-foreground" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {item.kind === 'work' ? (
                                <DropdownMenuItem onClick={() => void actions.onAddMaterial(item.id)}>Добавить материал</DropdownMenuItem>
                            ) : (
                                <DropdownMenuItem className="text-destructive">Удалить (скоро)</DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            );
        },
    },
];
