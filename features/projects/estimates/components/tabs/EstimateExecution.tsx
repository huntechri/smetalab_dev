'use client';

import { cn } from '@/lib/utils';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Input } from '@/components/ui/input';
import { WorkCatalogPicker } from '@/features/catalog/components/WorkCatalogPicker.client';
import { CatalogWork } from '@/features/catalog/types/dto';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import { estimateExecutionActionsRepo } from '../../repository/execution.actions';
import { EstimateExecutionRow, EstimateExecutionStatus } from '../../types/execution.dto';
import { parseDecimalInput, toDecimalInput } from '../../lib/decimal-input';
import { buildExtraWorkFromCatalog } from '../../lib/execution-extra-work';
import { EstimateTotals } from '../EstimateTotals';

const moneyFormatter = new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 2,
});

const numberFormatter = new Intl.NumberFormat('ru-RU', {
    maximumFractionDigits: 2,
});

function getStatusDisplay(status: EstimateExecutionStatus) {
    const base = "cursor-pointer border-0 w-[110px] justify-center text-[10px] uppercase font-bold tracking-tight h-6 px-2";
    if (status === 'done') {
        return <Badge className={cn("bg-emerald-600 hover:bg-emerald-600 text-white", base)}>Выполнено</Badge>;
    }

    if (status === 'in_progress') {
        return <Badge className={cn("bg-blue-500 hover:bg-blue-600 text-white", base)}>В процессе</Badge>;
    }

    return <Badge className={cn("bg-orange-500 hover:bg-orange-600 text-white", base)}>Подготовка</Badge>;
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
            <DropdownMenuContent align="end" className="p-1 min-w-[130px]">
                <DropdownMenuItem onClick={() => onStatusChange('not_started')} className="focus:bg-orange-50 focus:text-orange-700 cursor-pointer rounded-md mb-0.5">
                    <div className="flex items-center gap-2 w-full">
                        <div className="w-2 h-2 rounded-full bg-orange-500" />
                        <span className="text-xs font-medium">Подготовка</span>
                    </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onStatusChange('in_progress')} className="focus:bg-blue-50 focus:text-blue-700 cursor-pointer rounded-md mb-0.5">
                    <div className="flex items-center gap-2 w-full">
                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                        <span className="text-xs font-medium">В процессе</span>
                    </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onStatusChange('done')} className="focus:bg-emerald-50 focus:text-emerald-700 cursor-pointer rounded-md">
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
            className="h-8 text-right tabular-nums text-xs md:text-sm"
        />
    );
}

function AddExtraWorkSheet({ estimateId, onCreated, addedWorkNames }: {
    estimateId: string;
    onCreated: (row: EstimateExecutionRow) => void;
    addedWorkNames: Set<string>;
}) {
    const [open, setOpen] = useState(false);
    const { toast } = useToast();

    const addWorkFromCatalog = async (catalogWork: CatalogWork) => {
        try {
            const created = await estimateExecutionActionsRepo.addExtraWork(estimateId, buildExtraWorkFromCatalog(catalogWork));

            onCreated(created);
            toast({ title: 'Работа добавлена во вкладку «Выполнение»', description: created.name });
            setOpen(false);
        } catch (error) {
            toast({ variant: 'destructive', title: 'Ошибка', description: error instanceof Error ? error.message : 'Не удалось добавить работу из справочника.' });
        }
    };

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button size="sm" variant="outline">Добавить доп. работу</Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:max-w-md">
                <SheetHeader>
                    <SheetTitle>Справочник работ</SheetTitle>
                    <SheetDescription>
                        Выберите работу из справочника. Позиция будет добавлена только во вкладку «Выполнение».
                    </SheetDescription>
                </SheetHeader>

                <div className="mt-6 h-[calc(100vh-140px)] overflow-hidden">
                    <WorkCatalogPicker
                        onAddWork={(work) => void addWorkFromCatalog(work)}
                        addedWorkNames={addedWorkNames}
                    />
                </div>
            </SheetContent>
        </Sheet>
    );
}

export function EstimateExecution({ estimateId }: { estimateId: string }) {
    const [rows, setRows] = useState<EstimateExecutionRow[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const requestVersionRef = useRef<Record<string, number>>({});
    const { toast } = useToast();

    const loadRows = useCallback(async (silent = false) => {
        try {
            if (!silent) {
                setIsLoading(true);
            }
            setErrorMessage(null);
            const data = await estimateExecutionActionsRepo.list(estimateId);
            setRows(data);
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : 'Не удалось загрузить выполнение сметы');
        } finally {
            if (!silent) {
                setIsLoading(false);
            }
        }
    }, [estimateId]);

    useEffect(() => {
        void loadRows();
    }, [loadRows]);

    useEffect(() => {
        const onCoefUpdated = (event: Event) => {
            const customEvent = event as CustomEvent<{ estimateId?: string }>;
            if (customEvent.detail?.estimateId !== estimateId) {
                return;
            }
            void loadRows(true);
        };

        window.addEventListener('estimate:coefficient-updated', onCoefUpdated as (event: Event) => void);
        return () => window.removeEventListener('estimate:coefficient-updated', onCoefUpdated as (event: Event) => void);
    }, [estimateId, loadRows]);

    const patchRow = useCallback(async (rowId: string, patch: { actualQty?: number; actualPrice?: number; status?: EstimateExecutionStatus }) => {
        requestVersionRef.current[rowId] = (requestVersionRef.current[rowId] ?? 0) + 1;
        const requestVersion = requestVersionRef.current[rowId];
        let previousRow: EstimateExecutionRow | null = null;

        setRows((currentRows) => currentRows.map((row) => {
            if (row.id !== rowId) {
                return row;
            }

            previousRow = row;

            const nextQty = patch.actualQty ?? row.actualQty;
            const nextPrice = patch.actualPrice ?? row.actualPrice;

            return {
                ...row,
                ...patch,
                isCompleted: patch.status ? patch.status === 'done' : row.isCompleted,
                actualQty: nextQty,
                actualPrice: nextPrice,
                actualSum: nextQty * nextPrice,
            };
        }));

        try {
            const updated = await estimateExecutionActionsRepo.patch(estimateId, rowId, patch);
            if (requestVersion !== requestVersionRef.current[rowId]) {
                return;
            }

            setRows((current) => current.map((item) => item.id === rowId ? {
                ...item,
                ...updated,
            } : item));
        } catch (error) {
            if (requestVersion === requestVersionRef.current[rowId] && previousRow) {
                setRows((current) => current.map((row) => row.id === rowId ? previousRow as EstimateExecutionRow : row));
            }
            toast({ variant: 'destructive', title: 'Ошибка', description: error instanceof Error ? error.message : 'Не удалось сохранить изменения.' });
        }
    }, [estimateId, toast]);

    const columns = useMemo<ColumnDef<EstimateExecutionRow>[]>(() => [
        {
            accessorKey: 'code',
            header: 'Код',
            size: 60,
            cell: ({ row }) => <span className="text-xs text-muted-foreground">{row.original.code}</span>,
        },
        {
            accessorKey: 'name',
            header: 'Работа',
            size: 450,
            cell: ({ row }) => (
                <div className="space-y-1">
                    <div className="font-medium text-xs md:text-sm leading-tight">{row.original.name}</div>
                    {row.original.source === 'extra' ? (
                        <Badge variant="secondary" className="text-[9px] uppercase tracking-wider h-4 px-1">
                            Доп. работа
                        </Badge>
                    ) : null}
                </div>
            ),
        },
        {
            accessorKey: 'unit',
            header: 'Ед.',
            size: 80,
        },
        {
            accessorKey: 'plannedQty',
            header: () => <div className="text-right whitespace-nowrap">Кол-во</div>,
            cell: ({ row }) => <div className="text-right tabular-nums">{numberFormatter.format(row.original.plannedQty)}</div>,
            size: 120,
        },
        {
            accessorKey: 'plannedPrice',
            header: () => <div className="text-right whitespace-nowrap">Цена</div>,
            cell: ({ row }) => <div className="text-right tabular-nums">{moneyFormatter.format(row.original.plannedPrice)}</div>,
            size: 120,
        },
        {
            accessorKey: 'plannedSum',
            header: () => <div className="text-right whitespace-nowrap">План сумма</div>,
            cell: ({ row }) => <div className="text-right tabular-nums">{moneyFormatter.format(row.original.plannedSum)}</div>,
            size: 130,
        },
        {
            accessorKey: 'actualQty',
            header: () => <div className="text-right whitespace-nowrap">Факт кол-во</div>,
            cell: ({ row }) => <NumberEditCell row={row.original} field="actualQty" onSave={patchRow} />,
            size: 120,
        },
        {
            accessorKey: 'actualPrice',
            header: () => <div className="text-right whitespace-nowrap">Факт цена</div>,
            cell: ({ row }) => <NumberEditCell row={row.original} field="actualPrice" onSave={patchRow} />,
            size: 120,
        },
        {
            accessorKey: 'actualSum',
            header: () => <div className="text-right whitespace-nowrap">Факт сумма</div>,
            cell: ({ row }) => <div className="text-right tabular-nums">{moneyFormatter.format(row.original.actualSum)}</div>,
            size: 150,
        },
        {
            accessorKey: 'status',
            header: 'Статус',
            cell: ({ row }) => (
                <ExecutionStatusCell
                    currentStatus={row.original.status}
                    onStatusChange={(status) => void patchRow(row.original.id, { status })}
                />
            ),
            size: 180,
        },
    ], [patchRow]);

    const totals = useMemo(() => rows.reduce((acc, row) => {
        acc.planned += row.plannedSum;
        acc.actual += row.actualSum;
        return acc;
    }, { planned: 0, actual: 0 }), [rows]);

    const addedWorkNames = useMemo(() => new Set(rows.map((row) => row.name)), [rows]);

    if (isLoading) {
        return (
            <div className="space-y-2">
                <Skeleton className="h-9 w-full" />
                <Skeleton className="h-[460px] w-full" />
            </div>
        );
    }

    if (errorMessage) {
        return <div className="rounded-md border p-4 text-sm text-destructive">{errorMessage}</div>;
    }

    return (
        <div className="space-y-4">
            <DataTable
                columns={columns}
                data={rows}
                filterColumn="name"
                filterPlaceholder="Поиск по работам..."
                height="580px"
                actions={
                    <AddExtraWorkSheet
                        estimateId={estimateId}
                        onCreated={(row) => setRows((prev) => [...prev, row])}
                        addedWorkNames={addedWorkNames}
                    />
                }
            />
            <div className="flex justify-end px-1">
                <EstimateTotals planned={totals.planned} actual={totals.actual} />
            </div>
        </div>
    );
}
