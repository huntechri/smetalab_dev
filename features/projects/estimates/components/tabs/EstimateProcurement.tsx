'use client';

import { useEffect, useMemo, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { DataTable } from '@/components/ui/data-table';
import { estimateProcurementActionsRepo } from '@/features/projects/estimates/repository/procurement.actions';
import { EstimateProcurementRow } from '@/lib/services/estimate-procurement.service';

const moneyFormatter = new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 2,
});

const numberFormatter = new Intl.NumberFormat('ru-RU', {
    maximumFractionDigits: 2,
});

const renderDeltaBadge = (value: number) => {
    if (value === 0) {
        return <Badge variant="secondary">0</Badge>;
    }

    if (value > 0) {
        return <Badge variant="destructive">+{numberFormatter.format(value)}</Badge>;
    }

    return <Badge className="bg-emerald-600 hover:bg-emerald-600">{numberFormatter.format(value)}</Badge>;
};

const columns: ColumnDef<EstimateProcurementRow>[] = [
    {
        accessorKey: 'materialName',
        header: 'Материал',
        cell: ({ row }) => <div className="font-medium">{row.original.materialName}</div>,
        size: 220,
    },
    {
        accessorKey: 'unit',
        header: 'Ед.',
        size: 80,
    },
    {
        accessorKey: 'plannedQty',
        header: () => <div className="text-right">План кол-во</div>,
        cell: ({ row }) => <div className="text-right">{numberFormatter.format(row.original.plannedQty)}</div>,
        size: 120,
    },
    {
        accessorKey: 'plannedPrice',
        header: () => <div className="text-right">План цена</div>,
        cell: ({ row }) => <div className="text-right">{moneyFormatter.format(row.original.plannedPrice)}</div>,
        size: 140,
    },
    {
        accessorKey: 'plannedAmount',
        header: () => <div className="text-right">План сумма</div>,
        cell: ({ row }) => <div className="text-right">{moneyFormatter.format(row.original.plannedAmount)}</div>,
        size: 150,
    },
    {
        accessorKey: 'actualQty',
        header: () => <div className="text-right">Факт кол-во</div>,
        cell: ({ row }) => <div className="text-right">{numberFormatter.format(row.original.actualQty)}</div>,
        size: 120,
    },
    {
        accessorKey: 'actualAvgPrice',
        header: () => <div className="text-right">Факт ср. цена</div>,
        cell: ({ row }) => <div className="text-right">{moneyFormatter.format(row.original.actualAvgPrice)}</div>,
        size: 150,
    },
    {
        accessorKey: 'actualAmount',
        header: () => <div className="text-right">Факт сумма</div>,
        cell: ({ row }) => <div className="text-right">{moneyFormatter.format(row.original.actualAmount)}</div>,
        size: 150,
    },
    {
        accessorKey: 'qtyDelta',
        header: () => <div className="text-right">Δ кол-во (план-факт)</div>,
        cell: ({ row }) => <div className="flex justify-end">{renderDeltaBadge(row.original.qtyDelta)}</div>,
        size: 170,
    },
    {
        accessorKey: 'amountDelta',
        header: () => <div className="text-right">Δ сумма (план-факт)</div>,
        cell: ({ row }) => <div className="flex justify-end">{renderDeltaBadge(row.original.amountDelta)}</div>,
        size: 180,
    },
    {
        accessorKey: 'source',
        header: 'Источник',
        cell: ({ row }) => (
            <Badge variant={row.original.source === 'fact_only' ? 'destructive' : 'secondary'}>
                {row.original.source === 'fact_only' ? 'Только факт' : 'Смета'}
            </Badge>
        ),
        size: 120,
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
        <div className="space-y-3">
            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                <Badge variant="outline">План: {moneyFormatter.format(totals.planned)}</Badge>
                <Badge variant="outline">Факт: {moneyFormatter.format(totals.actual)}</Badge>
            </div>

            <DataTable
                columns={columns}
                data={rows}
                filterColumn="materialName"
                filterPlaceholder="Поиск по материалам..."
                height="680px"
            />
        </div>
    );
}
