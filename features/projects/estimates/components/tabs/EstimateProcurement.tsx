'use client';

import { useEffect, useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@repo/ui';
import { Skeleton } from '@repo/ui';
import { Button } from '@repo/ui';
import { Input } from '@repo/ui';
import { Download, PackageSearch, Search } from 'lucide-react';
import { estimateProcurementActionsRepo } from '@/features/projects/estimates/repository/procurement.actions';
import type { EstimateProcurementRow } from '@/shared/types/estimate-procurement';
import { EstimateTotals } from '../EstimateTotals';

const moneyFormatter = new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 2,
});

const numberFormatter = new Intl.NumberFormat('ru-RU', {
    maximumFractionDigits: 2,
});
const renderDeltaBadge = (value: number, label: string, formatter: Intl.NumberFormat) => {
    const baseClass = "h-4 sm:h-5 px-1 sm:px-1.5 text-[10px] sm:text-[11px] font-bold normal-case leading-none border";
    
    let toneClass = "border-slate-300 bg-slate-50 text-slate-600";
    if (value > 0) toneClass = "border-green-200 bg-green-100 text-green-600";
    if (value < 0) toneClass = "border-rose-200 bg-rose-50 text-rose-600";

    return (
        <Badge variant="outline" className={cn(baseClass, toneClass)}>
            <span className="opacity-70">{label}:</span>
            <span className="ml-0.5 tabular-nums">
                {value > 0 ? '+' : ''}{formatter.format(value)}
            </span>
        </Badge>
    );
};

function ProcurementValue({
    label,
    value,
    tone = 'neutral',
}: {
    label: string;
    value: string;
    tone?: 'neutral' | 'success' | 'info';
}) {
    // Map tone to specific border/bg/text combinations from EstimateMaterialCard
    const toneClasses = {
        neutral: 'border-slate-300 bg-slate-50 text-slate-600',
        info: 'border-blue-200 bg-blue-50 text-blue-600',
        success: 'border-green-200 bg-green-100 text-green-600',
    };

    return (
        <Badge 
            variant="outline" 
            className={cn(
                "h-4 sm:h-5 px-1 sm:px-1.5 text-[10px] sm:text-[11px] font-semibold normal-case leading-none tracking-tight border",
                toneClasses[tone]
            )}
        >
            <span className="opacity-70">{label}:</span>
            <span className="tabular-nums ml-0.5">{value}</span>
        </Badge>
    );
}

export function EstimateProcurement({ estimateId }: { estimateId: string }) {
    const [rows, setRows] = useState<EstimateProcurementRow[]>([]);
    const [searchValue, setSearchValue] = useState('');
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

    const filteredRows = useMemo(() => {
        const query = searchValue.trim().toLowerCase();

        if (!query) {
            return rows;
        }

        return rows.filter((row) =>
            row.materialName.toLowerCase().includes(query) ||
            row.unit.toLowerCase().includes(query),
        );
    }, [rows, searchValue]);

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
        <div className="space-y-1.5 sm:space-y-2 [--procurement-height:calc(100vh-250px)] sm:[--procurement-height:calc(100vh-280px)]">
            <section className="flex h-[var(--procurement-height)] flex-col rounded-lg border border-[#e4e4e7] bg-white text-[#09090b] shadow-none">
                {/* Фиксированная верхняя панель (поиск и экспорт) */}
                <div className="p-1.5 sm:p-3 pb-0">
                    <div className="mb-2 sm:mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div className="relative min-w-0 flex-1">
                            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-[#71717a]" aria-hidden="true" />
                            <Input
                                value={searchValue}
                                onChange={(event) => setSearchValue(event.target.value)}
                                placeholder="Поиск..."
                                size="xs"
                                className="rounded-md border-[#e4e4e7] bg-white pl-8"
                                aria-label="Поиск закупок"
                            />
                        </div>
                        <Button
                            variant="outline"
                            size="xs"
                            className="shrink-0"
                            onClick={handleExport}
                        >
                            <Download className="mr-2 size-3.5" aria-hidden="true" />
                            Экспорт Excel
                        </Button>
                    </div>
                </div>

                {/* Прокручиваемая область карточек */}
                <div className="flex-1 overflow-y-auto px-1.5 pb-1.5 sm:px-3 sm:pb-3">
                    {filteredRows.length > 0 ? (
                        <div className="space-y-2">
                            {filteredRows.map((row) => (
                                <article
                                    key={`${row.materialName}-${row.unit}-${row.source}`}
                                    className="overflow-hidden rounded-md border border-[#e4e4e7] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)] sm:rounded-lg"
                                >
                                    <div className="grid grid-cols-1 gap-4 p-2 sm:p-3 lg:grid-cols-[2.5fr_1fr_1fr_1fr] lg:gap-6">
                                        {/* Раздел 1: Основная информация */}
                                        <div className="flex flex-col justify-center min-w-0">
                                            <div className="flex items-start gap-1.5">
                                                <span 
                                                    className="min-w-0 flex-1 text-[10px] font-semibold leading-tight text-slate-800 sm:text-[11px]" 
                                                    title={row.materialName}
                                                >
                                                    {row.materialName}
                                                </span>
                                                <Badge
                                                    variant="outline"
                                                    className="h-4 shrink-0 border-slate-200 bg-white px-1 py-0 text-[10px] leading-none text-slate-600 sm:h-5 sm:px-1.5 sm:text-[11px] font-bold normal-case"
                                                >
                                                    {row.unit}
                                                </Badge>
                                            </div>
                                            {row.source === 'fact_only' && (
                                                <div className="mt-1.5">
                                                    <Badge
                                                        variant="warning"
                                                        className="h-4 sm:h-5 px-1.5 text-[10px] sm:text-[11px] font-bold normal-case leading-none"
                                                    >
                                                        Только факт
                                                    </Badge>
                                                </div>
                                            )}
                                        </div>

                                        {/* Контейнер для План, Факт и Отклонение: сетка 1х3 на мобильных, колонки на десктопе */}
                                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:contents">
                                            {/* Раздел 2: План */}
                                            <div className="space-y-2.5">
                                                <div className="flex items-center gap-2 border-b border-blue-50 pb-1.5">
                                                    <div className="h-1.5 w-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                                                    <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600/90 sm:text-[11px]">План</span>
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    <ProcurementValue label="Кол-во" value={numberFormatter.format(row.plannedQty)} />
                                                    <ProcurementValue label="Цена" value={moneyFormatter.format(row.plannedPrice)} />
                                                    <ProcurementValue label="Итого" value={moneyFormatter.format(row.plannedAmount)} tone="info" />
                                                </div>
                                            </div>

                                            {/* Раздел 3: Факт */}
                                            <div className="space-y-2.5">
                                                <div className="flex items-center gap-2 border-b border-green-50 pb-1.5">
                                                    <div className="h-1.5 w-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                                                    <span className="text-[10px] font-bold uppercase tracking-widest text-green-600/90 sm:text-[11px]">Факт</span>
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    <ProcurementValue label="Кол-во" value={numberFormatter.format(row.actualQty)} />
                                                    <ProcurementValue label="Цена" value={moneyFormatter.format(row.actualAvgPrice)} />
                                                    <ProcurementValue label="Итого" value={moneyFormatter.format(row.actualAmount)} tone="success" />
                                                </div>
                                            </div>

                                            {/* Раздел 4: Отклонение */}
                                            <div className="col-span-2 sm:col-span-1 space-y-2.5">
                                                <div className="flex items-center gap-2 border-b border-orange-50 pb-1.5">
                                                    <div className="h-1.5 w-1.5 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]" />
                                                    <span className="text-[10px] font-bold uppercase tracking-widest text-orange-600/90 sm:text-[11px]">Откл.</span>
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    {renderDeltaBadge(row.qtyDelta, "Кол-во", numberFormatter)}
                                                    {renderDeltaBadge(row.amountDelta, "Итого", moneyFormatter)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    ) : (
                        <div className="flex min-h-[220px] flex-col items-center justify-center rounded-md border border-dashed border-[#e4e4e7] bg-[#fafafa] p-4 text-center text-sm text-[#71717a]">
                            <PackageSearch className="mb-2 size-6" aria-hidden="true" />
                            По вашему запросу ничего не найдено.
                        </div>
                    )}
                </div>
            </section>
            <div className="flex justify-end border-t border-border/60 bg-background/95 px-1 pt-1">
                <EstimateTotals planned={totals.planned} actual={totals.actual} />
            </div>
        </div>
    );
}
