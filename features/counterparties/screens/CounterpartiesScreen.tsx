"use client";

import { useMemo, useState, useTransition, useEffect } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { CounterpartyRow } from "@/types/counterparty-row";
import { columns } from "../components/columns";
import { DataTable } from "@/shared/ui/data-table";
import { Button } from "@/shared/ui/button";
import { Plus, Loader2 } from "lucide-react";
import { CreateCounterpartySheet } from "../components/CreateCounterpartySheet";
import { useCounterpartiesActions } from "../hooks/useCounterpartiesActions";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/shared/ui/breadcrumb";
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
        <div className="space-y-6">
            <Breadcrumb className="px-1 md:px-0">
                <BreadcrumbList>
                    <BreadcrumbItem><BreadcrumbLink href="/app">Главная</BreadcrumbLink></BreadcrumbItem>
                    <BreadcrumbSeparator /><BreadcrumbItem><BreadcrumbLink>Справочники</BreadcrumbLink></BreadcrumbItem>
                    <BreadcrumbSeparator /><BreadcrumbItem><BreadcrumbPage>Контрагенты</BreadcrumbPage></BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between px-1 md:px-0 mb-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Контрагенты</h1>
                </div>
                <div className="hidden" aria-hidden="true" />
            </div>

            <DataTable
                columns={columns}
                data={rows}
                height={tableHeight}
                filterColumn="name"
                filterPlaceholder="Поиск по названию..."
                externalSearchValue={searchTerm}
                onSearchValueChange={setSearchTerm}
                isSearching={isSearching}
                onEndReached={handleLoadMore}
                actions={
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        {canLoadMore && (
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 text-xs md:text-sm font-semibold tracking-tight transition-all active:scale-95 shadow-xs"
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
                            variant="outline"
                            size="sm"
                            className="shrink-0 h-8 text-xs md:text-sm font-semibold tracking-tight transition-all active:scale-95 shadow-xs ml-auto"
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
