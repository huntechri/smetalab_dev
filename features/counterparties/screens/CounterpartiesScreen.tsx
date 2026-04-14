"use client";

import { useMemo, useState, useTransition, useEffect } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { CounterpartyRow } from "@/types/counterparty-row";
import { columns } from "../components/columns";
import { DataTable } from "@/shared/ui/data-table";
import { Button } from "@/shared/ui/button";
import { Plus, Loader2, FilePlus } from "lucide-react";
import { TableEmptyState } from "@/shared/ui/table-empty-state";
import { CreateCounterpartySheet } from "../components/CreateCounterpartySheet";
import { useCounterpartiesActions } from "../hooks/useCounterpartiesActions";
import { useBreadcrumbs } from '@/components/providers/breadcrumb-provider';
import { fetchCounterpartiesPage } from "@/app/actions/counterparties";
import { useAppToast } from "@/components/providers/use-app-toast";

const PAGE_SIZE = 50;

interface CounterpartiesScreenProps {
    initialData: CounterpartyRow[];
    totalCount: number;
    tenantId: number;
}

export function CounterpartiesScreen({ initialData, totalCount, tenantId }: CounterpartiesScreenProps) {
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [editingCounterparty, setEditingCounterparty] = useState<CounterpartyRow | null>(null);
    const [rows, setRows] = useState<CounterpartyRow[]>(initialData);
    const [rowsCount, setRowsCount] = useState(totalCount);

    useBreadcrumbs([
        { label: 'Главная', href: '/app' },
        { label: 'Справочники' },
        { label: 'Контрагенты' },
    ]);

    // Search state
    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearchTerm = useDebounce(searchTerm, 500);
    const [isSearching, startSearchTransition] = useTransition();

    // Table height for mobile
    const [tableHeight, setTableHeight] = useState("600px");

    useEffect(() => {
        const updateHeight = () => {
            // 400px is roughly 6 rows + header
            setTableHeight(window.innerWidth < 768 ? "400px" : "600px");
        };

        updateHeight();
        window.addEventListener('resize', updateHeight);
        return () => window.removeEventListener('resize', updateHeight);
    }, []);

    const [isLoadingMore, startLoadMoreTransition] = useTransition();
    const { toast } = useAppToast();

    // Handle search changes
    useEffect(() => {
        // Skip initial render if empty
        if (debouncedSearchTerm === "" && rows.length === initialData.length) {
            return;
        }

        startSearchTransition(async () => {
            const result = await fetchCounterpartiesPage({
                offset: 0,
                limit: PAGE_SIZE,
                search: debouncedSearchTerm || undefined,
            });

            if (!result.success) {
                toast({ variant: "destructive", title: result.message || "Не удалось выполнить поиск" });
                return;
            }

            setRows(result.data.data);
            setRowsCount(result.data.count);
        });
    }, [debouncedSearchTerm, initialData.length, toast]);

    const handleCreate = () => {
        setEditingCounterparty(null);
        setIsSheetOpen(true);
    };

    const handleEdit = (counterparty: CounterpartyRow) => {
        setEditingCounterparty(counterparty);
        setIsSheetOpen(true);
    };

    const { handleDelete } = useCounterpartiesActions();

    const onSaved = (saved: CounterpartyRow, mode: "create" | "update") => {
        setIsSheetOpen(false);
        setEditingCounterparty(null);

        if (mode === "create") {
            setRows((prev) => [saved, ...prev]);
            setRowsCount((prev) => prev + 1);
            return;
        }

        setRows((prev) => prev.map((item) => (item.id === saved.id ? saved : item)));
    };

    const onDelete = async (counterparty: CounterpartyRow) => {
        const previousRows = rows;

        await handleDelete(counterparty, {
            onOptimisticDelete: () => {
                setRows((prev) => prev.filter((item) => item.id !== counterparty.id));
                setRowsCount((prev) => Math.max(0, prev - 1));
            },
            onRollback: () => {
                setRows(previousRows);
                setRowsCount((prev) => prev + 1);
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
                search: debouncedSearchTerm || undefined
            });

            if (!result.success) {
                toast({ variant: "destructive", title: result.message || "Не удалось загрузить данные" });
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
        <div className="space-y-4">
            <h1 className="sr-only">Контрагенты</h1>

            <DataTable
                columns={columns}
                data={rows}
                height={tableHeight}
                className="text-[12px]"
                filterColumn="name"
                filterPlaceholder="Поиск по названию..."
                externalSearchValue={searchTerm}
                onSearchValueChange={setSearchTerm}
                isSearching={isSearching}
                onEndReached={handleLoadMore}
                emptyState={
                    <TableEmptyState
                        title="Список контрагентов пуст"
                        description="Добавьте первого контрагента, чтобы начать работу"
                        icon={FilePlus}
                        action={
                            <Button
                                variant="standard"
                                className="h-8 rounded-[7.6px] px-6 font-medium"
                                onClick={handleCreate}
                            >
                                <Plus className="size-3.5 mr-2" />
                                Добавить контрагента
                            </Button>
                        }
                    />
                }
                actions={
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        {canLoadMore && (
                            <Button
                                variant="standard"
                                onClick={handleLoadMore}
                                disabled={isLoadingMore}
                            >
                                {isLoadingMore ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                                <span className="hidden sm:inline">Загрузить ещё</span>
                                <span className="sm:hidden">Ещё</span>
                            </Button>
                        )}
                        <Button
                            onClick={handleCreate}
                            variant="standard"
                            className="shrink-0 ml-auto"
                            aria-label="Добавить контрагента"
                        >
                            <Plus className="h-4 w-4 mr-1" />
                            <span>Добавить</span>
                        </Button>
                    </div>
                }
                meta={{
                    onEdit: handleEdit,
                    onDelete: onDelete,
                }}
            />

            <CreateCounterpartySheet
                open={isSheetOpen}
                onOpenChange={setIsSheetOpen}
                counterparty={editingCounterparty}
                tenantId={tenantId}
                onSaved={onSaved}
            />
        </div>
    );
}

export const CounterpartiesClient = CounterpartiesScreen;
