'use client';

import { useMemo, useState } from 'react';
import { Plus, BookOpen, CalendarDays, ArrowRight } from 'lucide-react';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MaterialCatalogDialog } from '@/features/catalog/components/MaterialCatalogDialog.client';
import type { CatalogMaterial } from '@/features/catalog/types/dto';
import { useToast } from '@/components/ui/use-toast';
import { getGlobalPurchasesColumns } from './global-purchases-columns';
import { useGlobalPurchasesTable } from '../hooks/useGlobalPurchasesTable';
import type { ProjectOption, PurchaseRow, PurchaseRowsRange } from '../types/dto';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import type { DateRange } from 'react-day-picker';
import { ru } from 'date-fns/locale';

interface GlobalPurchasesTableProps {
    initialRows: PurchaseRow[];
    projectOptions: ProjectOption[];
    initialRange: PurchaseRowsRange;
}

const toDate = (value: string) => {
    const [year, month, day] = value.split('-').map(Number);
    return new Date(year, month - 1, day);
};

const toIsoDate = (value: Date) => {
    const offset = value.getTimezoneOffset();
    const normalized = new Date(value.getTime() - offset * 60_000);
    return normalized.toISOString().slice(0, 10);
};

export function GlobalPurchasesTable({ initialRows, projectOptions, initialRange }: GlobalPurchasesTableProps) {
    const [isCatalogOpen, setIsCatalogOpen] = useState(false);
    const [defaultProjectId, setDefaultProjectId] = useState<string | null>(projectOptions[0]?.id ?? null);
    const { toast } = useToast();

    const {
        rows,
        range,
        setRange,
        reloadRows,
        addManualRow,
        addCatalogRow,
        updateRow,
        copyRowsToNextDay,
        removeRow,
        totals,
        addedMaterialNames,
    } = useGlobalPurchasesTable(initialRows, initialRange);

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
        try {
            await addCatalogRow(material, defaultProjectId);
            setIsCatalogOpen(false);
            toast({ title: 'Материал добавлен', description: material.name });
        } catch {
            toast({
                variant: 'destructive',
                title: 'Ошибка',
                description: 'Не удалось добавить материал из справочника.',
            });
        }
    };

    const handleAddManualRow = async () => {
        try {
            await addManualRow(defaultProjectId);
            toast({ title: 'Строка добавлена', description: 'Ручная строка закупки успешно создана.' });
        } catch {
            toast({
                variant: 'destructive',
                title: 'Ошибка',
                description: 'Не удалось создать ручную строку закупки.',
            });
        }
    };

    const handleRangeChange = async (nextRange: DateRange | undefined) => {
        if (!nextRange?.from) {
            return;
        }

        const from = toIsoDate(nextRange.from);
        const to = toIsoDate(nextRange.to ?? nextRange.from);

        try {
            const payload = { from, to };
            setRange(payload);
            await reloadRows(payload);
        } catch {
            toast({
                variant: 'destructive',
                title: 'Ошибка',
                description: 'Не удалось загрузить список закупок за выбранный период.',
            });
        }
    };

    const handleCreateNextDay = async () => {
        try {
            const { createdRows, targetDate } = await copyRowsToNextDay();
            toast({
                title: 'Список создан',
                description: `Скопировано строк: ${createdRows}. Открыт список на ${targetDate}.`,
            });
        } catch {
            toast({
                variant: 'destructive',
                title: 'Ошибка',
                description: 'Не удалось создать список на следующий день.',
            });
        }
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
                    <div className="flex items-center gap-2">
                        <Select value={defaultProjectId ?? 'none'} onValueChange={(value) => setDefaultProjectId(value === 'none' ? null : value)}>
                            <SelectTrigger className="h-8 w-56">
                                <SelectValue placeholder="Объект по умолчанию" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">Без привязки</SelectItem>
                                {projectOptions.map((project) => (
                                    <SelectItem key={project.id} value={project.id}>{project.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button type="button" variant="outline" size="sm" className="h-8 gap-1.5">
                                    <CalendarDays className="size-4" />
                                    {range.from === range.to ? range.from : `${range.from} → ${range.to}`}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="range"
                                    selected={{ from: toDate(range.from), to: toDate(range.to) }}
                                    onSelect={(value) => void handleRangeChange(value)}
                                    locale={ru}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-8 gap-1.5"
                            onClick={() => void handleCreateNextDay()}
                        >
                            <ArrowRight className="size-4" />
                            Создать список на след. день
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-8 gap-1.5"
                            onClick={() => void handleAddManualRow()}
                        >
                            <Plus className="size-4" />
                            Строка вручную
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-8 gap-1.5"
                            onClick={() => setIsCatalogOpen(true)}
                        >
                            <BookOpen className="size-4" />
                            Из справочника
                        </Button>
                    </div>
                )}
            />

            <div className="flex flex-wrap justify-between gap-2 px-1">
                <p className="text-xs text-muted-foreground">Списки ведутся по датам. Доступны фильтрация за день/период и автокопирование списка на следующий день.</p>
                <Badge variant="secondary" className="bg-blue-500/5 text-blue-700/80 border-none px-2 py-0.5 h-6 text-[10px] font-bold uppercase tracking-wider">
                    Итого закупки: {new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 2 }).format(totals.amount)} ₽
                </Badge>
            </div>

            <MaterialCatalogDialog
                isOpen={isCatalogOpen}
                onClose={() => setIsCatalogOpen(false)}
                onSelect={handleCatalogSelect}
                parentWorkName={projectOptions.find((project) => project.id === defaultProjectId)?.name || 'Глобальные закупки'}
                addedMaterialNames={addedMaterialNames}
            />
        </div>
    );
}
