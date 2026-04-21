'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { FilePlus } from 'lucide-react';
import { TableEmptyState } from '@/shared/ui/table-empty-state';
import { DataTable } from '@/shared/ui/data-table';
import { MaterialCatalogDialog } from '@/features/catalog/components/MaterialCatalogDialog.client';
import type { CatalogMaterial } from '@/features/catalog/types/dto';
import { useAppToast } from '@/components/providers/use-app-toast';
import { getGlobalPurchasesColumns } from './global-purchases-columns';
import { useGlobalPurchasesTable } from '../hooks/useGlobalPurchasesTable';
import type { ProjectOption, PurchaseRow, PurchaseRowsRange, SupplierOption } from '../types/dto';

import { useGlobalPurchasesImportExport } from '../hooks/useGlobalPurchasesImportExport';
import { GlobalPurchasesTableToolbar } from './GlobalPurchasesTableToolbar';
import { GlobalPurchasesSummary } from './GlobalPurchasesSummary';
import { GlobalPurchasesEmptyStateActions } from './GlobalPurchasesEmptyStateActions';

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

    const handleRangeChange = (payload: PurchaseRowsRange) => {
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
                filterPlaceholder="Поиск..."
                height="625px"
                mobileOptimized
                emptyState={
                    <TableEmptyState
                        title="Закупки не найдены"
                        description="В выбранном периоде нет данных. Добавьте закупку вручную или из справочника."
                        icon={FilePlus}
                        action={
                            <GlobalPurchasesEmptyStateActions
                                isAddingManual={isAddingManual}
                                isAddingCatalog={isAddingCatalog}
                                onAddManual={() => void handleAddManualRow()}
                                onOpenCatalog={() => setIsCatalogOpen(true)}
                            />
                        }
                    />
                }
                compactMobileToolbar
                actions={(
                    <GlobalPurchasesTableToolbar
                        filterProjectId={filterProjectId}
                        projectOptions={projectOptions}
                        openProjectFilter={openProjectFilter}
                        onOpenProjectFilterChange={setOpenProjectFilter}
                        onFilterProjectChange={setFilterProjectId}
                        range={range}
                        onRangeChange={handleRangeChange}
                        importInputRef={importInputRef}
                        onExport={() => void handleExport()}
                        onImportClick={handleImportClick}
                        onFileChange={handleImportFileChange}
                        isAddingManual={isAddingManual}
                        isAddingCatalog={isAddingCatalog}
                        onAddManual={() => void handleAddManualRow()}
                        onAddCatalog={() => setIsCatalogOpen(true)}
                    />
                )}
            />

            <GlobalPurchasesSummary totalAmount={displayedTotalsAmount} />

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
