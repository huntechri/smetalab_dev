'use client';

import { useEffect, useMemo, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/shared/ui/badge';
import { Skeleton } from '@/shared/ui/skeleton';
import { DataTable } from '@/shared/ui/data-table';
import { Button } from '@/components/ui/button';
import { Download, MoreHorizontal } from 'lucide-react';
import { estimateProcurementActionsRepo } from '@/features/projects/estimates/repository/procurement.actions';
import type { EstimateProcurementRow } from '@/shared/types/estimate-procurement';
import { EstimateTotals } from '../EstimateTotals';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/shared/ui/dropdown-menu';
import { projectBadgeClassName, projectStatusBadgeToneClassName } from '@/features/projects/shared/ui/project-badge-styles';

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
    positive: projectStatusBadgeToneClassName.success,
    zero: projectStatusBadgeToneClassName.neutral,
    negative: projectStatusBadgeToneClassName.danger,
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

const columns: ColumnDef<EstimateProcurementRow>[] = [
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

    const handleExport = () => {
        window.open(`/api/estimates/${estimateId}/export/procurement`, '_blank', 'noopener,noreferrer');
    };

    return (
        <div className="space-y-2">
            <DataTable
                columns={columns}
                data={rows}
                filterColumn="materialName"
                filterPlaceholder="Поиск..."
                height="600px"
                compactMobileToolbar
                actions={(
                    <>
                        <Button variant="outline" size="sm" className="hidden h-8 gap-1.5 sm:inline-flex" onClick={handleExport}>
                            <Download className="h-4 w-4" />
                            Экспорт Excel
                        </Button>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="icon" className="h-8 w-8 sm:hidden">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={handleExport}>
                                    <Download className="mr-2 h-4 w-4" />
                                    Экспорт Excel
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </>
                )}
            />
            <div className="flex justify-end border-t border-border/60 bg-background/95 px-1 pt-1">
                <EstimateTotals planned={totals.planned} actual={totals.actual} />
            </div>
        </div>
    );
}
