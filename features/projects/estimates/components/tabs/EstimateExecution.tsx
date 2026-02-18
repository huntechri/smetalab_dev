'use client';

import { useEffect, useMemo, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import { estimateExecutionActionsRepo } from '../../repository/execution.actions';
import { EstimateExecutionRow, EstimateExecutionStatus } from '../../types/execution.dto';
import { calculateExecutionMoneyMetrics } from '../../lib/execution-metrics';

const moneyFormatter = new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 2,
});

const numberFormatter = new Intl.NumberFormat('ru-RU', {
    maximumFractionDigits: 2,
});

function getStatusBadge(status: EstimateExecutionStatus) {
    if (status === 'done') {
        return <Badge className="bg-emerald-600 hover:bg-emerald-600">Выполнено</Badge>;
    }

    if (status === 'in_progress') {
        return <Badge variant="secondary">В процессе</Badge>;
    }

    return <Badge variant="outline">Не начато</Badge>;
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
        setLocalValue(String(row[field]));
    }, [field, row]);

    return (
        <Input
            value={localValue}
            onChange={(event) => setLocalValue(event.target.value)}
            onBlur={() => {
                const nextValue = Number(localValue);
                if (!Number.isFinite(nextValue) || nextValue < 0) {
                    setLocalValue(String(row[field]));
                    return;
                }

                if (nextValue === row[field]) {
                    return;
                }

                void onSave(row.id, { [field]: nextValue });
            }}
            className="h-8 text-right"
        />
    );
}

function AddExtraWorkSheet({
    estimateId,
    onCreated,
}: {
    estimateId: string;
    onCreated: (row: EstimateExecutionRow) => void;
}) {
    const [open, setOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [name, setName] = useState('');
    const [code, setCode] = useState('');
    const [unit, setUnit] = useState('шт');
    const [actualQty, setActualQty] = useState('1');
    const [actualPrice, setActualPrice] = useState('0');
    const { toast } = useToast();

    const resetForm = () => {
        setName('');
        setCode('');
        setUnit('шт');
        setActualQty('1');
        setActualPrice('0');
    };

    const submit = async () => {
        const parsedQty = Number(actualQty);
        const parsedPrice = Number(actualPrice);

        if (!name.trim()) {
            toast({ variant: 'destructive', title: 'Ошибка', description: 'Укажите название работы.' });
            return;
        }

        if (!Number.isFinite(parsedQty) || parsedQty < 0 || !Number.isFinite(parsedPrice) || parsedPrice < 0) {
            toast({ variant: 'destructive', title: 'Ошибка', description: 'Проверьте фактическое количество и цену.' });
            return;
        }

        try {
            setIsSaving(true);
            const created = await estimateExecutionActionsRepo.addExtraWork(estimateId, {
                name: name.trim(),
                code: code.trim() || undefined,
                unit: unit.trim(),
                actualQty: parsedQty,
                actualPrice: parsedPrice,
            });

            onCreated(created);
            toast({ title: 'Дополнительная работа добавлена', description: created.name });
            setOpen(false);
            resetForm();
        } catch (error) {
            toast({ variant: 'destructive', title: 'Ошибка', description: error instanceof Error ? error.message : 'Не удалось добавить работу.' });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button size="sm" variant="outline">Добавить доп. работу</Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:max-w-md">
                <SheetHeader>
                    <SheetTitle>Новая дополнительная работа</SheetTitle>
                    <SheetDescription>
                        Работа добавляется только во вкладку «Выполнение». Смета не изменяется.
                    </SheetDescription>
                </SheetHeader>

                <div className="mt-6 space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="extra-work-name">Название</Label>
                        <Input id="extra-work-name" value={name} onChange={(event) => setName(event.target.value)} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="extra-work-code">Код (опционально)</Label>
                        <Input id="extra-work-code" value={code} onChange={(event) => setCode(event.target.value)} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="extra-work-unit">Ед. изм.</Label>
                        <Input id="extra-work-unit" value={unit} onChange={(event) => setUnit(event.target.value)} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="extra-work-qty">Фактическое количество</Label>
                        <Input id="extra-work-qty" value={actualQty} onChange={(event) => setActualQty(event.target.value)} inputMode="decimal" />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="extra-work-price">Фактическая цена</Label>
                        <Input id="extra-work-price" value={actualPrice} onChange={(event) => setActualPrice(event.target.value)} inputMode="decimal" />
                    </div>

                    <Button disabled={isSaving} onClick={() => void submit()} className="w-full">
                        {isSaving ? 'Сохранение...' : 'Сохранить'}
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    );
}

export function EstimateExecution({ estimateId }: { estimateId: string }) {
    const [rows, setRows] = useState<EstimateExecutionRow[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        let active = true;

        const load = async () => {
            try {
                setIsLoading(true);
                setErrorMessage(null);
                const data = await estimateExecutionActionsRepo.list(estimateId);

                if (!active) {
                    return;
                }

                setRows(data);
            } catch (error) {
                if (!active) {
                    return;
                }

                setErrorMessage(error instanceof Error ? error.message : 'Не удалось загрузить выполнение сметы');
            } finally {
                if (active) {
                    setIsLoading(false);
                }
            }
        };

        void load();

        return () => {
            active = false;
        };
    }, [estimateId]);

    const patchRow = async (rowId: string, patch: { actualQty?: number; actualPrice?: number; status?: EstimateExecutionStatus }) => {
        const previousRows = rows;
        const optimisticRows = rows.map((row) => {
            if (row.id !== rowId) {
                return row;
            }

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
        });

        setRows(optimisticRows);

        try {
            const updated = await estimateExecutionActionsRepo.patch(estimateId, rowId, patch);
            setRows((current) => current.map((item) => item.id === rowId ? updated : item));
        } catch (error) {
            setRows(previousRows);
            toast({ variant: 'destructive', title: 'Ошибка', description: error instanceof Error ? error.message : 'Не удалось сохранить изменения.' });
        }
    };

    const columns = useMemo<ColumnDef<EstimateExecutionRow>[]>(() => [
        {
            accessorKey: 'code',
            header: 'Код',
            size: 110,
            cell: ({ row }) => <span className="text-xs text-muted-foreground">{row.original.code}</span>,
        },
        {
            accessorKey: 'name',
            header: 'Работа',
            size: 260,
            cell: ({ row }) => (
                <div className="space-y-1">
                    <div className="font-medium">{row.original.name}</div>
                    {row.original.source === 'extra' ? <Badge variant="secondary">Доп. работа</Badge> : null}
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
            accessorKey: 'plannedSum',
            header: () => <div className="text-right">План сумма</div>,
            cell: ({ row }) => <div className="text-right">{moneyFormatter.format(row.original.plannedSum)}</div>,
            size: 150,
        },
        {
            accessorKey: 'actualQty',
            header: () => <div className="text-right">Факт кол-во</div>,
            cell: ({ row }) => <NumberEditCell row={row.original} field="actualQty" onSave={patchRow} />,
            size: 150,
        },
        {
            accessorKey: 'actualPrice',
            header: () => <div className="text-right">Факт цена</div>,
            cell: ({ row }) => <NumberEditCell row={row.original} field="actualPrice" onSave={patchRow} />,
            size: 150,
        },
        {
            accessorKey: 'actualSum',
            header: () => <div className="text-right">Факт сумма</div>,
            cell: ({ row }) => <div className="text-right">{moneyFormatter.format(row.original.actualSum)}</div>,
            size: 150,
        },
        {
            id: 'delta',
            header: () => <div className="text-right">Маржинальность</div>,
            cell: ({ row }) => {
                const metrics = calculateExecutionMoneyMetrics(
                    row.original.plannedQty,
                    row.original.plannedPrice,
                    row.original.actualQty,
                    row.original.actualPrice,
                );

                if (metrics.marginPercent === null) {
                    return <div className="text-right text-xs text-muted-foreground">—</div>;
                }

                const sign = metrics.marginPercent > 0 ? '+' : '';
                return <div className="text-right">{sign}{numberFormatter.format(metrics.marginPercent)}%</div>;
            },
            size: 130,
        },
        {
            accessorKey: 'status',
            header: 'Статус',
            cell: ({ row }) => (
                <div className="space-y-2">
                    {getStatusBadge(row.original.status)}
                    <Select value={row.original.status} onValueChange={(next) => void patchRow(row.original.id, { status: next as EstimateExecutionStatus })}>
                        <SelectTrigger className="h-8 w-[150px]">
                            <SelectValue placeholder="Статус" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="not_started">Не начато</SelectItem>
                            <SelectItem value="in_progress">В процессе</SelectItem>
                            <SelectItem value="done">Выполнено</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            ),
            size: 180,
        },
    ], [patchRow]);

    const totals = useMemo(() => rows.reduce((acc, row) => {
        acc.planned += row.plannedSum;
        acc.actual += row.actualSum;
        return acc;
    }, { planned: 0, actual: 0 }), [rows]);

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
        <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                    <Badge variant="outline">План: {moneyFormatter.format(totals.planned)}</Badge>
                    <Badge variant="outline">Факт: {moneyFormatter.format(totals.actual)}</Badge>
                    <Badge variant="outline">Δ: {moneyFormatter.format(totals.actual - totals.planned)}</Badge>
                </div>

                <AddExtraWorkSheet estimateId={estimateId} onCreated={(row) => setRows((prev) => [...prev, row])} />
            </div>

            <DataTable
                columns={columns}
                data={rows}
                filterColumn="name"
                filterPlaceholder="Поиск по работам..."
                height="680px"
            />
        </div>
    );
}
