"use client";

import { useState } from "react";
import { CounterpartyRow } from "@/types/counterparty-row";
import { columns } from "../components/columns";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CreateCounterpartySheet } from "../components/CreateCounterpartySheet";
import { useCounterpartiesActions } from "../hooks/useCounterpartiesActions";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface CounterpartiesScreenProps {
    initialData: CounterpartyRow[];
    totalCount: number;
    tenantId: number;
}

export function CounterpartiesScreen({ initialData, totalCount: _totalCount, tenantId }: CounterpartiesScreenProps) {
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [editingCounterparty, setEditingCounterparty] = useState<CounterpartyRow | null>(null);

    const handleCreate = () => {
        setEditingCounterparty(null);
        setIsSheetOpen(true);
    };

    const handleEdit = (counterparty: CounterpartyRow) => {
        setEditingCounterparty(counterparty);
        setIsSheetOpen(true);
    };

    const { handleDelete } = useCounterpartiesActions();

    const onSaved = () => {
        setIsSheetOpen(false);
        setEditingCounterparty(null);
    }

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
                data={initialData}
                meta={{
                    onEdit: handleEdit,
                    onDelete: handleDelete
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
