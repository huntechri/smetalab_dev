'use client';

import { useCallback, useEffect, useState } from 'react';
import { MaterialSupplierRow } from '@/types/material-supplier-row';
import { columns } from '../components/columns';
import { DataTable } from '@/shared/ui/data-table';
import { Button } from '@/shared/ui/button';
import { Loader2, Plus, FilePlus } from 'lucide-react';
import { TableEmptyState } from '@/shared/ui/table-empty-state';
import { CreateMaterialSupplierSheet } from '../components/CreateMaterialSupplierSheet';
import { useMaterialSuppliersActions } from '../hooks/useMaterialSuppliersActions';
import { listMaterialSuppliers } from '@/app/actions/material-suppliers';
import { useBreadcrumbs } from '@/components/providers/breadcrumb-provider';

const PAGE_SIZE = 100;

interface MaterialSuppliersScreenProps {
  initialData: MaterialSupplierRow[];
  totalCount: number;
  tenantId: number;
}

export function MaterialSuppliersScreen({ initialData, totalCount, tenantId }: MaterialSuppliersScreenProps) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<MaterialSupplierRow | null>(null);
  const [suppliers, setSuppliers] = useState<MaterialSupplierRow[]>(initialData);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [hasMore, setHasMore] = useState(initialData.length < totalCount);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [tableHeight, setTableHeight] = useState('720px');


  useEffect(() => {
    const updateHeight = () => {
      setTableHeight(window.innerWidth < 768 ? '400px' : '720px');
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  useBreadcrumbs([
    { label: 'Главная', href: '/app' },
    { label: 'Справочники' },
    { label: 'Поставщики' },
  ]);

  const { handleDelete } = useMaterialSuppliersActions();

  const canLoadMore = hasMore && !isLoadingMore;

  const applySupplierToList = useCallback((supplier: MaterialSupplierRow) => {
    setSuppliers((prev) => {
      const existingIndex = prev.findIndex((item) => item.id === supplier.id);
      const matchesSearch = !activeSearch || supplier.name.toLowerCase().includes(activeSearch.toLowerCase());

      if (existingIndex === -1) {
        if (!matchesSearch) return prev;
        return [supplier, ...prev];
      }

      if (!matchesSearch) {
        return prev.filter((item) => item.id !== supplier.id);
      }

      const next = [...prev];
      next[existingIndex] = supplier;
      return next;
    });
  }, [activeSearch]);

  const loadPage = useCallback(async (options: { reset?: boolean; query?: string } = {}) => {
    const { reset = false, query = activeSearch } = options;

    if (!reset && !canLoadMore) {
      return;
    }

    setIsLoadingMore(true);

    try {
      const offset = reset ? 0 : suppliers.length;
      const result = await listMaterialSuppliers({ limit: PAGE_SIZE, offset, search: query || undefined });

      if (!result.success) {
        return;
      }

      setHasMore(result.data.hasMore);
      setSuppliers((prev) => (reset ? result.data.data : [...prev, ...result.data.data]));
    } finally {
      setIsLoadingMore(false);
    }
  }, [activeSearch, canLoadMore, suppliers.length]);

  const handleSearch = useCallback(async (query: string) => {
    const normalized = query.trim();
    setActiveSearch(normalized);
    await loadPage({ reset: true, query: normalized });
  }, [loadPage]);


  return (
    <div className="space-y-2">
      <h1 className="sr-only">Поставщики</h1>

      <DataTable
        columns={columns}
        data={suppliers}
        height={tableHeight}
        className="text-[12px]"
        filterInputClassName="bg-transparent border border-[hsl(240_5.9%_90%_/_0.7)] rounded-[7.6px] shadow-none font-[Manrope] text-[14px] leading-[21px] font-medium placeholder:text-[14px] px-2 py-0 hover:bg-[hsl(240_4.7%_96%_/_0.82)]"
        filterColumn="name"
        onSearch={handleSearch}
        isSearching={isLoadingMore}
        externalSearchValue={searchTerm}
        onSearchValueChange={setSearchTerm}
        onEndReached={() => { void loadPage(); }}
        emptyState={
            <TableEmptyState
                title="Список поставщиков пуст"
                description="Добавьте первого поставщика для ведения базы материалов"
                icon={FilePlus}
                action={
                    <Button
                        variant="standard"
                        className="h-8 rounded-[7.6px] px-6 font-medium"
                        onClick={() => { setEditingSupplier(null); setIsSheetOpen(true); }}
                    >
                        <Plus className="size-3.5 mr-2" />
                        Добавить поставщика
                    </Button>
                }
            />
        }
        actions={
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {canLoadMore && (
              <Button
                variant="standard"
                onClick={() => { void loadPage(); }}
                disabled={isLoadingMore}
              >
                {isLoadingMore ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                <span>Ещё</span>
              </Button>
            )}
            <Button
              onClick={() => { setEditingSupplier(null); setIsSheetOpen(true); }}
              variant="standard"
              className="shrink-0 ml-auto"
              aria-label="Добавить поставщика"
            >
              <Plus className="h-4 w-4 mr-1" />
              <span>Добавить</span>
            </Button>
          </div>
        }
        meta={{
          onEdit: (supplier) => {
            setEditingSupplier(supplier);
            setIsSheetOpen(true);
          },
          onDelete: (supplier) => {
            void handleDelete(supplier, {
              onOptimisticDelete: (id) => {
                let removed: MaterialSupplierRow | null = null;
                setSuppliers((prev) => {
                  const item = prev.find((row) => row.id === id) ?? null;
                  removed = item;
                  return prev.filter((row) => row.id !== id);
                });
                return removed;
              },
              onRollbackDelete: (row) => {
                setSuppliers((prev) => [row, ...prev]);
              },
              onDeleteSuccess: () => {
              },
            });
          },
        }}
      />

      <CreateMaterialSupplierSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        materialSupplier={editingSupplier}
        tenantId={tenantId}
        onSaved={(supplier) => {
          applySupplierToList(supplier);
          setIsSheetOpen(false);
          setEditingSupplier(null);
        }}
      />
    </div>
  );
}

export const MaterialSuppliersClient = MaterialSuppliersScreen;
