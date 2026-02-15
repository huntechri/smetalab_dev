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
        header: 'Наименование',
        cell: ({ row }) => {
            const item = row.original;
            return (
                <div className={item.kind === 'material' ? 'pl-8 flex items-center gap-2' : ''}>
                    {item.kind === 'material' && <Badge variant="outline">Материал</Badge>}
                    <EditableCell value={item.name} onCommit={(value) => actions.onPatch(item.id, 'name', value)} />
                </div>
            );
        },
    },
    { accessorKey: 'imageUrl', header: 'Изображение', cell: ({ row }) => <ImageCell imageUrl={row.original.imageUrl} name={row.original.name} /> },
    { accessorKey: 'unit', header: 'Ед. изм.' },
    {
        accessorKey: 'qty',
        header: () => <div className="text-right">Кол-во</div>,
        cell: ({ row }) => <div className="text-right font-medium"><EditableCell type="number" value={row.original.qty} onCommit={(value) => actions.onPatch(row.original.id, 'qty', value)} /></div>
    },
    {
        accessorKey: 'price',
        header: () => <div className="text-right">Цена</div>,
        cell: ({ row }) => <div className="text-right font-medium"><EditableCell type="number" value={row.original.price} onCommit={(value) => actions.onPatch(row.original.id, 'price', value)} /></div>
    },
    {
        accessorKey: 'sum',
        header: () => <div className="text-right">Сумма</div>,
        cell: ({ row }) => <div className="text-right font-semibold text-primary/90"><MoneyCell value={row.original.sum} /></div>
    },
    {
        accessorKey: 'expense',
        header: () => <div className="text-right">Расход</div>,
        cell: ({ row }) => <div className="text-right"><EditableCell type="number" value={row.original.expense} onCommit={(value) => actions.onPatch(row.original.id, 'expense', value)} /></div>
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
