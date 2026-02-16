'use client';

import { Button } from '@/components/ui/button';
import { ColumnDef } from '@tanstack/react-table';
import { Trash2 } from 'lucide-react';
import { EditableCell } from '@/features/projects/estimates/components/table/cells/EditableCell';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import type { ProjectOption, PurchaseRow, PurchaseRowPatch } from '../types/dto';

type GlobalPurchasesColumnActions = {
    projectOptions: ProjectOption[];
    onPatch: (rowId: string, patch: PurchaseRowPatch) => Promise<void>;
    onRemove: (rowId: string) => Promise<void>;
};

function ProjectCell({
    projectId,
    rowId,
    onPatch,
    projectOptions,
}: {
    projectId: string | null;
    rowId: string;
    onPatch: (rowId: string, patch: PurchaseRowPatch) => Promise<void>;
    projectOptions: ProjectOption[];
}) {
    return (
        <Select value={projectId ?? 'none'} onValueChange={(value) => void onPatch(rowId, { projectId: value === 'none' ? null : value })}>
            <SelectTrigger className="h-8">
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
}

export function getGlobalPurchasesColumns({
    projectOptions,
    onPatch,
    onRemove,
}: GlobalPurchasesColumnActions): ColumnDef<PurchaseRow>[] {
    return [
        {
            accessorKey: 'projectName',
            header: 'Объект (ID)',
            size: 260,
            minSize: 240,
            cell: ({ row }) => (
                <ProjectCell
                    projectId={row.original.projectId}
                    rowId={row.original.id}
                    onPatch={onPatch}
                    projectOptions={projectOptions}
                />
            ),
        },
        {
            accessorKey: 'materialName',
            header: 'Наименование материала',
            size: 460,
            minSize: 380,
            cell: ({ row }) => (
                <EditableCell
                    value={row.original.materialName}
                    onCommit={(value) => onPatch(row.original.id, { materialName: value })}
                />
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
                    onCommit={(value) => onPatch(row.original.id, { unit: value })}
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
                        onCommit={(value) => onPatch(row.original.id, { qty: Number(value) })}
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
                        onCommit={(value) => onPatch(row.original.id, { price: Number(value) })}
                    />
                </div>
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
            size: 180,
            minSize: 150,
            cell: ({ row }) => (
                <EditableCell
                    value={row.original.note}
                    onCommit={(value) => onPatch(row.original.id, { note: value })}
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
                        onClick={() => void onRemove(row.original.id)}
                        aria-label="Удалить строку"
                    >
                        <Trash2 className="size-4 text-muted-foreground" />
                    </Button>
                </div>
            ),
        },
    ];
}
