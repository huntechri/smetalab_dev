'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { FilePlus, PackageSearch } from 'lucide-react';
import { DataTableToolbar } from '@/shared/ui/data-table/data-table-toolbar';
import { TableEmptyState } from '@/shared/ui/table-empty-state';
import { MaterialCatalogDialog } from '@/features/catalog/components/MaterialCatalogDialog.client';
import type { CatalogMaterial } from '@/features/catalog/types/dto';
import { useAppToast } from '@/components/providers/use-app-toast';
import { useGlobalPurchasesTable } from '../hooks/useGlobalPurchasesTable';
import type { ProjectOption, PurchaseRow, PurchaseRowPatch, PurchaseRowsRange, SupplierOption } from '../types/dto';

import { useGlobalPurchasesImportExport } from '../hooks/useGlobalPurchasesImportExport';
import { GlobalPurchasesTableToolbar } from './GlobalPurchasesTableToolbar';
import { GlobalPurchasesSummary } from './GlobalPurchasesSummary';
import { GlobalPurchasesEmptyStateActions } from './GlobalPurchasesEmptyStateActions';
import { GlobalPurchasesCardsList } from './GlobalPurchasesCardsList';

interface GlobalPurchasesViewProps {
    initialRows: PurchaseRow[];
    projectOptions: ProjectOption[];
    supplierOptions: SupplierOption[];
    initialRange: PurchaseRowsRange;
}

export function GlobalPurchasesView({ initialRows, projectOptions, supplierOptions, initialRange }: GlobalPurchasesViewProps) {
    const [isCatalogOpen, setIsCatalogOpen] = useState(false);
    const defaultProjectId: string | null = null;
    const [isAddingManual, setIsAddingManual] = useState(false);
    const [isAddingCatalog, setIsAddingCatalog] = useState(false);
    const [filterProjectId, setFilterProjectId] = useState<string | null>(null);
    const [openProjectFilter, setOpenProjectFilter] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    const [isAiMode, setIsAiMode] = useState(false);
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

    const cardRows = useMemo(() => {
        const query = searchValue.trim().toLowerCase();

        if (!query) {
            return displayedRows;
        }

        return displayedRows.filter((row) => row.materialName.toLowerCase().includes(query));
    }, [displayedRows, searchValue]);

    const visibleTotalsAmount = useMemo(() =>
        cardRows.reduce((acc, row) => acc + row.amount, 0),
        [cardRows]);

    const handlePatchAction = async (rowId: string, patch: PurchaseRowPatch) => {
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
    };

    const handleRemoveAction = async (rowId: string) => {
        try {
            await removeRow(rowId);
        } catch {
            toast({
                variant: 'destructive',
                title: 'Ошибка удаления',
                description: 'Не удалось удалить строку закупки.',
            });
        }
    };

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

    const periodEmptyState = (
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
    );

    const searchEmptyState = (
        <TableEmptyState
            title="По запросу ничего не найдено"
            description="Измените строку поиска или сбросьте фильтр объекта, чтобы увидеть закупки."
            icon={PackageSearch}
        />
    );

    const emptyState = displayedRows.length > 0 && cardRows.length === 0
        ? searchEmptyState
        : periodEmptyState;

    return (
        <div className="space-y-3">
            <section className="flex flex-col rounded-lg border border-[#e4e4e7] bg-white text-[#09090b] shadow-none">
                <div className="p-1.5 sm:p-2 pb-0">
                    <DataTableToolbar
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
                        filterPlaceholder="Поиск..."
                        hasFilterControls={true}
                        isAiMode={isAiMode}
                        setIsAiMode={setIsAiMode}
                        searchValue={searchValue}
                        setSearchValue={setSearchValue}
                        compactMobileToolbar
                    />
                </div>

                <div className="pt-1.5 sm:pt-2">
                    <GlobalPurchasesCardsList
                        rows={cardRows}
                        projectOptions={projectOptions}
                        supplierOptions={supplierOptions}
                        pendingIds={pendingIds}
                        emptyState={emptyState}
                        onPatchAction={handlePatchAction}
                        onRemoveAction={handleRemoveAction}
                    />
                </div>
            </section>

            <GlobalPurchasesSummary totalAmount={visibleTotalsAmount} />

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
