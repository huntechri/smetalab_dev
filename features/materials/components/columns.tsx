"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Settings } from "lucide-react"
import Image from "next/image"
import { Button } from "@/shared/ui/button"
import { Input } from "@/shared/ui/input"
import { MaterialRow } from "@/shared/types/domain/material-row"
import { TableMeta } from "@/shared/ui/data-table"
import { TableHeaderActions, TableRowActions } from "@/shared/ui/table-actions"

export const columns: ColumnDef<MaterialRow>[] = [
    {
        accessorKey: "code",
        header: "Код",
        size: 100,
        cell: ({ row, table }) => {
            const isPlaceholder = row.original.isPlaceholder
            const meta = table.options.meta as TableMeta<MaterialRow>
            if (isPlaceholder) {
                return <Input  placeholder="Код..." value={row.original.code || ""} onChange={(e) => meta.updatePlaceholderRow?.(row.original.id, { code: e.target.value })} />
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
                return <Input  placeholder="Название..." value={row.original.name || ""} onChange={(e) => meta.updatePlaceholderRow?.(row.original.id, { name: e.target.value })} />
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
                return <Input  placeholder="URL..." value={row.original.imageUrl || ""} onChange={(e) => meta.updatePlaceholderRow?.(row.original.id, { imageUrl: e.target.value })} />
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
                return <Input  placeholder="ед..." value={row.original.unit || ""} onChange={(e) => meta.updatePlaceholderRow?.(row.original.id, { unit: e.target.value })} />
            }
            return <div className="text-center text-[12px] text-muted-foreground font-medium">{row.getValue("unit")}</div>
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
                return <Input  type="number" placeholder="0" value={row.original.price || ""} onChange={(e) => meta.updatePlaceholderRow?.(row.original.id, { price: Number(e.target.value) })} />
            }
            const price = parseFloat(row.getValue("price"))
            const formatted = new Intl.NumberFormat("ru-RU", { style: "currency", currency: "RUB", minimumFractionDigits: 0 }).format(price || 0)
            return <div className="text-center font-bold text-[12px] tracking-tight">{formatted}</div>
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
                return <Input  placeholder="Кат1..." value={row.original.categoryLv1 || ""} onChange={(e) => meta.updatePlaceholderRow?.(row.original.id, { categoryLv1: e.target.value })} />
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
