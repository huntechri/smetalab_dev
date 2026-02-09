"use client"

import * as React from "react"
import { ColumnDef } from "@tanstack/react-table"
import { CounterpartyRow } from "@/types/counterparty-row"
import { TableMeta } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Pencil, Trash, Settings } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

export const columns: ColumnDef<CounterpartyRow>[] = [
    {
        accessorKey: "name",
        header: "Наименование",
        cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
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
            return <Badge variant="outline">{map[type] || type}</Badge>;
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
            return <span className="text-muted-foreground">{map[status] || status}</span>;
        },
    },
    {
        accessorKey: "inn",
        header: "ИНН",
        cell: ({ row }) => row.getValue("inn") || "—",
    },
    {
        accessorKey: "phone",
        header: "Телефон",
        cell: ({ row }) => row.getValue("phone") || "—",
    },
    {
        accessorKey: "email",
        header: "Email",
        cell: ({ row }) => row.getValue("email") || "—",
    },
    {
        id: "actions",
        header: () => <div className="text-right pr-4">Действия</div>,
        cell: ({ row, table }) => {
            const meta = table.options.meta as TableMeta<CounterpartyRow> | undefined;

            return (
                <div className="text-right pr-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <Settings className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Действия</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => meta?.onEdit?.(row.original)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Редактировать
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => meta?.onDelete?.(row.original)} className="text-destructive">
                                <Trash className="mr-2 h-4 w-4" />
                                Удалить
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            )
        },
    },
]
