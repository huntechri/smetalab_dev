"use client";

import { useMemo, useState, useTransition } from "react";
import { CounterpartyRow } from "@/types/counterparty-row";
import { columns } from "../components/columns";
import { DataTable } from "@/shared/ui/data-table";
import { Button } from "@/shared/ui/button";
import { Loader2, Plus } from "lucide-react";
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
import { useToast } from "@/shared/ui/use-toast";

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
    const [isLoadingMore, startLoadMoreTransition] = useTransition();
    const { toast } = useToast();

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
            const result = await fetchCounterpartiesPage({ offset: rows.length, limit: PAGE_SIZE });

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
        <div className="space-y-6 p-1 md:p-0">
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem><BreadcrumbLink href="/app">Главная</BreadcrumbLink></BreadcrumbItem>
                    <BreadcrumbSeparator /><BreadcrumbItem><BreadcrumbLink>Справочники</BreadcrumbLink></BreadcrumbItem>
                    <BreadcrumbSeparator /><BreadcrumbItem><BreadcrumbPage>Контрагенты</BreadcrumbPage></BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Контрагенты</h1>
                    <p className="text-muted-foreground text-sm">Управление заказчиками, подрядчиками и поставщиками.</p>
                </div>
                <Button onClick={handleCreate}>
                    <Plus className="mr-2 h-4 w-4" />
                    Добавить
                </Button>
            </div>

            <DataTable
                columns={columns}
                data={rows}
                onEndReached={handleLoadMore}
                actions={
                    canLoadMore ? (
                        <Button variant="outline" size="sm" onClick={handleLoadMore} disabled={isLoadingMore}>
                            {isLoadingMore ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                            {isLoadingMore ? "Загрузка..." : "Загрузить ещё"}
                        </Button>
                    ) : undefined
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
