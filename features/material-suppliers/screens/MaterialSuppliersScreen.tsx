'use client';

import { useCallback, useState } from 'react';
import { MaterialSupplierRow } from '@/types/material-supplier-row';
import { columns } from '../components/columns';
import { CreateMaterialSupplierSheet } from '../components/CreateMaterialSupplierSheet';
import { useMaterialSuppliersActions } from '../hooks/useMaterialSuppliersActions';
import { listMaterialSuppliers } from '@/app/actions/material-suppliers';
import { useBreadcrumbs } from '@/components/providers/breadcrumb-provider';
import { DirectoryListScreen, type DirectoryListAdapter } from '@/features/directories';

const PAGE_SIZE = 100;

interface MaterialSuppliersScreenProps {
  initialData: MaterialSupplierRow[];
  totalCount: number;
  tenantId: number;
}

const materialSuppliersListAdapter: DirectoryListAdapter<MaterialSupplierRow> = {
  srTitle: 'Поставщики',
  columns,
  addLabel: 'Добавить поставщика',
  addButtonLabel: 'Добавить',
  emptyTitle: 'Список поставщиков пуст',
  emptyDescription: 'Добавьте первого поставщика для ведения базы материалов',
  filterInputClassName: 'bg-transparent border border-[hsl(240_5.9%_90%_/_0.7)] rounded-[7.6px] shadow-none font-[Manrope] text-[14px] leading-[21px] font-medium placeholder:text-[14px] px-2 py-0 hover:bg-[hsl(240_4.7%_96%_/_0.82)]',
};

export function MaterialSuppliersScreen({ initialData, totalCount, tenantId }: MaterialSuppliersScreenProps) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<MaterialSupplierRow | null>(null);
  const [suppliers, setSuppliers] = useState<MaterialSupplierRow[]>(initialData);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [hasMore, setHasMore] = useState(initialData.length < totalCount);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  useBreadcrumbs([
    { label: 'Главная', href: '/app' },
    { label: 'Справочники' },
    { label: 'Поставщики' },
  ]);

  const { handleDelete } = useMaterialSuppliersActions();

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

    if (!reset && (isLoadingMore || !hasMore)) {
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
  }, [activeSearch, hasMore, isLoadingMore, suppliers.length]);

  const handleSearch = useCallback(async (query: string) => {
    const normalized = query.trim();
    setActiveSearch(normalized);
    await loadPage({ reset: true, query: normalized });
  }, [loadPage]);

  const openCreateSheet = () => {
    setEditingSupplier(null);
    setIsSheetOpen(true);
  };

  return (
    <div className="space-y-2">
      <DirectoryListScreen
        adapter={materialSuppliersListAdapter}
        rows={suppliers}
        searchTerm={searchTerm}
        onSearchValueChange={setSearchTerm}
        onSearch={handleSearch}
        isSearching={isLoadingMore}
        canLoadMore={hasMore}
        isLoadingMore={isLoadingMore}
        onLoadMore={() => {
          void loadPage();
        }}
        onCreate={openCreateSheet}
        onEdit={(supplier) => {
          setEditingSupplier(supplier);
          setIsSheetOpen(true);
        }}
        onDelete={(supplier) => {
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
          });
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
