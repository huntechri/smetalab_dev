'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { useToast } from '@/components/ui/use-toast';
import { Calculator, Save, FileStack, Percent, FileUp, FileDown, Trash2, MoreHorizontal } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetDescription, SheetTitle } from '@/components/ui/sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { estimatesActionRepo } from '../../repository/estimates.actions';
import { getVisibleRows } from '../../lib/rows-visible';
import { EstimateRow, RowPatch } from '../../types/dto';
import { getEstimateColumns } from './columns';
import { WorkCatalogPicker } from '@/features/catalog/components/WorkCatalogPicker.client';
import { MaterialCatalogDialog } from '@/features/catalog/components/MaterialCatalogDialog.client';
import { CatalogMaterial, CatalogWork } from '@/features/catalog/types/dto';
import { ESTIMATE_COEF_MAX, ESTIMATE_COEF_MIN, getEstimateCoefMultiplier } from '@/lib/utils/estimate-coefficient';

type ActiveWorkForMaterial = { id: string; name: string };
type ActiveMaterialForReplace = { id: string; name: string };

export function EstimateTable({ estimateId, initialRows, initialCoefPercent }: { estimateId: string; initialRows: EstimateRow[]; initialCoefPercent: number }) {
    const [rows, setRows] = useState(initialRows);
    const [coefPercent, setCoefPercent] = useState(initialCoefPercent);
    const [coefInputValue, setCoefInputValue] = useState(String(initialCoefPercent));
    const [isCoefficientDialogOpen, setIsCoefficientDialogOpen] = useState(false);
    const [isApplyingCoefficient, setIsApplyingCoefficient] = useState(false);
    const [expandedWorkIds, setExpandedWorkIds] = useState<Set<string>>(new Set(rows.filter((r) => r.kind === 'work').map((r) => r.id)));
        const [isCalculationModeOpen, setIsCalculationModeOpen] = useState(false);
    const [activeWorkForMaterial, setActiveWorkForMaterial] = useState<ActiveWorkForMaterial | null>(null);
    const [activeMaterialForReplace, setActiveMaterialForReplace] = useState<ActiveMaterialForReplace | null>(null);
    const [isExporting, setIsExporting] = useState(false);
    const { toast } = useToast();

    const visibleRows = useMemo(() => getVisibleRows(rows, expandedWorkIds), [rows, expandedWorkIds]);
    const totals = useMemo(() => rows.reduce((acc, row) => {
        if (row.kind === 'work') acc.works += row.sum || 0;
        if (row.kind === 'material') acc.materials += row.sum || 0;
        return acc;
    }, { works: 0, materials: 0 }), [rows]);

    const addedWorkNames = useMemo(() => new Set(rows.filter((r) => r.kind === 'work').map((r) => r.name)), [rows]);
    const addedMaterialNamesForActiveWork = useMemo(() => {
        if (!activeWorkForMaterial) return new Set<string>();
        return new Set(rows.filter((r) => r.kind === 'material' && r.parentWorkId === activeWorkForMaterial.id).map((r) => r.name));
    }, [rows, activeWorkForMaterial]);

        const reloadRows = async () => {
        const refreshed = await estimatesActionRepo.list(estimateId);
        setRows(refreshed);
        window.dispatchEvent(new CustomEvent('estimate:coefficient-updated', { detail: { estimateId } }));
    };

    const openCoefficientDialog = () => {
        setCoefInputValue(String(coefPercent));
        setIsCoefficientDialogOpen(true);
    };

    const applyCoefficient = async () => {
        const parsed = Number(coefInputValue.replace(',', '.'));
        if (!Number.isFinite(parsed) || parsed < ESTIMATE_COEF_MIN || parsed > ESTIMATE_COEF_MAX) {
            toast({ variant: 'destructive', title: 'Некорректный коэффициент', description: `Введите число от ${ESTIMATE_COEF_MIN} до ${ESTIMATE_COEF_MAX}.` });
            return;
        }

        try {
            setIsApplyingCoefficient(true);
            const result = await estimatesActionRepo.updateCoefficient(estimateId, parsed);
            setCoefPercent(result.coefPercent);
            await reloadRows();
            setIsCoefficientDialogOpen(false);
            toast({ title: 'Коэффициент применён', description: `Текущий коэффициент: ${result.coefPercent}%` });
        } catch (error) {
            toast({ variant: 'destructive', title: 'Ошибка', description: error instanceof Error ? error.message : 'Не удалось применить коэффициент.' });
        } finally {
            setIsApplyingCoefficient(false);
        }
    };

    const resetCoefficient = async () => {
        try {
            setIsApplyingCoefficient(true);
            await estimatesActionRepo.resetCoefficient(estimateId);
            setCoefPercent(0);
            setCoefInputValue('0');
            await reloadRows();
            setIsCoefficientDialogOpen(false);
            toast({ title: 'Коэффициент сброшен' });
        } catch (error) {
            toast({ variant: 'destructive', title: 'Ошибка', description: error instanceof Error ? error.message : 'Не удалось сбросить коэффициент.' });
        } finally {
            setIsApplyingCoefficient(false);
        }
    };

    const patch = async (rowId: string, field: 'name' | 'qty' | 'price' | 'expense', rawValue: string) => {
        const previousRows = rows;
        let parsedValue = field === 'name' ? rawValue : Number(rawValue);
        if (field === 'qty') parsedValue = Math.ceil(Number(rawValue));

        const targetRow = rows.find((r) => r.id === rowId);
        if (!targetRow) return;

        const patchData: RowPatch = { [field]: parsedValue };
        if (field === 'price' && targetRow.kind === 'work') {
            patchData.price = Number(parsedValue) / getEstimateCoefMultiplier(coefPercent);
        }

        if (field === 'expense' && targetRow.kind === 'material' && targetRow.parentWorkId) {
            const expense = Number(parsedValue);
            if (expense > 0) {
                const parentWork = rows.find((r) => r.id === targetRow.parentWorkId);
                if (parentWork) patchData.qty = Math.ceil(parentWork.qty * expense);
            } else {
                patchData.qty = 1;
            }
        }

        const optimistic = rows.map((row) => {
            if (row.id !== rowId) return row;
            const updated = { ...row, ...patchData };
            if (field === 'price' && row.kind === 'work') {
                updated.price = Number(parsedValue);
                updated.basePrice = patchData.price;
            }
            if (field === 'qty' || field === 'price' || field === 'expense') updated.sum = updated.qty * updated.price;
            return updated;
        });

        setRows(optimistic);

        try {
            const updated = await estimatesActionRepo.patchRow(estimateId, rowId, patchData);
            setRows((currentRows) => currentRows.map((row) => row.id === rowId ? updated : row));
        } catch {
            setRows(previousRows);
            toast({ variant: 'destructive', title: 'Ошибка сохранения', description: 'Не удалось сохранить изменение.' });
        } finally {
            // no-op
        }
    };

    const removeRow = async (rowId: string) => { /* unchanged logic */
        const previousRows = rows;
        const rowToRemove = previousRows.find((row) => row.id === rowId);
        if (!rowToRemove) return;
        const optimisticRows = rowToRemove.kind === 'work' ? previousRows.filter((row) => row.id !== rowId && row.parentWorkId !== rowId) : previousRows.filter((row) => row.id !== rowId);
        setRows(optimisticRows);
        try {
            const result = await estimatesActionRepo.removeRow(estimateId, rowId);
            setRows((currentRows) => currentRows.filter((row) => !result.removedIds.includes(row.id)));
            if (rowToRemove.kind === 'work') setExpandedWorkIds((prev) => { const next = new Set(prev); next.delete(rowToRemove.id); return next; });
            toast({ title: 'Строка удалена', description: rowToRemove.name });
        } catch {
            setRows(previousRows);
            toast({ variant: 'destructive', title: 'Ошибка удаления', description: 'Не удалось удалить строку.' });
        }
    };

    const addMaterialFromCatalog = async (material: CatalogMaterial) => { if (!activeWorkForMaterial) return; try { const safePrice = Number(material.price); const created = await estimatesActionRepo.addMaterial(estimateId, activeWorkForMaterial.id, { name: material.name, materialId: material.id, unit: material.unit || 'шт', imageUrl: material.imageUrl ?? null, price: Number.isFinite(safePrice) ? safePrice : 0, qty: 1 }); setRows((prev) => [...prev, created]); setExpandedWorkIds((prev) => new Set([...prev, activeWorkForMaterial.id])); toast({ title: 'Материал добавлен', description: material.name }); } catch { toast({ variant: 'destructive', title: 'Ошибка', description: 'Не удалось добавить материал из справочника.' }); } };
    const replaceMaterialFromCatalog = async (material: CatalogMaterial) => { if (!activeMaterialForReplace) return; const targetMaterialId = activeMaterialForReplace.id; try { const safePrice = Number(material.price); const updated = await estimatesActionRepo.patchRow(estimateId, targetMaterialId, { name: material.name, materialId: material.id, unit: material.unit || 'шт', imageUrl: material.imageUrl ?? null, price: Number.isFinite(safePrice) ? safePrice : 0 }); setRows((prev) => prev.map((row) => row.id === targetMaterialId ? updated : row)); setActiveMaterialForReplace(null); toast({ title: 'Материал обновлен', description: material.name }); } catch { toast({ variant: 'destructive', title: 'Ошибка', description: 'Не удалось заменить материал.' }); } };
    const addWorkFromCatalog = async (catalogWork: CatalogWork) => { try { const safePrice = Number(catalogWork.price); const created = await estimatesActionRepo.addWork(estimateId, { name: catalogWork.name, unit: catalogWork.unit || 'шт', price: Number.isFinite(safePrice) ? safePrice : 0, qty: 1 }); setRows((prev) => [...prev, created]); setExpandedWorkIds((prev) => new Set([...prev, created.id])); toast({ title: 'Работа добавлена', description: catalogWork.name }); } catch { toast({ variant: 'destructive', title: 'Ошибка', description: 'Не удалось добавить работу из справочника.' }); } };

    const exportEstimate = async (format: 'xlsx' | 'pdf') => { /* unchanged */
        try { setIsExporting(true); const response = await fetch(`/api/estimates/${estimateId}/export?format=${format}`); if (!response.ok) { let message = 'Не удалось выгрузить смету.'; try { const payload = await response.json() as { message?: string }; if (payload?.message) message = payload.message; } catch { void 0; } throw new Error(message); } const blob = await response.blob(); const disposition = response.headers.get('content-disposition'); const fallbackName = `estimate.${format}`; const fileNameMatch = disposition?.match(/filename="?([^"]+)"?/i); const fileName = fileNameMatch?.[1] ?? fallbackName; const objectUrl = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = objectUrl; link.download = fileName; document.body.appendChild(link); link.click(); link.remove(); URL.revokeObjectURL(objectUrl); toast({ title: 'Экспорт завершен', description: format === 'xlsx' ? 'Excel-файл успешно сформирован.' : 'PDF-файл успешно сформирован.' }); } catch (exportError) { toast({ variant: 'destructive', title: 'Ошибка экспорта', description: exportError instanceof Error ? exportError.message : 'Не удалось выгрузить смету.' }); } finally { setIsExporting(false); }
    };

    return <div className="space-y-3"><DataTable columns={getEstimateColumns({ expandedWorkIds, onToggleExpand: (workId) => setExpandedWorkIds((prev) => { const next = new Set(prev); if (next.has(workId)) next.delete(workId); else next.add(workId); return next; }), onPatch: patch, onOpenMaterialCatalog: (workId, workName) => setActiveWorkForMaterial({ id: workId, name: workName }), onReplaceMaterial: (materialId, materialName) => setActiveMaterialForReplace({ id: materialId, name: materialName }), onRemoveRow: removeRow })} data={visibleRows} filterColumn="name" filterPlaceholder="Поиск по строкам сметы..." height="580px" actions={<div className="flex items-center gap-1.5 sm:gap-2"><Button variant="outline" size="sm" className="h-8 gap-1.5 px-2 md:px-3" onClick={() => setIsCalculationModeOpen(true)}><Calculator className="h-3.5 w-3.5 text-muted-foreground" /><span className="hidden sm:inline text-xs md:text-sm">Режим расчета</span></Button><Button variant="outline" size="sm" className="h-8 gap-1.5 px-2 md:px-3"><Save className="h-3.5 w-3.5 text-muted-foreground" /><span className="hidden sm:inline text-xs md:text-sm">Сохранить</span></Button><div className="hidden lg:flex items-center gap-1.5"><Button variant="outline" size="sm" className="h-8 gap-1.5 px-3"><FileStack className="h-3.5 w-3.5 text-muted-foreground" /><span className="text-xs md:text-sm">Шаблон</span></Button><Button variant="outline" size="sm" className="h-8 gap-1.5 px-3" onClick={openCoefficientDialog}><Percent className="h-3.5 w-3.5 text-muted-foreground" /><span className="text-xs md:text-sm">Коэффициент</span></Button><Button variant="outline" size="sm" className="h-8 gap-1.5 px-3"><FileUp className="h-3.5 w-3.5 text-muted-foreground" /><span className="text-xs md:text-sm">Импорт</span></Button><DropdownMenu><DropdownMenuTrigger asChild><Button variant="outline" size="sm" className="h-8 gap-1.5 px-3" disabled={isExporting}><FileDown className="h-3.5 w-3.5 text-muted-foreground" /><span className="text-xs md:text-sm">{isExporting ? 'Экспорт...' : 'Экспорт'}</span></Button></DropdownMenuTrigger><DropdownMenuContent align="end" className="w-56"><DropdownMenuItem className="gap-2" onClick={() => void exportEstimate('xlsx')}><FileDown className="h-4 w-4 text-muted-foreground" /><span>Экспорт в Excel (.xlsx)</span></DropdownMenuItem><DropdownMenuItem className="gap-2" onClick={() => void exportEstimate('pdf')}><FileDown className="h-4 w-4 text-muted-foreground" /><span>Экспорт в PDF (.pdf)</span></DropdownMenuItem></DropdownMenuContent></DropdownMenu></div><div className="lg:hidden"><DropdownMenu><DropdownMenuTrigger asChild><Button variant="outline" size="sm" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /><span className="sr-only">More actions</span></Button></DropdownMenuTrigger><DropdownMenuContent align="end" className="w-48"><DropdownMenuItem className="gap-2"><FileStack className="h-4 w-4 text-muted-foreground" /><span>Шаблон</span></DropdownMenuItem><DropdownMenuItem className="gap-2" onClick={openCoefficientDialog}><Percent className="h-4 w-4 text-muted-foreground" /><span>Коэффициент</span></DropdownMenuItem><DropdownMenuItem className="gap-2"><FileUp className="h-4 w-4 text-muted-foreground" /><span>Импорт</span></DropdownMenuItem><DropdownMenuItem className="gap-2" disabled={isExporting} onClick={() => void exportEstimate('xlsx')}><FileDown className="h-4 w-4 text-muted-foreground" /><span>Экспорт в Excel</span></DropdownMenuItem><DropdownMenuItem className="gap-2" disabled={isExporting} onClick={() => void exportEstimate('pdf')}><FileDown className="h-4 w-4 text-muted-foreground" /><span>Экспорт в PDF</span></DropdownMenuItem></DropdownMenuContent></DropdownMenu></div><Button variant="destructive" size="sm" className="h-8 gap-1.5 px-2 md:px-3"><Trash2 className="h-3.5 w-3.5" /><span className="hidden sm:inline text-xs md:text-sm">Удалить</span></Button></div>} /><div className="flex flex-wrap items-center justify-end gap-2 px-1 py-1"><Badge variant="secondary" className="bg-blue-500/5 text-blue-700/80 hover:bg-blue-500/10 border-none px-2 py-0.5 h-6 text-[9px] font-bold uppercase tracking-wider">Итого работы: {new Intl.NumberFormat('ru-RU').format(totals.works)} ₽</Badge><div className="text-muted-foreground/20 font-light select-none text-[10px]">|</div><Badge variant="secondary" className="bg-amber-500/5 text-amber-700/80 hover:bg-amber-500/10 border-none px-2 py-0.5 h-6 text-[9px] font-bold uppercase tracking-wider">Итого материалы: {new Intl.NumberFormat('ru-RU').format(totals.materials)} ₽</Badge></div><Sheet open={isCalculationModeOpen} onOpenChange={setIsCalculationModeOpen}><SheetContent side="right" className="w-full sm:max-w-xl p-0 flex flex-col"><div className="p-6 border-b"><SheetTitle className="text-xl md:text-2xl">Справочник работ</SheetTitle><SheetDescription className="text-sm">Выберите необходимые позиции для автоматического добавления в смету.</SheetDescription></div><div className="flex-1 overflow-hidden flex flex-col"><WorkCatalogPicker onAddWork={addWorkFromCatalog} addedWorkNames={addedWorkNames} /></div></SheetContent></Sheet><MaterialCatalogDialog isOpen={Boolean(activeWorkForMaterial)} onClose={() => setActiveWorkForMaterial(null)} onSelect={addMaterialFromCatalog} parentWorkName={activeWorkForMaterial?.name ?? ''} addedMaterialNames={addedMaterialNamesForActiveWork} /><MaterialCatalogDialog isOpen={Boolean(activeMaterialForReplace)} onClose={() => setActiveMaterialForReplace(null)} onSelect={replaceMaterialFromCatalog} parentWorkName={activeMaterialForReplace?.name ?? ''} mode="replace" /><Dialog open={isCoefficientDialogOpen} onOpenChange={setIsCoefficientDialogOpen}><DialogContent className="sm:max-w-md"><DialogHeader><DialogTitle>Коэффициент сметы</DialogTitle><DialogDescription>Введите процент для пересчета единичных расценок работ. Материалы не изменяются.</DialogDescription></DialogHeader><div className="space-y-2"><Label htmlFor="estimate-coef">Коэффициент, %</Label><Input id="estimate-coef" value={coefInputValue} onChange={(event) => setCoefInputValue(event.target.value)} placeholder="Например: 20" /><p className="text-xs text-muted-foreground">Допустимый диапазон: от {ESTIMATE_COEF_MIN}% до {ESTIMATE_COEF_MAX}%.</p></div><DialogFooter className="gap-2 sm:justify-between"><Button variant="outline" onClick={() => setIsCoefficientDialogOpen(false)} disabled={isApplyingCoefficient}>Отмена</Button><div className="flex items-center gap-2"><Button variant="secondary" onClick={() => void resetCoefficient()} disabled={isApplyingCoefficient || coefPercent === 0}>Сбросить</Button><Button onClick={() => void applyCoefficient()} disabled={isApplyingCoefficient}>{isApplyingCoefficient ? 'Сохранение...' : 'Применить'}</Button></div></DialogFooter></DialogContent></Dialog></div>;
}
