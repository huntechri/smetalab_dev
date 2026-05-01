"use client"

import * as React from "react"
import { ColumnDef } from "@tanstack/react-table"
import { CounterpartyRow } from "@/shared/types/domain/counterparty-row"
import { TableMeta } from "@/shared/ui/data-table"
import {
    DirectoryActionsHeader,
    DirectoryBadgeCell,
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
            const map: Record<string, string> = {
                customer: "Заказчик",
                contractor: "Подрядчик",
                supplier: "Поставщик"
            };
            return <DirectoryBadgeCell>{map[type] || type}</DirectoryBadgeCell>;
        },
    },
    {
        accessorKey: "legalStatus",
        header: "Статус",
        cell: ({ row }) => {
            const status = row.getValue("legalStatus") as string;
            const map: Record<string, string> = {
                individual: "Физ. лицо",
                company: "Юр. лицо"
            };
            return <DirectoryTextCell muted>{map[status] || status}</DirectoryTextCell>;
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
        accessorKey: "email",
        header: "Email",
        cell: ({ row }) => <DirectoryTextCell>{row.getValue("email")}</DirectoryTextCell>,
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
