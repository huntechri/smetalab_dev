"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Settings } from "lucide-react"
import Image from "next/image"
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
            return <div className="font-medium text-[12px] px-2 text-muted-foreground">{row.getValue("code")}</div>
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
            return (
                <div className="flex flex-col gap-0.5 py-1 min-w-0 min-h-7">
                    <span className="text-[12px] font-normal truncate" title={row.getValue("name")}>
                        {row.getValue("name")}
                    </span>
                    {row.original.vendor && (
                        <span className="text-[12px] text-foreground/80 font-medium truncate uppercase tracking-tight">
                            {row.original.vendor}
                        </span>
                    )}
                </div>
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
            if (!imageUrl) return <div className="w-[25px] h-[25px] bg-muted/30 rounded flex items-center justify-center text-[10px] text-muted-foreground/50">N/A</div>
            return (
                <div className="w-[25px] h-[25px] relative group-hover/row:scale-110 transition-transform overflow-hidden rounded shadow-sm border border-border/50">
                    <Image
                        src={imageUrl}
                        alt={row.original.name ? `Фото материала: ${row.original.name}` : 'Фото материала'}
                        fill
                        sizes="25px"
                        className="object-cover"
                        loading="lazy"
                   />
                </div>
            )
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
            const cats = [row.original.categoryLv1, row.original.categoryLv2, row.original.categoryLv3, row.original.categoryLv4].filter(Boolean)
            return (
                <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] font-medium text-muted-foreground whitespace-normal break-words leading-tight" title={cats.join('> ')}>
                        {cats.join(' / ') || '—'}
                    </span>
                </div>
            )
        }
    },
    {
        id: "actions",
        size: 80,
        header: ({ table }) => (
            <TableHeaderActions
                table={table}
                className="flex justify-end pr-4 items-center gap-1"
                insertButtonSize="icon-sm"
                actionMenuAriaLabel="Дополнительные действия"
                insertWithTooltip
                trigger={
                    <Button variant="ghost" size="icon-sm" aria-label="Дополнительные действия" title="Дополнительные действия">
                        <Settings className="h-4 w-4" />
                    </Button>
                }
            />
        ),
        cell: ({ row, table }) => (
            <TableRowActions
                row={row.original}
                table={table}
                className="flex justify-end pr-2 items-center gap-1 group/actions"
                insertButtonSize="icon-sm"
                actionButtonSize="icon-sm"
                insertLabel="Добавить строку ниже"
                insertTitle="Добавить строку ниже"
                insertWithTooltip
                placeholderIconClassName="h-3 w-3"
                placeholderWithTooltips
                placeholderStopPropagation
            />
        )
    }
]
