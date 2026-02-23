'use client';

import { useEffect, useMemo, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { DataTable } from '@/components/ui/data-table';
import { estimateProcurementActionsRepo } from '@/features/projects/estimates/repository/procurement.actions';
import { EstimateProcurementRow } from '@/lib/services/estimate-procurement.service';
import { EstimateTotals } from '../EstimateTotals';

const moneyFormatter = new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 2,
});

const numberFormatter = new Intl.NumberFormat('ru-RU', {
    maximumFractionDigits: 2,
});

const tableCellTextClassName = 'text-xs md:text-sm';
const tableNumericCellTextClassName = 'text-right tabular-nums text-xs md:text-sm';

const renderDeltaBadge = (value: number) => {
    if (value === 0) {
        return <Badge variant="secondary" className="h-6 px-2 text-xs md:text-sm">0</Badge>;
    }

    if (value > 0) {
        return <Badge className="h-6 px-2 text-xs md:text-sm bg-emerald-600 hover:bg-emerald-600">+{numberFormatter.format(value)}</Badge>;
    }

    return <Badge variant="destructive" className="h-6 px-2 text-xs md:text-sm">{numberFormatter.format(value)}</Badge>;
};

const columns: ColumnDef<EstimateProcurementRow>[] = [
    {
        accessorKey: 'materialName',
        header: 'Материал',
        cell: ({ row }) => <div className="font-medium text-xs md:text-sm">{row.original.materialName}</div>,
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
        cell: ({ row }) => <div className={tableNumericCellTextClassName}>{numberFormatter.format(row.original.plannedQty)}</div>,
        size: 100,
    },
    {
        accessorKey: 'plannedPrice',
        header: () => <div className="text-right">Цена</div>,
        cell: ({ row }) => <div className={tableNumericCellTextClassName}>{moneyFormatter.format(row.original.plannedPrice)}</div>,
        size: 110,
    },
    {
        accessorKey: 'plannedAmount',
        header: () => <div className="text-right">Сумма</div>,
        cell: ({ row }) => <div className={tableNumericCellTextClassName}>{moneyFormatter.format(row.original.plannedAmount)}</div>,
        size: 120,
    },
    {
        accessorKey: 'actualQty',
        header: () => <div className="text-right">ф. Кол-во</div>,
        cell: ({ row }) => <div className={tableNumericCellTextClassName}>{numberFormatter.format(row.original.actualQty)}</div>,
        size: 100,
    },
    {
        accessorKey: 'actualAvgPrice',
        header: () => <div className="text-right">Ср. цена</div>,
        cell: ({ row }) => <div className={tableNumericCellTextClassName}>{moneyFormatter.format(row.original.actualAvgPrice)}</div>,
        size: 110,
    },
    {
        accessorKey: 'actualAmount',
        header: () => <div className="text-right">ф. Сумма</div>,
        cell: ({ row }) => <div className={tableNumericCellTextClassName}>{moneyFormatter.format(row.original.actualAmount)}</div>,
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

export function EstimateProcurement({ estimateId }: { estimateId: string }) {
    const [rows, setRows] = useState<EstimateProcurementRow[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        let active = true;

        const loadRows = async () => {
            try {
                setIsLoading(true);
                setErrorMessage(null);
                const data = await estimateProcurementActionsRepo.list(estimateId);

                if (!active) {
                    return;
                }

                setRows(data);
            } catch (error) {
                if (!active) {
                    return;
                }

                setErrorMessage(error instanceof Error ? error.message : 'Не удалось загрузить закупки сметы');
            } finally {
                if (active) {
                    setIsLoading(false);
                }
            }
        };

        void loadRows();

        return () => {
            active = false;
        };
    }, [estimateId]);

    const totals = useMemo(() => rows.reduce((acc, row) => {
        acc.planned += row.plannedAmount;
        acc.actual += row.actualAmount;
        return acc;
    }, { planned: 0, actual: 0 }), [rows]);

    if (isLoading) {
        return (
            <div className="space-y-2">
                <Skeleton className="h-9 w-full" />
                <Skeleton className="h-[420px] w-full" />
            </div>
        );
    }

    if (errorMessage) {
        return <div className="rounded-md border p-4 text-sm text-destructive">{errorMessage}</div>;
    }

    if (rows.length === 0) {
        return <div className="rounded-md border p-4 text-sm text-muted-foreground">В смете и закупках нет материалов для отображения.</div>;
    }

    return (
        <div className="space-y-4">
            <DataTable
                columns={columns}
                data={rows}
                filterColumn="materialName"
                filterPlaceholder="Поиск по материалам..."
                height="580px"
            />
            <div className="flex justify-end px-1">
                <EstimateTotals planned={totals.planned} actual={totals.actual} />
            </div>
        </div>
    );
}
