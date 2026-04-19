'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { DataTable } from '@/shared/ui/data-table';
import { Input } from '@/shared/ui/input';
import { WorkCatalogPicker } from '@/features/catalog/components/WorkCatalogPicker.client';
import { CatalogWork } from '@/features/catalog/types/dto';
import { MoreHorizontal, Plus, FilePlus, Download } from 'lucide-react';
import { TableEmptyState } from '@/shared/ui/table-empty-state';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/shared/ui/sheet';
import { Skeleton } from '@/shared/ui/skeleton';
import { useAppToast } from '@/components/providers/use-app-toast';
import { estimateExecutionActionsRepo } from '../../repository/execution.actions';
import { EstimateExecutionRow, EstimateExecutionStatus } from '../../types/execution.dto';
import { parseDecimalInput, toDecimalInput } from '../../lib/decimal-input';
import { buildExtraWorkFromCatalog } from '../../lib/execution-extra-work';
import { calculateExecutionTotals } from '../../lib/execution-totals';
import { EstimateTotals } from '../EstimateTotals';
import { projectBadgeClassName, projectStatusBadgeToneClassName } from '@/features/projects/shared/ui/project-badge-styles';

const moneyFormatter = new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 2,
});

const numberFormatter = new Intl.NumberFormat('ru-RU', {
    maximumFractionDigits: 2,
});

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

function AddExtraWorkSheet({ estimateId, onCreated, addedWorkNames, triggerVariant = 'button' }: {
    estimateId: string;
    onCreated: (row: EstimateExecutionRow) => void;
    addedWorkNames: Set<string>;
    triggerVariant?: 'button' | 'menu-item';
}) {
    const [open, setOpen] = useState(false);
    const { toast } = useAppToast();
    const router = useRouter();

    const addWorkFromCatalog = async (catalogWork: CatalogWork) => {
        try {
            const created = await estimateExecutionActionsRepo.addExtraWork(estimateId, buildExtraWorkFromCatalog(catalogWork));

            onCreated(created);
            router.refresh(); // Update dashboard KPI
            toast({ title: 'Работа добавлена во вкладку «Выполнение»', description: created.name });
            setOpen(false);
        } catch (error) {
            toast({ variant: 'destructive', title: 'Ошибка', description: error instanceof Error ? error.message : 'Не удалось добавить работу из справочника.' });
        }
    };

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                {triggerVariant === 'menu-item' ? (
                    <DropdownMenuItem onSelect={(event) => event.preventDefault()}>
                        <Plus className="mr-2 h-4 w-4" />
                        Добавить доп. работу
                    </DropdownMenuItem>
                ) : (
                    <Button variant="primary" title="Добавить дополнительную работу" aria-label="Добавить дополнительную работу">
                        <Plus className="h-4 w-4" />
                        <span className="hidden sm:inline">Добавить доп. работу</span>
                    </Button>
                )}
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
    const { toast } = useAppToast();
    const router = useRouter();

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
            router.refresh(); // Update dashboard KPI
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
            cell: ({ row }) => <div className="text-right tabular-nums font-bold tracking-tight text-xs">{moneyFormatter.format(row.original.actualSum)}</div>,
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

    const totals = useMemo(() => calculateExecutionTotals(rows), [rows]);

    const addedWorkNames = useMemo(() => new Set(rows.map((row) => row.name)), [rows]);
    const handleExport = useCallback(() => {
        window.open(`/api/estimates/${estimateId}/export/execution`, '_blank', 'noopener,noreferrer');
    }, [estimateId]);

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
        <div className="space-y-2">
            <DataTable
                columns={columns}
                data={rows}
                filterColumn="name"
                filterPlaceholder="Поиск..."
                height="600px"
                compactMobileToolbar
                emptyState={
                    <TableEmptyState
                        title="Список выполнения пуст"
                        description="Для начала работы добавьте позиции во вкладку «Смета» или создайте дополнительную работу"
                        icon={FilePlus}
                        action={
                            <AddExtraWorkSheet
                                estimateId={estimateId}
                                onCreated={(row) => setRows((prev) => [...prev, row])}
                                addedWorkNames={addedWorkNames}
                           />
                        }
                   />
                }
                actions={
                    <>
                        <div className="hidden items-center gap-2 sm:flex">
                            <Button variant="outline" onClick={handleExport}>
                                <Download className="h-4 w-4" />
                                Экспорт Excel
                            </Button>
                            <AddExtraWorkSheet
                                estimateId={estimateId}
                                onCreated={(row) => setRows((prev) => [...prev, row])}
                                addedWorkNames={addedWorkNames}
                           />
                        </div>

                        <div className="sm:hidden">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="icon-xs">
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="min-w-[220px]">
                                    <DropdownMenuItem onClick={handleExport}>
                                        <Download className="mr-2 h-4 w-4" />
                                        Экспорт Excel
                                    </DropdownMenuItem>
                                    <AddExtraWorkSheet
                                        estimateId={estimateId}
                                        onCreated={(row) => setRows((prev) => [...prev, row])}
                                        addedWorkNames={addedWorkNames}
                                        triggerVariant="menu-item"
                                   />
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </>
                }
           />
            <div className="flex justify-end border-t border-border/60 bg-background/95 px-1 pt-1">
                <EstimateTotals planned={totals.planned} actual={totals.actual} />
            </div>
        </div>
    );
}
