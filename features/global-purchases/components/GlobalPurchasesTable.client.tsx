'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Plus, BookOpen, CalendarDays, Check, ChevronsUpDown, Filter, MoreHorizontal, Upload, Download } from 'lucide-react';
import { DataTable } from '@/shared/ui/data-table';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { MaterialCatalogDialog } from '@/features/catalog/components/MaterialCatalogDialog.client';
import type { CatalogMaterial } from '@/features/catalog/types/dto';
import { useAppToast } from '@/components/providers/use-app-toast';
import { getGlobalPurchasesColumns } from './global-purchases-columns';
import { useGlobalPurchasesTable } from '../hooks/useGlobalPurchasesTable';
import type { ProjectOption, PurchaseRow, PurchaseRowsRange, SupplierOption } from '../types/dto';

import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover';
import { Calendar } from '@/shared/ui/calendar';
import type { DateRange } from 'react-day-picker';
import { ru } from 'date-fns/locale';
import { formatLocalDateToIso, parseIsoDateSafe } from '../lib/date';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/shared/ui/command';
import { cn } from '@/lib/utils';
import { useGlobalPurchasesImportExport } from '../hooks/useGlobalPurchasesImportExport';
import { GlobalPurchasesImportExportActions } from './GlobalPurchasesImportExportActions';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/shared/ui/dropdown-menu';

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
    const globalPurchasesBtnClassName = "h-8 px-2 gap-[6px] text-[14px] font-medium rounded-[7.6px] bg-background text-foreground border border-border/70 hover:bg-secondary/80 transition-colors shadow-sm md:shadow-none";

    const [isAddingCatalog, setIsAddingCatalog] = useState(false);
    const [filterProjectId, setFilterProjectId] = useState<string | null>(null);
    const [openProjectFilter, setOpenProjectFilter] = useState(false);
    const { toast } = useAppToast();
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
        importRows,
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



    const {
        importInputRef,
        handleExport,
        handleImportClick,
        handleImportFileChange,
    } = useGlobalPurchasesImportExport({
        displayedRows,
        range,
        importRows,
        toast,
    });

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
                compactMobileToolbar
                actions={(
                    <div className="flex flex-col xl:flex-row w-full xl:w-auto items-stretch xl:items-center gap-3 xl:gap-2">
                        {/* Filters Group */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                            <Popover open={openProjectFilter} onOpenChange={setOpenProjectFilter}>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                className={cn(
                                                    globalPurchasesBtnClassName,
                                                    "w-full sm:w-[200px] justify-between",
                                                    !filterProjectId && "text-muted-foreground/80"
                                                )}
                                            >
                                                <div className="flex items-center gap-2 truncate">
                                                    <Filter className="size-4 shrink-0 opacity-60" />
                                                    <span className="truncate">
                                                        {filterProjectId === 'none'
                                                            ? 'Без привязки'
                                                            : (projectOptions.find(p => p.id === filterProjectId)?.name ?? 'Все объекты')}
                                                    </span>
                                                </div>
                                                <ChevronsUpDown className="size-3.5 opacity-50 shrink-0 ml-1" />
                                            </Button>
                                        </PopoverTrigger>
                                    </TooltipTrigger>
                                    <TooltipContent>Фильтровать закупки по объекту</TooltipContent>
                                </Tooltip>
                                <PopoverContent className="w-72 p-0" align="start">
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

                            <Popover>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <PopoverTrigger asChild>
                                            <Button type="button" variant="secondary" size="sm" className={cn(globalPurchasesBtnClassName, "w-full sm:w-[255px] justify-between font-mono tabular-nums")}>
                                                <CalendarDays className="size-4 opacity-70" />
                                                <span className="flex-1 text-left sm:text-center text-[13px] font-medium tracking-tight">
                                                    {range.from === range.to ? range.from : `${range.from} → ${range.to}`}
                                                </span>
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
                        </div>

                        {/* Divider */}
                        <div className="hidden xl:block w-px h-6 bg-border mx-1" />

                        {/* Actions Group */}
                        <div className="hidden sm:flex flex-row items-center gap-2 overflow-x-auto pb-1 xl:pb-0 scrollbar-hide">
                            <GlobalPurchasesImportExportActions
                                importInputRef={importInputRef}
                                onExport={handleExport}
                                onImportClick={handleImportClick}
                                onFileChange={handleImportFileChange}
                            />

                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        size="sm"
                                        className={cn(globalPurchasesBtnClassName, "px-3")}
                                        onClick={() => void handleAddManualRow()}
                                        disabled={isAddingManual}
                                        aria-label="Добавить строку вручную"
                                    >
                                        <Plus className="size-4" />
                                        <span className="hidden sm:inline">Вручную</span>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Добавить пустую строку закупки</TooltipContent>
                            </Tooltip>

                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        size="sm"
                                        className={cn(globalPurchasesBtnClassName)}
                                        onClick={() => setIsCatalogOpen(true)}
                                        disabled={isAddingCatalog}
                                        aria-label="Добавить из справочника"
                                    >
                                        <BookOpen className="size-4" />
                                        <span className="hidden sm:inline">Из справочника</span>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Выбрать материалы из каталога</TooltipContent>
                            </Tooltip>
                        </div>
                        <div className="sm:hidden ml-auto">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="secondary" size="icon" className="size-8 rounded-[7.6px] bg-background border border-border/70 hover:bg-secondary/80 transition-colors" aria-label="Действия по закупкам">
                                        <MoreHorizontal className="size-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56">
                                    <DropdownMenuItem className="gap-2" onClick={handleImportClick}>
                                        <Upload className="size-4 text-muted-foreground" />
                                        <span>Импорт CSV</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="gap-2" onClick={handleExport}>
                                        <Download className="size-4 text-muted-foreground" />
                                        <span>Экспорт CSV</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="gap-2" onClick={() => void handleAddManualRow()} disabled={isAddingManual}>
                                        <Plus className="size-4 text-muted-foreground" />
                                        <span>{isAddingManual ? 'Добавление...' : 'Вручную'}</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="gap-2" onClick={() => setIsCatalogOpen(true)} disabled={isAddingCatalog}>
                                        <BookOpen className="size-4 text-muted-foreground" />
                                        <span>Из справочника</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
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
