'use client';

import { useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
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

    if (value < 0) {
        return <Badge variant="destructive">{numberFormatter.format(value)}</Badge>;
    }

    return <Badge className="bg-emerald-600 hover:bg-emerald-600">+{numberFormatter.format(value)}</Badge>;
};

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

            <div className="rounded-md border bg-background">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Материал</TableHead>
                            <TableHead>Ед.</TableHead>
                            <TableHead className="text-right">План кол-во</TableHead>
                            <TableHead className="text-right">План цена</TableHead>
                            <TableHead className="text-right">План сумма</TableHead>
                            <TableHead className="text-right">Факт кол-во</TableHead>
                            <TableHead className="text-right">Факт ср. цена</TableHead>
                            <TableHead className="text-right">Факт сумма</TableHead>
                            <TableHead className="text-right">Δ кол-во</TableHead>
                            <TableHead className="text-right">Δ сумма</TableHead>
                            <TableHead>Источник</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {rows.map((row) => (
                            <TableRow key={`${row.source}-${row.materialName}-${row.unit}`}>
                                <TableCell className="font-medium">{row.materialName}</TableCell>
                                <TableCell>{row.unit}</TableCell>
                                <TableCell className="text-right">{numberFormatter.format(row.plannedQty)}</TableCell>
                                <TableCell className="text-right">{moneyFormatter.format(row.plannedPrice)}</TableCell>
                                <TableCell className="text-right">{moneyFormatter.format(row.plannedAmount)}</TableCell>
                                <TableCell className="text-right">{numberFormatter.format(row.actualQty)}</TableCell>
                                <TableCell className="text-right">{moneyFormatter.format(row.actualAvgPrice)}</TableCell>
                                <TableCell className="text-right">{moneyFormatter.format(row.actualAmount)}</TableCell>
                                <TableCell className="text-right">{renderDeltaBadge(row.qtyDelta)}</TableCell>
                                <TableCell className="text-right">{renderDeltaBadge(row.amountDelta)}</TableCell>
                                <TableCell>
                                    <Badge variant={row.source === 'fact_only' ? 'destructive' : 'secondary'}>
                                        {row.source === 'fact_only' ? 'Только факт' : 'Смета'}
                                    </Badge>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
