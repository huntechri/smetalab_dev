"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Settings } from "lucide-react"
import { Button } from "@/shared/ui/button"
import { MaterialRow } from "@/shared/types/domain/material-row"
import { TableMeta } from "@/shared/ui/data-table"
import { TableHeaderActions, TableRowActions } from "@/shared/ui/table-actions"
import {
    CenteredUnitCell,
    FormattedCurrencyCell,
    PlaceholderNumberCell,
    PlaceholderTextCell,
} from "@/shared/ui/cells/table-cell-helpers"
import {
    DirectoryCategoryCell,
    DirectoryCodeCell,
    DirectoryImageCell,
    DirectoryNameCell,
} from "@/shared/ui/cells/directory-table-cells"

export const columns: ColumnDef<MaterialRow>[] = [
    {
        accessorKey: "code",
        header: "Код",
        size: 100,
        cell: ({ row, table }) => {
            const isPlaceholder = row.original.isPlaceholder
            const meta = table.options.meta as TableMeta<MaterialRow>
            if (isPlaceholder) {
                return <PlaceholderTextCell placeholder="Код..." value={row.original.code || ""} onValueChange={(code) => meta.updatePlaceholderRow?.(row.original.id, { code })} />
            }
            return <DirectoryCodeCell>{row.getValue("code")}</DirectoryCodeCell>
        }
    },
    {
        accessorKey: "name",
        header: "Наименование",
        size: 300,
        cell: ({ row, table }) => {
            const isPlaceholder = row.original.isPlaceholder
            const meta = table.options.meta as TableMeta<MaterialRow>
            if (isPlaceholder) {
                return <PlaceholderTextCell placeholder="Название..." value={row.original.name || ""} onValueChange={(name) => meta.updatePlaceholderRow?.(row.original.id, { name })} />
            }
            const name = row.getValue("name") as string;
            return (
                <DirectoryNameCell title={name} secondary={row.original.vendor}>
                    {name}
                </DirectoryNameCell>
            )
        }
    },
    {
        id: "photo",
        header: "Фото",
        size: 80,
        cell: ({ row, table }) => {
            const isPlaceholder = row.original.isPlaceholder
            const meta = table.options.meta as TableMeta<MaterialRow>
            if (isPlaceholder) {
                return <PlaceholderTextCell placeholder="URL..." value={row.original.imageUrl || ""} onValueChange={(imageUrl) => meta.updatePlaceholderRow?.(row.original.id, { imageUrl })} />
            }
            const imageUrl = row.original.imageLocalUrl ?? row.original.imageUrl
            return <DirectoryImageCell src={imageUrl} alt={row.original.name ? `Фото материала: ${row.original.name}` : 'Фото материала'} />
        }
    },
    {
        accessorKey: "unit",
        header: () => <div className="text-center">Ед.изм.</div>,
        size: 80,
        cell: ({ row, table }) => {
            const isPlaceholder = row.original.isPlaceholder
            const meta = table.options.meta as TableMeta<MaterialRow>
            if (isPlaceholder) {
                return <PlaceholderTextCell placeholder="ед..." value={row.original.unit || ""} onValueChange={(unit) => meta.updatePlaceholderRow?.(row.original.id, { unit })} />
            }
            return <CenteredUnitCell value={row.getValue("unit")} />
        }
    },
    {
        accessorKey: "price",
        header: () => <div className="text-center">Цена</div>,
        size: 110,
        cell: ({ row, table }) => {
            const isPlaceholder = row.original.isPlaceholder
            const meta = table.options.meta as TableMeta<MaterialRow>
            if (isPlaceholder) {
                return <PlaceholderNumberCell placeholder="0" value={row.original.price || ""} onValueChange={(price) => meta.updatePlaceholderRow?.(row.original.id, { price })} />
            }
            return <FormattedCurrencyCell value={row.getValue("price")} />
        }
    },
    {
        id: "category",
        header: "Категория",
        size: 200,
        cell: ({ row, table }) => {
            const isPlaceholder = row.original.isPlaceholder
            const meta = table.options.meta as TableMeta<MaterialRow>
            if (isPlaceholder) {
                return <PlaceholderTextCell placeholder="Кат1..." value={row.original.categoryLv1 || ""} onValueChange={(categoryLv1) => meta.updatePlaceholderRow?.(row.original.id, { categoryLv1 })} />
            }
            return <DirectoryCategoryCell values={[row.original.categoryLv1, row.original.categoryLv2, row.original.categoryLv3, row.original.categoryLv4]} />
        }
    },
    {
        id: "actions",
        size: 80,
        header: ({ table }) => (
            <TableHeaderActions
                table={table}
                insertButtonSize="icon-sm"
                actionMenuAriaLabel="Дополнительные действия"
                insertWithTooltip
                trigger={
                    <Button variant="ghost" size="icon-sm" aria-label="Дополнительные действия" title="Дополнительные действия">
                        <Settings className="size-4" />
                    </Button>
                }
            />
        ),
        cell: ({ row, table }) => (
            <TableRowActions
                row={row.original}
                table={table}
                insertButtonSize="icon-sm"
                actionButtonSize="icon-sm"
                insertLabel="Добавить строку ниже"
                insertTitle="Добавить строку ниже"
                insertWithTooltip
                placeholderWithTooltips
                placeholderStopPropagation
            />
        )
    }
]
