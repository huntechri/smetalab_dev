'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { useToast } from '@/components/ui/use-toast';
import {
    Calculator,
    Save,
    FileStack,
    Percent,
    FileUp,
    FileDown,
    Trash2,
    MoreHorizontal
} from 'lucide-react';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetTitle,
} from "@/components/ui/sheet";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { estimatesMockRepo } from '../../repository';
import { getVisibleRows } from '../../lib/rows-visible';
import { EstimateRow } from '../../types/dto';
import { getEstimateColumns } from './columns';
import { WorkCatalogPicker } from '@/features/catalog/components/WorkCatalogPicker.client';
import { CatalogWork } from '@/features/catalog/types/dto';

export function EstimateTable({ estimateId, initialRows }: { estimateId: string; initialRows: EstimateRow[] }) {
    const [rows, setRows] = useState(initialRows);
    const [expandedWorkIds, setExpandedWorkIds] = useState<Set<string>>(new Set(rows.filter((r) => r.kind === 'work').map((r) => r.id)));
    const [savingRowIds, setSavingRowIds] = useState<Set<string>>(new Set());
    const [isCalculationModeOpen, setIsCalculationModeOpen] = useState(false);
    const { toast } = useToast();

    const visibleRows = useMemo(() => getVisibleRows(rows, expandedWorkIds), [rows, expandedWorkIds]);

    const setSaving = (rowId: string, saving: boolean) => {
        setSavingRowIds((prev) => {
            const next = new Set(prev);
            if (saving) {
                next.add(rowId);
            } else {
                next.delete(rowId);
            }
            return next;
        });
    };

    const patch = async (rowId: string, field: 'name' | 'qty' | 'price' | 'expense', rawValue: string) => {
        const previousRows = rows;
        const parsedValue = field === 'name' ? rawValue : Number(rawValue);
        const optimistic = rows.map((row) => row.id === rowId ? { ...row, [field]: parsedValue, sum: field === 'qty' || field === 'price' ? (field === 'qty' ? Number(rawValue) : row.qty) * (field === 'price' ? Number(rawValue) : row.price) : row.sum } : row);
        setRows(optimistic);
        setSaving(rowId, true);

        try {
            const updated = await estimatesMockRepo.patchRow(estimateId, rowId, { [field]: parsedValue });
            setRows((currentRows) => currentRows.map((row) => row.id === rowId ? updated : row));
        } catch {
            setRows(previousRows);
            toast({ variant: 'destructive', title: 'Ошибка сохранения', description: 'Не удалось сохранить изменение.' });
        } finally {
            setSaving(rowId, false);
        }
    };

    const addMaterial = async (workId: string) => {
        const created = await estimatesMockRepo.addMaterial(estimateId, workId);
        setRows((prev) => [...prev, created]);
        setExpandedWorkIds((prev) => new Set([...prev, workId]));
    };

    const addWorkFromCatalog = async (catalogWork: CatalogWork) => {
        try {
            const safePrice = Number(catalogWork.price);
            const created = await estimatesMockRepo.addWork(estimateId, {
                name: catalogWork.name,
                unit: catalogWork.unit || 'шт',
                price: Number.isFinite(safePrice) ? safePrice : 0,
                qty: 1
            });
            setRows((prev) => [...prev, created]);
            setExpandedWorkIds((prev) => new Set([...prev, created.id]));
            toast({
                title: 'Работа добавлена',
                description: catalogWork.name
            });
        } catch {
            toast({
                variant: 'destructive',
                title: 'Ошибка',
                description: 'Не удалось добавить работу из справочника.'
            });
        }
    };

    return (
        <div className="space-y-3">
            <DataTable
                columns={getEstimateColumns({
                    expandedWorkIds,
                    onToggleExpand: (workId) => setExpandedWorkIds((prev) => {
                        const next = new Set(prev);
                        if (next.has(workId)) {
                            next.delete(workId);
                        } else {
                            next.add(workId);
                        }
                        return next;
                    }),
                    onPatch: patch,
                    onAddMaterial: addMaterial,
                })}
                data={visibleRows}
                filterColumn="name"
                filterPlaceholder="Поиск по строкам сметы..."
                height="520px"
                actions={
                    <div className="flex items-center gap-1.5 sm:gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8 gap-1.5 px-2 md:px-3"
                            onClick={() => setIsCalculationModeOpen(true)}
                        >
                            <Calculator className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="hidden sm:inline text-xs md:text-sm">Режим расчета</span>
                        </Button>
                        <Button variant="outline" size="sm" className="h-8 gap-1.5 px-2 md:px-3">
                            <Save className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="hidden sm:inline text-xs md:text-sm">Сохранить</span>
                        </Button>

                        {/* Desktop toolbar */}
                        <div className="hidden lg:flex items-center gap-1.5">
                            <Button variant="outline" size="sm" className="h-8 gap-1.5 px-3">
                                <FileStack className="h-3.5 w-3.5 text-muted-foreground" />
                                <span className="text-xs md:text-sm">Шаблон</span>
                            </Button>
                            <Button variant="outline" size="sm" className="h-8 gap-1.5 px-3">
                                <Percent className="h-3.5 w-3.5 text-muted-foreground" />
                                <span className="text-xs md:text-sm">Коэффициент</span>
                            </Button>
                            <Button variant="outline" size="sm" className="h-8 gap-1.5 px-3">
                                <FileUp className="h-3.5 w-3.5 text-muted-foreground" />
                                <span className="text-xs md:text-sm">Импорт</span>
                            </Button>
                            <Button variant="outline" size="sm" className="h-8 gap-1.5 px-3">
                                <FileDown className="h-3.5 w-3.5 text-muted-foreground" />
                                <span className="text-xs md:text-sm">Экспорт</span>
                            </Button>
                        </div>

                        {/* Mobile/Tablet dropdown */}
                        <div className="lg:hidden">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                                        <MoreHorizontal className="h-4 w-4" />
                                        <span className="sr-only">More actions</span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                    <DropdownMenuItem className="gap-2">
                                        <FileStack className="h-4 w-4 text-muted-foreground" />
                                        <span>Шаблон</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="gap-2">
                                        <Percent className="h-4 w-4 text-muted-foreground" />
                                        <span>Коэффициент</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="gap-2">
                                        <FileUp className="h-4 w-4 text-muted-foreground" />
                                        <span>Импорт</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="gap-2">
                                        <FileDown className="h-4 w-4 text-muted-foreground" />
                                        <span>Экспорт</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        <Button variant="destructive" size="sm" className="h-8 gap-1.5 px-2 md:px-3">
                            <Trash2 className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline text-xs md:text-sm">Удалить</span>
                        </Button>
                    </div>
                }
            />
            {savingRowIds.size > 0 && <p className="text-xs text-muted-foreground">Сохранение: {Array.from(savingRowIds).join(', ')}</p>}

            <Sheet open={isCalculationModeOpen} onOpenChange={setIsCalculationModeOpen}>
                <SheetContent side="right" className="w-full sm:max-w-xl p-0 flex flex-col">
                    <div className="p-6 border-b">
                        <SheetTitle className="text-xl md:text-2xl">Справочник работ</SheetTitle>
                        <SheetDescription className="text-sm">
                            Выберите необходимые позиции для автоматического добавления в смету.
                        </SheetDescription>
                    </div>
                    <div className="flex-1 overflow-hidden flex flex-col">
                        <WorkCatalogPicker
                            onAddWork={addWorkFromCatalog}
                        />
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    );
}
