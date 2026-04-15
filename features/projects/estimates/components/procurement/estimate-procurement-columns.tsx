'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/shared/ui/badge';
import type { EstimateProcurementRow } from '@/shared/types/estimate-procurement';
import { projectBadgeClassName } from '@/features/projects/shared/ui/project-badge-styles';

const moneyFormatter = new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 2,
});

const numberFormatter = new Intl.NumberFormat('ru-RU', {
    maximumFractionDigits: 2,
});

const tableCellTextClassName = 'text-xs';
const tableQtyCellTextClassName = 'text-right tabular-nums text-xs font-normal text-muted-foreground';
const tablePriceCellTextClassName = 'text-right tabular-nums font-bold tracking-tight text-xs';

const deltaBadgeToneClassName = {
    positive: 'bg-[hsl(142_76%_36%_/_0.12)] text-[hsl(142_72%_30%)]',
    zero: 'bg-[hsl(38_92%_50%_/_0.14)] text-[hsl(24_95%_34%)]',
    negative: 'bg-[hsl(0_84%_60%_/_0.12)] text-[hsl(0_72%_42%)]',
} as const;

const renderDeltaBadge = (value: number) => {
    if (value === 0) {
        return <Badge variant="outline" className={`${projectBadgeClassName} ${deltaBadgeToneClassName.zero}`}>0</Badge>;
    }

    if (value > 0) {
        return <Badge variant="outline" className={`${projectBadgeClassName} ${deltaBadgeToneClassName.positive}`}>+{numberFormatter.format(value)}</Badge>;
    }

    return <Badge variant="outline" className={`${projectBadgeClassName} ${deltaBadgeToneClassName.negative}`}>{numberFormatter.format(value)}</Badge>;
};

export const columns: ColumnDef<EstimateProcurementRow>[] = [
    {
        accessorKey: 'materialName',
        header: 'Материал',
        cell: ({ row }) => <div className="text-xs font-normal truncate" title={row.original.materialName}>{row.original.materialName}</div>,
        size: 450,
    },
    {
        accessorKey: 'unit',
        header: 'Ед.',
        cell: ({ row }) => <div className={tableCellTextClassName}>{row.original.unit}</div>,
        size: 60,
    },
    {
        accessorKey: 'plannedQty',
        header: () => <div className="text-right">Кол-во</div>,
        cell: ({ row }) => <div className={tableQtyCellTextClassName}>{numberFormatter.format(row.original.plannedQty)}</div>,
        size: 100,
    },
    {
        accessorKey: 'plannedPrice',
        header: () => <div className="text-right">Цена</div>,
        cell: ({ row }) => <div className={tablePriceCellTextClassName}>{moneyFormatter.format(row.original.plannedPrice)}</div>,
        size: 110,
    },
    {
        accessorKey: 'plannedAmount',
        header: () => <div className="text-right">Сумма</div>,
        cell: ({ row }) => <div className={tablePriceCellTextClassName}>{moneyFormatter.format(row.original.plannedAmount)}</div>,
        size: 120,
    },
    {
        accessorKey: 'actualQty',
        header: () => <div className="text-right">ф. Кол-во</div>,
        cell: ({ row }) => <div className={tableQtyCellTextClassName}>{numberFormatter.format(row.original.actualQty)}</div>,
        size: 100,
    },
    {
        accessorKey: 'actualAvgPrice',
        header: () => <div className="text-right">Ср. цена</div>,
        cell: ({ row }) => <div className={tablePriceCellTextClassName}>{moneyFormatter.format(row.original.actualAvgPrice)}</div>,
        size: 110,
    },
    {
        accessorKey: 'actualAmount',
        header: () => <div className="text-right">ф. Сумма</div>,
        cell: ({ row }) => <div className={tablePriceCellTextClassName}>{moneyFormatter.format(row.original.actualAmount)}</div>,
        size: 120,
    },
    {
        accessorKey: 'qtyDelta',
        header: () => <div className="text-right">Δ Кол-во</div>,
        cell: ({ row }) => <div className="flex justify-end">{renderDeltaBadge(row.original.qtyDelta)}</div>,
        size: 130,
    },
    {
        accessorKey: 'amountDelta',
        header: () => <div className="text-right">Δ Сумма</div>,
        cell: ({ row }) => <div className="flex justify-end">{renderDeltaBadge(row.original.amountDelta)}</div>,
        size: 140,
    },
];
