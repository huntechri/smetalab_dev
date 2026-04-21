"use client";

import { useMemo, useState, useTransition, useEffect } from "react";

import { useDebounce } from "@/shared/hooks/use-debounce";
import { useBreadcrumbs } from '@/components/providers/breadcrumb-provider';
import { useAppToast } from "@/components/providers/use-app-toast";
import { fetchCounterpartiesPage } from "@/app/actions/counterparties";
import { CounterpartyRow } from "@/shared/types/domain/counterparty-row";
import { columns } from "../components/columns";
import { CreateCounterpartySheet } from "../components/CreateCounterpartySheet";
import { useCounterpartiesActions } from "../hooks/useCounterpartiesActions";
import {
  DirectoryListScreen,
  type DirectoryListAdapter,
  useDirectorySheetState,
} from "@/features/directories";

const PAGE_SIZE = 50;

interface CounterpartiesScreenProps {
  initialData: CounterpartyRow[];
  totalCount: number;
  tenantId: number;
}

const counterpartiesListAdapter: DirectoryListAdapter<CounterpartyRow> = {
  srTitle: 'Контрагенты',
  columns,
  addLabel: 'Добавить контрагента',
  emptyTitle: 'Список контрагентов пуст',
  emptyDescription: 'Добавьте первого контрагента, чтобы начать работу',
  desktopHeight: '600px',
};

export function CounterpartiesScreen({ initialData, totalCount, tenantId }: CounterpartiesScreenProps) {
  const {
    isSheetOpen,
    setIsSheetOpen,
    editingItem: editingCounterparty,
    openCreateSheet,
    openEditSheet,
    closeSheet,
  } = useDirectorySheetState<CounterpartyRow>();
  const [rows, setRows] = useState<CounterpartyRow[]>(initialData);
  const [rowsCount, setRowsCount] = useState(totalCount);

  useBreadcrumbs([
    { label: 'Главная', href: '/app' },
    { label: 'Справочники' },
    { label: 'Контрагенты' },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [isSearching, startSearchTransition] = useTransition();
  const [isLoadingMore, startLoadMoreTransition] = useTransition();
  const { toast } = useAppToast();

  useEffect(() => {
    if (debouncedSearchTerm === '' && rows.length === initialData.length) {
      return;
    }

    startSearchTransition(async () => {
      const result = await fetchCounterpartiesPage({
        offset: 0,
        limit: PAGE_SIZE,
        search: debouncedSearchTerm || undefined,
      });

      if (!result.success) {
        toast({ variant: 'destructive', title: result.message || 'Не удалось выполнить поиск' });
        return;
      }

      setRows(result.data.data);
      setRowsCount(result.data.count);
    });
  }, [debouncedSearchTerm, initialData.length, rows.length, toast]);

  const { handleDelete } = useCounterpartiesActions();

  const onSaved = (saved: CounterpartyRow, mode: 'create' | 'update') => {
    closeSheet();

    if (mode === 'create') {
      setRows((prev) => [saved, ...prev]);
      setRowsCount((prev) => prev + 1);
      return;
    }

    setRows((prev) => prev.map((item) => (item.id === saved.id ? saved : item)));
  };

  const onDelete = async (counterparty: CounterpartyRow) => {
    const previousRows = rows;
    const previousCount = rowsCount;

    await handleDelete(counterparty, {
      onOptimisticDelete: () => {
        setRows((prev) => prev.filter((item) => item.id !== counterparty.id));
        setRowsCount((prev) => Math.max(0, prev - 1));
      },
      onRollback: () => {
        setRows(previousRows);
        setRowsCount(previousCount);
      },
    });
  };

  const canLoadMore = useMemo(() => rows.length < rowsCount, [rows.length, rowsCount]);

  const handleLoadMore = () => {
    if (!canLoadMore || isLoadingMore) {
      return;
    }

    startLoadMoreTransition(async () => {
      const result = await fetchCounterpartiesPage({
        offset: rows.length,
        limit: PAGE_SIZE,
        search: debouncedSearchTerm || undefined,
      });

      if (!result.success) {
        toast({ variant: 'destructive', title: result.message || 'Не удалось загрузить данные' });
        return;
      }

      setRows((prev) => {
        const existingIds = new Set(prev.map((item) => item.id));
        const incoming = result.data.data.filter((item) => !existingIds.has(item.id));
        return [...prev, ...incoming];
      });

      setRowsCount(result.data.count);
    });
  };

  return (
    <>
      <DirectoryListScreen
        adapter={counterpartiesListAdapter}
        rows={rows}
        searchTerm={searchTerm}
        onSearchValueChange={setSearchTerm}
        isSearching={isSearching}
        canLoadMore={canLoadMore}
        isLoadingMore={isLoadingMore}
        onLoadMore={handleLoadMore}
        onCreate={openCreateSheet}
        onEdit={openEditSheet}
        onDelete={onDelete}
      />

      <CreateCounterpartySheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        counterparty={editingCounterparty}
        tenantId={tenantId}
        onSaved={onSaved}
      />
    </>
  );
}

export const CounterpartiesClient = CounterpartiesScreen;
