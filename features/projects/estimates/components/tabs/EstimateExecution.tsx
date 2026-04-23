'use client';

import { useEffect, useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/shared/ui/badge';
import { Skeleton } from '@/shared/ui/skeleton';
import { Input } from '@/shared/ui/input';
import { MoneyCell } from '@/shared/ui/cells/money-cell';
import { FilePlus, Search } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';
import { parseDecimalInput, toDecimalInput } from '@/features/projects/estimates/lib/decimal-input';
import { EstimateExecutionRow, EstimateExecutionStatus } from '@/features/projects/estimates/types/execution.dto';
import { useEstimateExecutionController } from '../../hooks/use-estimate-execution-controller';
import { EstimateTotals } from '../EstimateTotals';
import { EstimateExecutionTableActions } from './execution/EstimateExecutionTableActions';
import { EstimateExecutionAddExtraWorkSheet } from './execution/EstimateExecutionAddExtraWorkSheet';
import { EstimateInlineNumberCell } from '../table/cards/EstimateInlineNumberCell';
import { WORK_NUMBER_CLASS } from '../table/cards/constants';

const moneyFormatter = new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 2,
});

const numberFormatter = new Intl.NumberFormat('ru-RU', {
    maximumFractionDigits: 2,
});

function getStatusDisplay(status: EstimateExecutionStatus) {
    const variant = status === 'done'
        ? 'success'
        : status === 'in_progress'
            ? 'info'
            : 'warning';

    const label = status === 'done' 
        ? 'Выполнено' 
        : status === 'in_progress' 
            ? 'В процессе' 
            : 'Подготовка';

    return <Badge variant={variant} className="min-w-[88px] cursor-pointer h-4 sm:h-5 px-1 sm:px-1.5 text-[9px] sm:text-[10px] font-semibold normal-case leading-none tracking-tight shadow-none border">{label}</Badge>;
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



function ExecutionValue({
    label,
    value,
    tone = 'neutral',
}: {
    label: string;
    value: React.ReactNode;
    tone?: 'neutral' | 'success' | 'info';
}) {
    const toneClasses = {
        neutral: 'border-slate-200 bg-slate-50 text-slate-600',
        info: 'border-blue-200 bg-blue-50 text-blue-600',
        success: 'border-green-200 bg-green-50 text-green-600',
    };

    return (
        <Badge 
            variant="outline" 
            className={cn(
                "h-4 sm:h-5 px-1 sm:px-1.5 text-[9px] sm:text-[10px] font-semibold normal-case leading-none tracking-tight border shadow-none flex items-center",
                toneClasses[tone]
            )}
        >
            <span className="opacity-70">{label}:</span>
            <div className="flex items-center ml-0.5">{value}</div>
        </Badge>
    );
}

export function EstimateExecution({ estimateId }: { estimateId: string }) {
    const {
        rows,
        isLoading,
        errorMessage,
        patchRow,
        addExtraWorkFromCatalog,
        handleExport,
        totals,
        addedWorkNames,
    } = useEstimateExecutionController({ estimateId });

    const [searchValue, setSearchValue] = useState('');

    const filteredRows = useMemo(() => {
        const query = searchValue.trim().toLowerCase();

        if (!query) {
            return rows;
        }

        return rows.filter((row) =>
            row.name.toLowerCase().includes(query) ||
            row.unit.toLowerCase().includes(query) ||
            row.code?.toLowerCase().includes(query)
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
        return (
            <div className="flex flex-col gap-4">
                <div className="flex justify-end">
                    <EstimateExecutionAddExtraWorkSheet
                        addedWorkNames={addedWorkNames}
                        onAddWork={addExtraWorkFromCatalog}
                    />
                </div>
                <div className="flex min-h-[220px] flex-col items-center justify-center rounded-md border border-dashed border-border bg-muted/30 p-4 text-center text-sm text-muted-foreground">
                    <FilePlus className="mb-2 size-6" aria-hidden="true" />
                    <p className="font-medium mb-1">Список выполнения пуст</p>
                    <p className="opacity-80">Для начала работы добавьте позиции во вкладку «Смета» или создайте дополнительную работу</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-1.5 sm:space-y-2 [--execution-height:calc(100vh-250px)] sm:[--execution-height:calc(100vh-280px)]">
            <section className="flex flex-col rounded-lg border border-border bg-card text-card-foreground shadow-none">
                {/* Фиксированная верхняя панель (поиск и экспорт) */}
                <div className="p-1.5 sm:p-3 pb-0">
                    <div className="mb-2 sm:mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div className="relative min-w-0 flex-1">
                            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                            <Input
                                value={searchValue}
                                onChange={(event) => setSearchValue(event.target.value)}
                                placeholder="Поиск..."
                                size="xs"
                                className="rounded-md border-border bg-background pl-8"
                                aria-label="Поиск работ"
                            />
                        </div>
                        <EstimateExecutionTableActions
                            addedWorkNames={addedWorkNames}
                            onExport={handleExport}
                            onAddWork={addExtraWorkFromCatalog}
                        />
                    </div>
                </div>

                {/* Прокручиваемая область карточек */}
                <div className="max-h-[var(--execution-height)] overflow-y-auto px-1.5 pb-1.5 sm:px-3 sm:pb-3">
                    {filteredRows.length > 0 ? (
                        <div className="space-y-2">
                            {filteredRows.map((row) => (
                                <article
                                    key={row.id}
                                    className="overflow-hidden rounded-md border border-border bg-card shadow-[0_1px_2px_rgba(0,0,0,0.04)] sm:rounded-lg"
                                >
                                    <div className="grid grid-cols-1 gap-4 p-2 sm:p-3 lg:grid-cols-[2.5fr_1fr_1.5fr] lg:gap-6">
                                        {/* Раздел 1: Основная информация */}
                                        <div className="flex flex-col justify-center min-w-0">
                                            <div className="flex items-start gap-1.5">
                                                {row.code && (
                                                    <span className="shrink-0 text-[9px] font-semibold leading-tight text-slate-500 sm:text-[10px]">
                                                        {row.code}
                                                    </span>
                                                )}
                                                <span 
                                                    className="min-w-0 flex-1 text-[9px] font-semibold leading-tight text-slate-800 sm:text-[10px]" 
                                                    title={row.name}
                                                >
                                                    {row.name}
                                                </span>
                                                <Badge
                                                    variant="outline"
                                                    className="h-4 shrink-0 border-slate-200 bg-white px-1 py-0 text-[9px] leading-none text-slate-600 sm:h-5 sm:px-1.5 sm:text-[10px] font-bold normal-case shadow-none"
                                                >
                                                    {row.unit}
                                                </Badge>
                                            </div>
                                            
                                            <div className="mt-2 flex flex-wrap gap-1.5">
                                                {row.source === 'extra' && (
                                                    <Badge
                                                        variant="outline"
                                                        className="h-4 sm:h-5 px-1.5 text-[9px] sm:text-[10px] font-bold normal-case leading-none shadow-none bg-amber-50 text-amber-700 border-amber-200"
                                                    >
                                                        Доп. работа
                                                    </Badge>
                                                )}
                                                <ExecutionStatusCell
                                                    currentStatus={row.status}
                                                    onStatusChange={(status) => void patchRow(row.id, { status })}
                                                />
                                            </div>
                                        </div>

                                        {/* Контейнер для План и Факт */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:contents">
                                            {/* Раздел 2: План */}
                                            <div className="space-y-2.5">
                                                <div className="flex items-center gap-2 border-b border-blue-100/50 pb-1.5 dark:border-blue-900/30">
                                                    <div className="h-1.5 w-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                                                    <span className="text-[9px] font-bold uppercase tracking-widest text-blue-600 sm:text-[10px]">План</span>
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    <ExecutionValue label="Кол-во" value={numberFormatter.format(row.plannedQty)} />
                                                    <ExecutionValue label="Цена" value={moneyFormatter.format(row.plannedPrice)} />
                                                    <ExecutionValue label="Итого" value={<MoneyCell value={row.plannedSum} />} tone="info" />
                                                </div>
                                            </div>

                                            {/* Раздел 3: Факт */}
                                            <div className="space-y-2.5">
                                                <div className="flex items-center gap-2 border-b border-green-100/50 pb-1.5 dark:border-green-900/30">
                                                    <div className="h-1.5 w-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                                                    <span className="text-[9px] font-bold uppercase tracking-widest text-green-600 sm:text-[10px]">Факт</span>
                                                </div>
                                                <div className="flex flex-wrap gap-2 items-center">
                                                    <div className="inline-flex h-4 items-center gap-1 rounded-full border border-slate-300 bg-slate-50 px-1.5 py-0 text-[10px] text-slate-600 sm:h-5 sm:px-2 sm:text-[10px]">
                                                        <span>Кол-во</span>
                                                        <EstimateInlineNumberCell
                                                            value={row.actualQty}
                                                            onCommit={async (val) => {
                                                                const nextValue = parseDecimalInput(val);
                                                                if (Number.isFinite(nextValue) && nextValue >= 0 && nextValue !== row.actualQty) {
                                                                    await patchRow(row.id, { actualQty: nextValue });
                                                                }
                                                            }}
                                                            ariaLabel={`Количество: ${row.name}`}
                                                            className={WORK_NUMBER_CLASS}
                                                        />
                                                    </div>
                                                    <div className="inline-flex h-4 items-center gap-1 rounded-full border border-slate-300 bg-slate-50 px-1.5 py-0 text-[10px] text-slate-600 sm:h-5 sm:px-2 sm:text-[10px]">
                                                        <span>Цена</span>
                                                        <EstimateInlineNumberCell
                                                            value={row.actualPrice}
                                                            onCommit={async (val) => {
                                                                const nextValue = parseDecimalInput(val);
                                                                if (Number.isFinite(nextValue) && nextValue >= 0 && nextValue !== row.actualPrice) {
                                                                    await patchRow(row.id, { actualPrice: nextValue });
                                                                }
                                                            }}
                                                            ariaLabel={`Цена: ${row.name}`}
                                                            className={WORK_NUMBER_CLASS}
                                                        />
                                                        <span>₽</span>
                                                    </div>
                                                    <Badge
                                                        variant="success"
                                                        className="h-4 border border-green-200 bg-green-100 px-2 py-0 text-[11px] font-bold leading-none text-green-600 sm:h-5 sm:px-2.5 sm:text-[10px]"
                                                    >
                                                        <MoneyCell value={row.actualSum} />
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    ) : (
                        <div className="flex min-h-[220px] flex-col items-center justify-center rounded-md border border-dashed border-border bg-muted/30 p-4 text-center text-sm text-muted-foreground">
                            <FilePlus className="mb-2 size-6" aria-hidden="true" />
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
