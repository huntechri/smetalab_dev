'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Plus, BookOpen, CalendarDays, Copy } from 'lucide-react';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MaterialCatalogDialog } from '@/features/catalog/components/MaterialCatalogDialog.client';
import type { CatalogMaterial } from '@/features/catalog/types/dto';
import { useToast } from '@/components/ui/use-toast';
import { getGlobalPurchasesColumns } from './global-purchases-columns';
import { useGlobalPurchasesTable } from '../hooks/useGlobalPurchasesTable';
import type { ProjectOption, PurchaseRow, PurchaseRowsRange, SupplierOption } from '../types/dto';

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import type { DateRange } from 'react-day-picker';
import { ru } from 'date-fns/locale';
import { formatLocalDateToIso, parseIsoDateSafe, addDaysToIsoDate } from '../lib/date';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface GlobalPurchasesTableProps {
    initialRows: PurchaseRow[];
    projectOptions: ProjectOption[];
    supplierOptions: SupplierOption[];
    initialRange: PurchaseRowsRange;
}

export function GlobalPurchasesTable({ initialRows, projectOptions, supplierOptions, initialRange }: GlobalPurchasesTableProps) {
    const [isCatalogOpen, setIsCatalogOpen] = useState(false);
    const defaultProjectId: string | null = null;
    const [isAddingManual, setIsAddingManual] = useState(false);
    const [isAddingCatalog, setIsAddingCatalog] = useState(false);
    const [isCopying, setIsCopying] = useState(false);
    const { toast } = useToast();
    const reloadTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const {
        rows,
        range,
        setRange,
        reloadRows,
        addManualRow,
        addCatalogRow,
        updateRow,
        removeRow,
        copyToNextDay,
        totals,
        addedMaterialNames,
        pendingIds,
    } = useGlobalPurchasesTable(initialRows, initialRange);

    useEffect(() => () => {
        if (reloadTimeoutRef.current) {
            clearTimeout(reloadTimeoutRef.current);
        }
    }, []);

    const currencyFormatter = useMemo(() => new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        maximumFractionDigits: 2
    }), []);

    const columns = useMemo(() => getGlobalPurchasesColumns({
        projectOptions,
        supplierOptions,
        pendingIds,
        onPatchAction: async (rowId, patch) => {
            try {
                await updateRow(rowId, patch);
            } catch {
                toast({
                    variant: 'destructive',
                    title: 'Ошибка сохранения',
                    description: 'Не удалось сохранить изменения в строке закупки.',
                });
            }
        },
        onRemoveAction: async (rowId) => {
            try {
                await removeRow(rowId);
            } catch {
                toast({
                    variant: 'destructive',
                    title: 'Ошибка удаления',
                    description: 'Не удалось удалить строку закупки.',
                });
            }
        },
    }), [projectOptions, supplierOptions, pendingIds, removeRow, toast, updateRow]);

    const handleCatalogSelect = async (material: CatalogMaterial) => {
        if (isAddingCatalog) return;

        try {
            setIsAddingCatalog(true);
            await addCatalogRow(material, defaultProjectId);
            toast({ title: 'Материал добавлен', description: material.name });
        } catch {
            toast({
                variant: 'destructive',
                title: 'Ошибка',
                description: 'Не удалось добавить материал из справочника.',
            });
        } finally {
            setIsAddingCatalog(false);
        }
    };

    const handleAddManualRow = async () => {
        if (isAddingManual) return;

        try {
            setIsAddingManual(true);
            await addManualRow(defaultProjectId);
            toast({ title: 'Строка добавлена', description: 'Ручная строка закупки успешно создана.' });
        } catch {
            toast({
                variant: 'destructive',
                title: 'Ошибка',
                description: 'Не удалось создать ручную строку закупки.',
            });
        } finally {
            setIsAddingManual(false);
        }
    };

    const handleCopyToNextDay = async () => {
        if (isCopying || rows.length === 0) return;

        try {
            setIsCopying(true);
            const created = await copyToNextDay();
            const nextDay = addDaysToIsoDate(range.from, 1);

            toast({
                title: 'Копирование завершено',
                description: `Скопировано строк: ${created.length} на ${nextDay}`
            });

            // Автоматически переключаемся на следующий день
            const nextRange = { from: nextDay, to: nextDay };
            setRange(nextRange);
            await reloadRows(nextRange);
        } catch (err) {
            toast({
                variant: 'destructive',
                title: 'Ошибка копирования',
                description: err instanceof Error ? err.message : 'Не удалось скопировать данные.',
            });
        } finally {
            setIsCopying(false);
        }
    };

    const handleRangeChange = (nextRange: DateRange | undefined) => {
        if (!nextRange?.from) return;

        const from = formatLocalDateToIso(nextRange.from);
        const to = formatLocalDateToIso(nextRange.to ?? nextRange.from);

        const payload = { from, to };
        setRange(payload);

        if (reloadTimeoutRef.current) {
            clearTimeout(reloadTimeoutRef.current);
        }

        reloadTimeoutRef.current = setTimeout(() => {
            void reloadRows(payload).catch(() => {
                toast({
                    variant: 'destructive',
                    title: 'Ошибка',
                    description: 'Не удалось загрузить список закупок за выбранный период.',
                });
            });
        }, 250);
    };

    return (
        <div className="space-y-3">
            <DataTable
                columns={columns}
                data={rows}
                filterColumn="materialName"
                filterPlaceholder="Поиск по материалам..."
                height="680px"
                actions={(
                    <div className="flex flex-wrap items-center gap-2">
                        <Popover>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <PopoverTrigger asChild>
                                        <Button type="button" variant="outline" size="sm" className="h-8 gap-1.5 w-full sm:w-[255px] justify-between font-mono tabular-nums text-xs md:text-sm">
                                            <CalendarDays className="size-4" />
                                            {range.from === range.to ? range.from : `${range.from} → ${range.to}`}
                                        </Button>
                                    </PopoverTrigger>
                                </TooltipTrigger>
                                <TooltipContent>Выберете период отображения закупок</TooltipContent>
                            </Tooltip>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="range"
                                    selected={{ from: parseIsoDateSafe(range.from), to: parseIsoDateSafe(range.to) }}
                                    onSelect={handleRangeChange}
                                    locale={ru}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="h-8 gap-1.5 w-[calc(50%-4px)] sm:w-auto text-xs md:text-sm"
                                    onClick={() => void handleAddManualRow()}
                                    disabled={isAddingManual}
                                >
                                    <Plus className="size-4" />
                                    <span className="truncate">Строка вручную</span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Добавить пустую строку закупки</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="h-8 gap-1.5 w-[calc(50%-4px)] sm:w-auto text-xs md:text-sm"
                                    onClick={() => setIsCatalogOpen(true)}
                                    disabled={isAddingCatalog}
                                >
                                    <BookOpen className="size-4" />
                                    <span className="truncate">Из справочника</span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Выбрать материалы из каталога</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="h-8 gap-1.5 w-full sm:w-auto text-xs md:text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                    onClick={() => void handleCopyToNextDay()}
                                    disabled={isCopying || rows.length === 0 || range.from !== range.to}
                                >
                                    <Copy className="size-4" />
                                    <span className="truncate">На след. день</span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Копировать все строки текущего дня на следующий</TooltipContent>
                        </Tooltip>
                    </div>
                )}
            />

            <div className="flex flex-wrap justify-between gap-2 px-1">
                <p className="text-xs text-muted-foreground">Списки ведутся по датам. Доступны фильтрация за день/период и копирование.</p>
                <Badge variant="secondary" className="bg-blue-500/5 text-blue-700/80 border-none px-2 py-0.5 h-6 text-[10px] font-bold uppercase tracking-wider tabular-nums">
                    Итого закупки: {currencyFormatter.format(totals.amount)}
                </Badge>
            </div>

            <MaterialCatalogDialog
                isOpen={isCatalogOpen}
                onClose={() => setIsCatalogOpen(false)}
                onSelect={handleCatalogSelect}
                parentWorkName={projectOptions.find((project) => project.id === defaultProjectId)?.name || 'Закупки'}
                addedMaterialNames={addedMaterialNames}
                closeOnSelect={false}
                allowDuplicateSelection
            />
        </div>
    );
}
