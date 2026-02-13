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
        header: '№ / Код',
        cell: ({ row }) => {
            const item = row.original;
            if (item.kind === 'work') {
                const expanded = actions.expandedWorkIds.has(item.id);
                return (
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="size-6" onClick={() => actions.onToggleExpand(item.id)}>
                            {expanded ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
                        </Button>
                        <span className="font-medium">{item.code}</span>
                    </div>
                );
            }
            return <span className="pl-8">{item.code}</span>;
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
    { accessorKey: 'qty', header: 'Кол-во', cell: ({ row }) => <EditableCell type="number" value={row.original.qty} onCommit={(value) => actions.onPatch(row.original.id, 'qty', value)} /> },
    { accessorKey: 'price', header: 'Цена', cell: ({ row }) => <EditableCell type="number" value={row.original.price} onCommit={(value) => actions.onPatch(row.original.id, 'price', value)} /> },
    { accessorKey: 'sum', header: 'Сумма', cell: ({ row }) => <MoneyCell value={row.original.sum} /> },
    { accessorKey: 'expense', header: 'Расход', cell: ({ row }) => <EditableCell type="number" value={row.original.expense} onCommit={(value) => actions.onPatch(row.original.id, 'expense', value)} /> },
    {
        id: 'actions',
        header: 'Действия',
        cell: ({ row }) => {
            const item = row.original;
            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button size="icon" variant="ghost"><Settings className="size-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        {item.kind === 'work' ? (
                            <DropdownMenuItem onClick={() => void actions.onAddMaterial(item.id)}>Добавить материал</DropdownMenuItem>
                        ) : (
                            <DropdownMenuItem>Удалить (скоро)</DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];
