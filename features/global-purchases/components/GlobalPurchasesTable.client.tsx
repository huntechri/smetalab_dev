'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Plus, BookOpen, CalendarDays, Check, ChevronsUpDown, Filter } from 'lucide-react';
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
import { formatLocalDateToIso, parseIsoDateSafe } from '../lib/date';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { cn } from '@/lib/utils';

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
    const [filterProjectId, setFilterProjectId] = useState<string | null>(null);
    const [openProjectFilter, setOpenProjectFilter] = useState(false);
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
        addedMaterialNames,
        pendingIds,
    } = useGlobalPurchasesTable(initialRows, initialRange);

    useEffect(() => () => {
        if (reloadTimeoutRef.current) {
            clearTimeout(reloadTimeoutRef.current);
        }
    }, []);

    const displayedRows = useMemo(() => {
        if (!filterProjectId) return rows;
        if (filterProjectId === 'none') return rows.filter((r) => !r.projectId);
        return rows.filter((r) => r.projectId === filterProjectId);
    }, [rows, filterProjectId]);

    const displayedTotalsAmount = useMemo(() =>
        displayedRows.reduce((acc, row) => acc + row.amount, 0),
        [displayedRows]);

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
            } catch (serviceError) {
                toast({
                    variant: 'destructive',
                    title: 'Ошибка сохранения',
                    description: 'Не удалось сохранить изменения в строке закупки.',
                });
                throw serviceError;
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
                data={displayedRows}
                filterColumn="materialName"
                filterPlaceholder="Поиск по материалам..."
                height="625px"
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

                        <Popover open={openProjectFilter} onOpenChange={setOpenProjectFilter}>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className={cn(
                                                "h-8 px-2 gap-1.5 min-w-[160px] max-w-[200px] justify-between border border-transparent hover:border-border text-xs md:text-sm",
                                                !filterProjectId && "text-muted-foreground"
                                            )}
                                        >
                                            <div className="flex items-center gap-1.5 truncate">
                                                <Filter className="size-3.5 shrink-0 opacity-60" />
                                                <span className="truncate">
                                                    {filterProjectId === 'none'
                                                        ? 'Без привязки'
                                                        : (projectOptions.find(p => p.id === filterProjectId)?.name ?? 'Все объекты')}
                                                </span>
                                            </div>
                                            <ChevronsUpDown className="size-3 opacity-50 shrink-0 ml-1" />
                                        </Button>
                                    </PopoverTrigger>
                                </TooltipTrigger>
                                <TooltipContent>Фильтровать закупки по объекту</TooltipContent>
                            </Tooltip>
                            <PopoverContent className="w-72 p-0" align="end">
                                <Command>
                                    <CommandInput placeholder="Поиск объекта..." />
                                    <CommandList>
                                        <CommandEmpty>Объект не найден.</CommandEmpty>
                                        <CommandGroup>
                                            <CommandItem onSelect={() => {
                                                setFilterProjectId(null);
                                                setOpenProjectFilter(false);
                                            }}>
                                                <Check className={cn("mr-2 h-4 w-4", !filterProjectId ? "opacity-100" : "opacity-0")} />
                                                Все объекты
                                            </CommandItem>
                                            <CommandItem onSelect={() => {
                                                setFilterProjectId('none');
                                                setOpenProjectFilter(false);
                                            }}>
                                                <Check className={cn("mr-2 h-4 w-4", filterProjectId === 'none' ? "opacity-100" : "opacity-0")} />
                                                Без привязки
                                            </CommandItem>
                                            {projectOptions.map((project) => (
                                                <CommandItem key={project.id} value={project.name} onSelect={() => {
                                                    setFilterProjectId(project.id);
                                                    setOpenProjectFilter(false);
                                                }}>
                                                    <Check className={cn("mr-2 h-4 w-4", project.id === filterProjectId ? "opacity-100" : "opacity-0")} />
                                                    <span className="truncate">{project.name}</span>
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
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

                    </div>
                )}
            />

            <div className="flex flex-wrap justify-end gap-2 px-1 -mb-[14px]">
                <Badge variant="secondary" className="bg-blue-500/5 text-blue-700/80 border-none px-2 py-0.5 h-6 text-[10px] font-bold uppercase tracking-wider tabular-nums">
                    Итого закупки: {currencyFormatter.format(displayedTotalsAmount)}
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
