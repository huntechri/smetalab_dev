'use client';

import { useMemo, useState } from 'react';
import { DataTable } from '@/components/ui/data-table';
import { useToast } from '@/components/ui/use-toast';
import { estimatesMockRepo } from '../../api';
import { getVisibleRows } from '../../lib/rows-visible';
import { EstimateRow } from '../../types/dto';
import { getEstimateColumns } from './columns';
import { EstimateTableToolbar } from './toolbar';

export function EstimateTable({ estimateId, initialRows }: { estimateId: string; initialRows: EstimateRow[] }) {
    const [rows, setRows] = useState(initialRows);
    const [expandedWorkIds, setExpandedWorkIds] = useState<Set<string>>(new Set(rows.filter((r) => r.kind === 'work').map((r) => r.id)));
    const [savingRowIds, setSavingRowIds] = useState<Set<string>>(new Set());
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

    const addWork = async () => {
        const created = await estimatesMockRepo.addWork(estimateId);
        setRows((prev) => [...prev, created]);
        setExpandedWorkIds((prev) => new Set([...prev, created.id]));
    };

    const addMaterial = async (workId: string) => {
        const created = await estimatesMockRepo.addMaterial(estimateId, workId);
        setRows((prev) => [...prev, created]);
        setExpandedWorkIds((prev) => new Set([...prev, workId]));
    };

    return (
        <div className="space-y-3">
            <EstimateTableToolbar onAddWork={addWork} />
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
            />
            {savingRowIds.size > 0 && <p className="text-xs text-muted-foreground">Сохранение: {Array.from(savingRowIds).join(', ')}</p>}
        </div>
    );
}
