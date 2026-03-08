'use client';

import { useCallback, useState } from 'react';
import { MaterialSupplierRow } from '@/types/material-supplier-row';
import { columns } from '../components/columns';
import { DataTable } from '@/shared/ui/data-table';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
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
} from '@/shared/ui/breadcrumb';

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
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between px-1 md:px-0">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem><BreadcrumbLink href="/app">Главная</BreadcrumbLink></BreadcrumbItem>
            <BreadcrumbSeparator /><BreadcrumbItem><BreadcrumbLink>Справочники</BreadcrumbLink></BreadcrumbItem>
            <BreadcrumbSeparator /><BreadcrumbItem><BreadcrumbPage>Поставщики</BreadcrumbPage></BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <Badge variant="secondary" className="h-7 px-3 text-xs font-semibold shadow-sm w-fit">
          {suppliers.length.toLocaleString('ru-RU')} записей
        </Badge>
      </div>
      <h1 className="sr-only">Поставщики</h1>

      <DataTable
        columns={columns}
        data={suppliers}
        filterColumn="name"
        onSearch={handleSearch}
        isSearching={isLoadingMore}
        externalSearchValue={searchTerm}
        onSearchValueChange={setSearchTerm}
        onEndReached={() => { void loadPage(); }}
        actions={
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {canLoadMore && (
              <Button
                variant="outline"
                className="h-9 text-xs md:text-sm font-semibold tracking-tight transition-all active:scale-95 shadow-sm"
                onClick={() => { void loadPage(); }}
                disabled={isLoadingMore}
              >
                {isLoadingMore ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                <span>Ещё</span>
              </Button>
            )}
            <Button
              onClick={() => { setEditingSupplier(null); setIsSheetOpen(true); }}
              variant="outline"
              className="shrink-0 h-9 text-xs md:text-sm font-semibold tracking-tight transition-all active:scale-95 shadow-sm ml-auto"
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
