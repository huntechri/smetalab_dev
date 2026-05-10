"use client"

import * as React from "react"
import { ColumnDef } from "@tanstack/react-table"
import { CounterpartyRow } from "@/shared/types/domain/counterparty-row"
import { TableMeta } from "@/shared/ui/data-table"
import { Badge } from "@/shared/ui/badge"
import {
    DirectoryActionsHeader,
    DirectoryNameCell,
    DirectoryRowActionMenu,
    DirectoryTextCell,
} from "@/shared/ui/cells/directory-table-cells"

export const columns: ColumnDef<CounterpartyRow>[] = [
    {
        accessorKey: "name",
        header: "Наименование",
        cell: ({ row }) => <DirectoryNameCell title={row.getValue("name") as string}>{row.getValue("name")}</DirectoryNameCell>,
    },
    {
        accessorKey: "type",
        header: "Тип",
        cell: ({ row }) => {
            const type = row.getValue("type") as string;
            const isCustomer = type === "customer";
            return (
                <Badge variant={isCustomer ? "success" : "secondary"} size="xs">
                    {isCustomer ? "Заказчик" : "Подрядчик"}
                </Badge>
            );
        },
    },
    {
        accessorKey: "legalStatus",
        header: "Статус",
        cell: ({ row }) => {
            const status = row.getValue("legalStatus") as string;
            const isJuridical = status === "juridical";
            return (
                <Badge variant={isJuridical ? "default" : "secondary"} size="xs">
                    {isJuridical ? "Юр. лицо" : "Физ. лицо"}
                </Badge>
            );
        },
    },
    {
        accessorKey: "inn",
        header: "ИНН",
        cell: ({ row }) => <DirectoryTextCell>{row.getValue("inn")}</DirectoryTextCell>,
    },
    {
        accessorKey: "phone",
        header: "Телефон",
        cell: ({ row }) => <DirectoryTextCell>{row.getValue("phone")}</DirectoryTextCell>,
    },
    {
        id: "actions",
        header: () => <DirectoryActionsHeader />,
        cell: ({ row, table }) => {
            const meta = table.options.meta as TableMeta<CounterpartyRow> | undefined;

            return (
                <DirectoryRowActionMenu
                    row={row.original}
                    onEdit={meta?.onEdit}
                    onDelete={meta?.onDelete}
                />
            )
        },
    },
]
