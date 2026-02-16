'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Plus, BookOpen, CalendarDays } from 'lucide-react';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MaterialCatalogDialog } from '@/features/catalog/components/MaterialCatalogDialog.client';
import type { CatalogMaterial } from '@/features/catalog/types/dto';
import { useToast } from '@/components/ui/use-toast';
import { getGlobalPurchasesColumns } from './global-purchases-columns';
import { useGlobalPurchasesTable } from '../hooks/useGlobalPurchasesTable';
import type { ProjectOption, PurchaseRow, PurchaseRowsRange } from '../types/dto';

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import type { DateRange } from 'react-day-picker';
import { ru } from 'date-fns/locale';
import { formatLocalDateToIso } from '../lib/date';

interface GlobalPurchasesTableProps {
    initialRows: PurchaseRow[];
    projectOptions: ProjectOption[];
    initialRange: PurchaseRowsRange;
}

const toDate = (value: string) => {
    const [year, month, day] = value.split('-').map(Number);
    return new Date(year, month - 1, day);
};

export function GlobalPurchasesTable({ initialRows, projectOptions, initialRange }: GlobalPurchasesTableProps) {
    const [isCatalogOpen, setIsCatalogOpen] = useState(false);
    const [defaultProjectId] = useState<string | null>(null);
    const [isAddingManual, setIsAddingManual] = useState(false);
    const [isAddingCatalog, setIsAddingCatalog] = useState(false);
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
        totals,
        addedMaterialNames,
    } = useGlobalPurchasesTable(initialRows, initialRange);

    useEffect(() => () => {
        if (reloadTimeoutRef.current) {
            clearTimeout(reloadTimeoutRef.current);
        }
    }, []);

    const currencyFormatter = useMemo(() => new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 2 }), []);

    const columns = useMemo(() => getGlobalPurchasesColumns({
        projectOptions,
        onPatch: async (rowId, patch) => {
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
        onRemove: async (rowId) => {
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
    }), [projectOptions, removeRow, toast, updateRow]);

    const handleCatalogSelect = async (material: CatalogMaterial) => {
        if (isAddingCatalog) {
            return;
        }

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
        if (isAddingManual) {
            return;
        }

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

    const handleRangeChange = (nextRange: DateRange | undefined) => {
        if (!nextRange?.from) {
            return;
        }

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
                height="580px"
                actions={(
                    <div className="flex flex-wrap items-center gap-2">

                        <Popover>
                            <PopoverTrigger asChild>
                                <Button type="button" variant="outline" size="sm" className="h-8 gap-1.5 w-full sm:w-[255px] justify-between font-mono tabular-nums">
                                    <CalendarDays className="size-4" />
                                    {range.from === range.to ? range.from : `${range.from} → ${range.to}`}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="range"
                                    selected={{ from: toDate(range.from), to: toDate(range.to) }}
                                    onSelect={handleRangeChange}
                                    locale={ru}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-8 gap-1.5 w-full sm:w-auto"
                            onClick={() => void handleAddManualRow()}
                            disabled={isAddingManual}
                        >
                            <Plus className="size-4" />
                            <span className="truncate">Строка вручную</span>
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-8 gap-1.5 w-full sm:w-auto"
                            onClick={() => setIsCatalogOpen(true)}
                            disabled={isAddingCatalog}
                        >
                            <BookOpen className="size-4" />
                            <span className="truncate">Из справочника</span>
                        </Button>
                    </div>
                )}
            />

            <div className="flex flex-wrap justify-between gap-2 px-1">
                <p className="text-xs text-muted-foreground">Списки ведутся по датам. Доступны фильтрация за день/период.</p>
                <Badge variant="secondary" className="bg-blue-500/5 text-blue-700/80 border-none px-2 py-0.5 h-6 text-[10px] font-bold uppercase tracking-wider">
                    Итого закупки: {currencyFormatter.format(totals.amount)} ₽
                </Badge>
            </div>

            <MaterialCatalogDialog
                isOpen={isCatalogOpen}
                onClose={() => setIsCatalogOpen(false)}
                onSelect={handleCatalogSelect}
                parentWorkName={projectOptions.find((project) => project.id === defaultProjectId)?.name || 'Глобальные закупки'}
                addedMaterialNames={addedMaterialNames}
                closeOnSelect={false}
                allowDuplicateSelection
            />
        </div>
    );
}
