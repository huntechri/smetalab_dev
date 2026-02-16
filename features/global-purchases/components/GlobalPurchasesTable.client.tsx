'use client';

import { useMemo, useState } from 'react';
import { Plus, BookOpen } from 'lucide-react';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MaterialCatalogDialog } from '@/features/catalog/components/MaterialCatalogDialog.client';
import type { CatalogMaterial } from '@/features/catalog/types/dto';
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
        onPatch: updateRow,
        onRemove: removeRow,
    }), [removeRow, updateRow]);

    const handleCatalogSelect = async (material: CatalogMaterial) => {
        addCatalogRow(material, defaultProjectName);
        setIsCatalogOpen(false);
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
                            onClick={() => addManualRow(defaultProjectName)}
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

            <div className="flex justify-end px-1">
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
