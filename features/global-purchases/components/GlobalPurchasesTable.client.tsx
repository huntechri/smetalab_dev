'use client';

import { useMemo, useState } from 'react';
import { Plus, BookOpen } from 'lucide-react';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MaterialCatalogDialog } from '@/features/catalog/components/MaterialCatalogDialog.client';
import type { CatalogMaterial } from '@/features/catalog/types/dto';
import { useToast } from '@/components/ui/use-toast';
import { getGlobalPurchasesColumns } from './global-purchases-columns';
import { useGlobalPurchasesTable } from '../hooks/useGlobalPurchasesTable';
import type { ProjectOption, PurchaseRow } from '../types/dto';

interface GlobalPurchasesTableProps {
    initialRows: PurchaseRow[];
    projectOptions: ProjectOption[];
}

export function GlobalPurchasesTable({ initialRows, projectOptions }: GlobalPurchasesTableProps) {
    const [isCatalogOpen, setIsCatalogOpen] = useState(false);
    const [defaultProjectName, setDefaultProjectName] = useState(projectOptions[0]?.name ?? '');
    const { toast } = useToast();

    const {
        rows,
        addManualRow,
        addCatalogRow,
        updateRow,
        removeRow,
        totals,
        addedMaterialNames,
    } = useGlobalPurchasesTable(initialRows);

    const columns = useMemo(() => getGlobalPurchasesColumns({
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
    }), [removeRow, toast, updateRow]);

    const handleCatalogSelect = async (material: CatalogMaterial) => {
        try {
            await addCatalogRow(material, defaultProjectName);
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
            await addManualRow(defaultProjectName);
            toast({ title: 'Строка добавлена', description: 'Ручная строка закупки успешно создана.' });
        } catch {
            toast({
                variant: 'destructive',
                title: 'Ошибка',
                description: 'Не удалось создать ручную строку закупки.',
            });
        }
    };

    return (
        <div className="space-y-3">
            <datalist id="global-purchases-projects">
                {projectOptions.map((project) => (
                    <option key={project.id} value={project.name} />
                ))}
            </datalist>

            <DataTable
                columns={columns}
                data={rows}
                filterColumn="materialName"
                filterPlaceholder="Поиск по материалам..."
                height="580px"
                actions={(
                    <div className="flex items-center gap-2">
                        <Input
                            list="global-purchases-projects"
                            value={defaultProjectName}
                            onChange={(event) => setDefaultProjectName(event.target.value)}
                            placeholder="Объект по умолчанию"
                            className="h-8 w-52"
                        />
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
                <p className="text-xs text-muted-foreground">Изменения сохраняются автоматически в БД после подтверждения редактирования ячейки.</p>
                <Badge variant="secondary" className="bg-blue-500/5 text-blue-700/80 border-none px-2 py-0.5 h-6 text-[10px] font-bold uppercase tracking-wider">
                    Итого закупки: {new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 2 }).format(totals.amount)} ₽
                </Badge>
            </div>

            <MaterialCatalogDialog
                isOpen={isCatalogOpen}
                onClose={() => setIsCatalogOpen(false)}
                onSelect={handleCatalogSelect}
                parentWorkName={defaultProjectName || 'Глобальные закупки'}
                addedMaterialNames={addedMaterialNames}
            />
        </div>
    );
}
