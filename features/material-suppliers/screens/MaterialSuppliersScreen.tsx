'use client';

import { useCallback, useMemo, useState } from 'react';
import { MaterialSupplierRow } from '@/types/material-supplier-row';
import { columns } from '../components/columns';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Loader2, Plus } from 'lucide-react';
import { CreateMaterialSupplierSheet } from '../components/CreateMaterialSupplierSheet';
import { useMaterialSuppliersActions } from '../hooks/useMaterialSuppliersActions';
import { listMaterialSuppliers } from '@/app/actions/material-suppliers';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

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
  const [currentTotal, setCurrentTotal] = useState(totalCount);
  const [hasMore, setHasMore] = useState(initialData.length < totalCount);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const { handleDelete } = useMaterialSuppliersActions();

  const isSearchMode = activeSearch.trim().length > 0;
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

      setCurrentTotal(result.data.count);
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

  const totalLabel = useMemo(() => {
    if (!isSearchMode) return currentTotal;
    return `${suppliers.length} из ${currentTotal}`;
  }, [currentTotal, isSearchMode, suppliers.length]);

  return (
    <div className="space-y-6 p-1 md:p-0">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink href="/app">Главная</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator /><BreadcrumbItem><BreadcrumbLink>Справочники</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator /><BreadcrumbItem><BreadcrumbPage>Поставщики материалов</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Поставщики материалов</h1>
          <p className="text-muted-foreground text-sm">Всего: {totalLabel}</p>
        </div>
        <Button onClick={() => { setEditingSupplier(null); setIsSheetOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" />Добавить
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={suppliers}
        filterColumn="name"
        onSearch={handleSearch}
        isSearching={isLoadingMore}
        externalSearchValue={searchTerm}
        onSearchValueChange={setSearchTerm}
        onEndReached={() => { void loadPage(); }}
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
                setCurrentTotal((prev) => Math.max(0, prev - 1));
              },
            });
          },
        }}
      />

      {canLoadMore && (
        <div className="flex justify-center">
          <Button variant="outline" onClick={() => { void loadPage(); }} disabled={isLoadingMore}>
            {isLoadingMore ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Загрузить еще
          </Button>
        </div>
      )}

      <CreateMaterialSupplierSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        materialSupplier={editingSupplier}
        tenantId={tenantId}
        onSaved={(supplier) => {
          const isCreating = !editingSupplier;
          applySupplierToList(supplier);
          if (isCreating && !isSearchMode) {
            setCurrentTotal((prev) => prev + 1);
          }
          setIsSheetOpen(false);
          setEditingSupplier(null);
        }}
      />
    </div>
  );
}

export const MaterialSuppliersClient = MaterialSuppliersScreen;
