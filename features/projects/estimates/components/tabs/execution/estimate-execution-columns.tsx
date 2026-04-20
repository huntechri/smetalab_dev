'use client';

import { useEffect, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import {
    Badge,
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    Input,
} from '@repo/ui';
import { parseDecimalInput, toDecimalInput } from '@/features/projects/estimates/lib/decimal-input';
import { EstimateExecutionRow, EstimateExecutionStatus } from '@/features/projects/estimates/types/execution.dto';
import { projectBadgeClassName, projectStatusBadgeToneClassName } from '@/features/projects/shared/ui/project-badge-styles';

const moneyFormatter = new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 2,
});

const numberFormatter = new Intl.NumberFormat('ru-RU', {
    maximumFractionDigits: 2,
});

type EstimateExecutionPatch = {
    actualQty?: number;
    actualPrice?: number;
    status?: EstimateExecutionStatus;
};

interface GetEstimateExecutionColumnsParams {
    onPatchRow: (rowId: string, patch: EstimateExecutionPatch) => Promise<void>;
}

function getStatusDisplay(status: EstimateExecutionStatus) {
    const base = `${projectBadgeClassName} min-w-[88px] cursor-pointer`;
    const tone = status === 'done'
        ? projectStatusBadgeToneClassName.success
        : status === 'in_progress'
            ? projectStatusBadgeToneClassName.info
            : projectStatusBadgeToneClassName.warning;

    if (status === 'done') {
        return <Badge variant="outline" className={`${base} ${tone}`}>Выполнено</Badge>;
    }

    if (status === 'in_progress') {
        return <Badge variant="outline" className={`${base} ${tone}`}>В процессе</Badge>;
    }

    return <Badge variant="outline" className={`${base} ${tone}`}>Подготовка</Badge>;
}

function ExecutionStatusCell({
    currentStatus,
    onStatusChange,
}: {
    currentStatus: EstimateExecutionStatus;
    onStatusChange: (status: EstimateExecutionStatus) => void;
}) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <div className="inline-flex outline-none">
                    {getStatusDisplay(currentStatus)}
                </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[150px] p-1">
                <DropdownMenuItem onClick={() => onStatusChange('not_started')} className="mb-0.5 h-8 cursor-pointer rounded-md focus:bg-brand/10 focus:text-brand">
                    <div className="flex items-center gap-2 w-full">
                        <div className="w-2 h-2 rounded-full bg-brand" />
                        <span className="text-xs font-medium">Подготовка</span>
                    </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onStatusChange('in_progress')} className="mb-0.5 h-8 cursor-pointer rounded-md focus:bg-blue-50 focus:text-blue-700">
                    <div className="flex items-center gap-2 w-full">
                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                        <span className="text-xs font-medium">В процессе</span>
                    </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onStatusChange('done')} className="h-8 cursor-pointer rounded-md focus:bg-emerald-50 focus:text-emerald-700">
                    <div className="flex items-center gap-2 w-full">
                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span className="text-xs font-medium">Выполнено</span>
                    </div>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

function NumberEditCell({
    row,
    field,
    onSave,
}: {
    row: EstimateExecutionRow;
    field: 'actualQty' | 'actualPrice';
    onSave: (rowId: string, patch: { actualQty?: number; actualPrice?: number }) => Promise<void>;
}) {
    const [localValue, setLocalValue] = useState<string>(String(row[field]));

    useEffect(() => {
        setLocalValue(toDecimalInput(row[field]));
    }, [field, row[field]]);

    return (
        <Input
            value={localValue}
            onChange={(event) => setLocalValue(event.target.value)}
            onBlur={() => {
                const nextValue = parseDecimalInput(localValue);

                if (!Number.isFinite(nextValue) || nextValue < 0) {
                    setLocalValue(String(row[field]));
                    return;
                }

                if (nextValue === row[field]) {
                    return;
                }

                void onSave(row.id, { [field]: nextValue });
            }}
            numeric
       />
    );
}

export function getEstimateExecutionColumns({
    onPatchRow,
}: GetEstimateExecutionColumnsParams): ColumnDef<EstimateExecutionRow>[] {
    return [
        {
            accessorKey: 'code',
            header: 'Код',
            size: 60,
            cell: ({ row }) => <span className="text-xs font-normal text-muted-foreground">{row.original.code}</span>,
        },
        {
            accessorKey: 'name',
            header: 'Работа',
            size: 450,
            cell: ({ row }) => (
                <div className="space-y-1">
                    <div className="text-xs font-normal truncate" title={row.original.name}>{row.original.name}</div>
                    {row.original.source === 'extra' ? (
                        <Badge variant="outline" className={projectBadgeClassName}>
                            Доп. работа
                        </Badge>
                    ) : null}
                </div>
            ),
        },
        {
            accessorKey: 'unit',
            header: 'Ед.',
            cell: ({ row }) => <div className="text-xs text-muted-foreground font-medium">{row.original.unit}</div>,
            size: 80,
        },
        {
            accessorKey: 'plannedQty',
            header: () => <div className="text-right whitespace-nowrap">Кол-во</div>,
            cell: ({ row }) => <div className="text-right tabular-nums text-xs font-normal text-muted-foreground">{numberFormatter.format(row.original.plannedQty)}</div>,
            size: 120,
        },
        {
            accessorKey: 'plannedPrice',
            header: () => <div className="text-right whitespace-nowrap">Цена</div>,
            cell: ({ row }) => <div className="text-right tabular-nums font-bold tracking-tight text-xs">{moneyFormatter.format(row.original.plannedPrice)}</div>,
            size: 120,
        },
        {
            accessorKey: 'plannedSum',
            header: () => <div className="text-right whitespace-nowrap">План сумма</div>,
            cell: ({ row }) => <div className="text-right tabular-nums font-bold tracking-tight text-xs">{moneyFormatter.format(row.original.plannedSum)}</div>,
            size: 130,
        },
        {
            accessorKey: 'actualQty',
            header: () => <div className="text-right whitespace-nowrap">Факт кол-во</div>,
            cell: ({ row }) => <NumberEditCell row={row.original} field="actualQty" onSave={onPatchRow} />,
            size: 120,
        },
        {
            accessorKey: 'actualPrice',
            header: () => <div className="text-right whitespace-nowrap">Факт цена</div>,
            cell: ({ row }) => <NumberEditCell row={row.original} field="actualPrice" onSave={onPatchRow} />,
            size: 120,
        },
        {
            accessorKey: 'actualSum',
            header: () => <div className="text-right whitespace-nowrap">Факт сумма</div>,
            cell: ({ row }) => <div className="text-right tabular-nums font-bold tracking-tight text-xs">{moneyFormatter.format(row.original.actualSum)}</div>,
            size: 150,
        },
        {
            accessorKey: 'status',
            header: 'Статус',
            cell: ({ row }) => (
                <ExecutionStatusCell
                    currentStatus={row.original.status}
                    onStatusChange={(status) => void onPatchRow(row.original.id, { status })}
               />
            ),
            size: 180,
        },
    ];
}
