'use client';

import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ColumnDef } from '@tanstack/react-table';
import { ChevronDown, ChevronRight, Plus, Settings } from 'lucide-react';
import { VisibleEstimateRow } from '../../lib/rows-visible';
import { EditableCell } from './cells/EditableCell';
import { ImageCell } from './cells/ImageCell';
import { MoneyCell } from './cells/MoneyCell';

export type EstimateColumnActions = {
    expandedWorkIds: Set<string>;
    onToggleExpand: (workId: string) => void;
    onPatch: (rowId: string, field: 'name' | 'qty' | 'price' | 'expense', rawValue: string) => Promise<void>;
    onOpenMaterialCatalog: (workId: string, workName: string) => void;
    onInsertWorkAfter: (workId: string, workName: string) => void;
    onReplaceMaterial: (materialId: string, materialName: string) => void;
    onRemoveRow: (rowId: string) => Promise<void>;
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
                            aria-label={expanded ? "Свернуть работу" : "Развернуть работу"}
                        >
                            {expanded ? (
                                <ChevronDown className="size-4 text-muted-foreground transition-transform duration-200" />
                            ) : (
                                <ChevronRight className="size-4 text-muted-foreground transition-transform duration-200" />
                            )}
                        </Button>
                        <span className="font-normal tabular-nums text-sm">{item.code}</span>
                    </div>
                );
            }
            return <div className="pl-9 text-xs text-muted-foreground/80 font-normal tabular-nums">{item.code}</div>;
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
                    <div className={
                        item.kind === 'work'
                            ? "text-sm font-normal"
                            : "text-[13px] italic font-normal text-muted-foreground"
                    }>
                        {item.name}
                    </div>
                </div>
            );
        },
    },
    {
        accessorKey: 'imageUrl',
        header: 'Изображение',
        size: 110,
        cell: ({ row }) => {
            if (row.original.kind === 'work') {
                return null;
            }

            return <ImageCell imageUrl={row.original.imageUrl} name={row.original.name} />;
        }
    },
    {
        accessorKey: 'unit',
        header: 'Ед. изм.',
        size: 100,
        cell: ({ row }) => (
            <div className={row.original.kind === 'material' ? "text-[13px] italic font-normal text-muted-foreground" : "text-sm font-normal"}>
                {row.original.unit}
            </div>
        )
    },
    {
        accessorKey: 'qty',
        size: 100,
        header: () => <div className="text-right">Кол-во</div>,
        cell: ({ row }) => (
            <div className={`text-right pr-6 ${row.original.kind === 'material' ? "text-[13px] italic font-normal text-muted-foreground" : "text-sm font-normal"}`}>
                <EditableCell type="number" align="right" clearOnFocus cancelOnEmpty value={row.original.qty} onCommit={(value) => actions.onPatch(row.original.id, 'qty', value)} />
            </div>
        )
    },
    {
        accessorKey: 'price',
        size: 110,
        header: () => <div className="text-right">Цена</div>,
        cell: ({ row }) => (
            <div className={`text-right pr-6 ${row.original.kind === 'material' ? "text-[13px] italic font-normal text-muted-foreground" : "text-sm font-normal"}`}>
                <EditableCell type="number" align="right" clearOnFocus cancelOnEmpty value={row.original.price} onCommit={(value) => actions.onPatch(row.original.id, 'price', value)} />
            </div>
        )
    },
    {
        accessorKey: 'sum',
        size: 120,
        header: () => <div className="text-right">Сумма</div>,
        cell: ({ row }) => (
            <div className={`text-right pr-6 ${row.original.kind === 'material' ? "text-[13px] italic font-normal text-muted-foreground" : "text-sm font-medium text-primary/90"}`}>
                <MoneyCell value={row.original.sum} />
            </div>
        )
    },
    {
        accessorKey: 'expense',
        size: 100,
        header: () => <div className="text-right">Расход</div>,
        cell: ({ row }) => {
            if (row.original.kind === 'work') {
                return <div className="text-right pr-6" />;
            }
            return (
                <div className="text-right pr-6">
                    <EditableCell
                        type="number"
                        align="right"
                        clearOnFocus
                        cancelOnEmpty
                        value={row.original.expense}
                        onCommit={(value) => actions.onPatch(row.original.id, 'expense', value)}
                    />
                </div>
            );
        }
    },
    {
        id: 'actions',
        header: () => <div className="text-center">Действия</div>,
        cell: ({ row }) => {
            const item = row.original;
            return (
                <div className="flex items-center justify-center gap-1">
                    {item.kind === 'work' ? (
                        <Button
                            size="icon"
                            variant="ghost"
                            className="size-8"
                            onClick={() => actions.onOpenMaterialCatalog(item.id, item.name)}
                            title="Добавить материал"
                            aria-label="Добавить материал"
                        >
                            <Plus className="size-4 text-muted-foreground" />
                        </Button>
                    ) : null}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button size="icon" variant="ghost" className="size-8" aria-label="Действия с строкой">
                                <Settings className="size-4 text-muted-foreground" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {item.kind === 'work' ? (
                                <DropdownMenuItem onClick={() => actions.onInsertWorkAfter(item.id, item.name)}>Добавить работу ниже</DropdownMenuItem>
                            ) : null}
                            {item.kind === 'material' ? (
                                <DropdownMenuItem onClick={() => actions.onReplaceMaterial(item.id, item.name)}>Изменить / заменить</DropdownMenuItem>
                            ) : null}
                            <DropdownMenuItem className="text-destructive" onClick={() => void actions.onRemoveRow(item.id)}>Удалить</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            );
        },
    },
];
