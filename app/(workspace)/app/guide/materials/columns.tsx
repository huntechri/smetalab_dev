"use client"

import * as React from "react"
import { ColumnDef, Table } from "@tanstack/react-table"
import { Pencil, Settings, Trash, Check, X, Plus } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { MaterialRow } from "@/types/material-row"
import { TableMeta } from "@/components/ui/data-table"
import { cva } from "class-variance-authority"

const actionButtonStyles = cva("h-8 w-8", {
    variants: {
        tone: {
            primary: "text-primary opacity-40 hover:opacity-100 transition-opacity",
            muted: "opacity-40 hover:opacity-100",
        },
    },
    defaultVariants: {
        tone: "muted",
    },
})

const insertButtonStyles = cva("h-6 w-6", {
    variants: {
        tone: {
            success: "text-green-600 hover:text-green-700 hover:bg-green-50 shadow-sm border border-transparent hover:border-green-100",
            danger: "text-destructive hover:bg-destructive/5",
        },
    },
})

const MaterialRowActions = ({ row, table }: { row: { original: MaterialRow }, table: Table<MaterialRow> }) => {
    const meta = table.options.meta as TableMeta<MaterialRow>

    if (row.original.isPlaceholder) {
        return (
            <div className="flex gap-1 justify-end pr-2">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            size="icon"
                            variant="ghost"
                            className={insertButtonStyles({ tone: "success" })}
                            onClick={(e) => {
                                e.stopPropagation();
                                meta.onSaveInsert?.(row.original.id);
                            }}
                            aria-label="Сохранить строку"
                        >
                            <Check className="h-3 w-3" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Сохранить строку</p>
                    </TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            size="icon"
                            variant="ghost"
                            className={insertButtonStyles({ tone: "danger" })}
                            onClick={(e) => {
                                e.stopPropagation();
                                meta.onCancelInsert?.();
                            }}
                            aria-label="Отменить вставку"
                        >
                            <X className="h-3 w-3" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Отменить вставку</p>
                    </TooltipContent>
                </Tooltip>
            </div>
        )
    }

    return (
        <div className="flex justify-end pr-2 items-center gap-1 group/actions">
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className={actionButtonStyles({ tone: "primary" })}
                        onClick={(e) => {
                            e.stopPropagation();
                            meta.onInsertRequest?.(row.original.id);
                        }}
                        aria-label="Добавить строку ниже"
                        title="Добавить строку ниже"
                    >
                        <Plus className="h-4 w-4" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Добавить строку ниже</p>
                </TooltipContent>
            </Tooltip>

            <DropdownMenu>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className={actionButtonStyles()} aria-label="Действия">
                                <Settings className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Действия</p>
                    </TooltipContent>
                </Tooltip>
                <DropdownMenuContent align="end" className="w-56 overflow-y-auto max-h-[80vh]">
                    <DropdownMenuItem onClick={() => meta.setEditingRow?.(row.original)}>
                        <Pencil className="mr-2 h-4 w-4" /> Изменить
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => meta.setDeletingRow?.(row.original)}
                    >
                        <Trash className="mr-2 h-4 w-4" /> Удалить
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
}

export const columns: ColumnDef<MaterialRow>[] = [
    {
        accessorKey: "code",
        header: "Код",
        size: 100,
        cell: ({ row, table }) => {
            const isPlaceholder = row.original.isPlaceholder
            const meta = table.options.meta as TableMeta<MaterialRow>
            if (isPlaceholder) {
                return <Input className="h-8 text-xs font-medium border-primary/20 bg-primary/2" placeholder="Код..." value={row.original.code || ""} onChange={(e) => meta.updatePlaceholderRow?.(row.original.id, { code: e.target.value })} />
            }
            return <div className="font-medium text-xs md:text-sm px-2 text-muted-foreground">{row.getValue("code")}</div>
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
                return <Input className="h-8 text-xs font-medium border-primary/20 bg-primary/2" placeholder="Название..." value={row.original.name || ""} onChange={(e) => meta.updatePlaceholderRow?.(row.original.id, { name: e.target.value })} />
            }
            return (
                <div className="flex flex-col gap-0.5 py-1 min-w-0">
                    <span className="text-xs md:text-sm font-normal truncate" title={row.getValue("name")}>
                        {row.getValue("name")}
                    </span>
                    {row.original.vendor && (
                        <span className="text-[10px] text-foreground/80 font-medium truncate uppercase tracking-tight">
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
                return <Input className="h-8 text-xs border-primary/20" placeholder="URL..." value={row.original.imageUrl || ""} onChange={(e) => meta.updatePlaceholderRow?.(row.original.id, { imageUrl: e.target.value })} />
            }
            const imageUrl = row.original.imageLocalUrl ?? row.original.imageUrl
            if (!imageUrl) return <div className="w-10 h-10 bg-muted/30 rounded flex items-center justify-center text-[10px] text-muted-foreground/50">N/A</div>
            return (
                <div className="w-10 h-10 relative group-hover/row:scale-110 transition-transform overflow-hidden rounded shadow-sm border border-border/50">
                    <Image
                        src={imageUrl}
                        alt={row.original.name ? `Фото материала: ${row.original.name}` : 'Фото материала'}
                        fill
                        sizes="40px"
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
                return <Input className="h-8 text-xs text-center border-primary/20 bg-primary/2" placeholder="ед..." value={row.original.unit || ""} onChange={(e) => meta.updatePlaceholderRow?.(row.original.id, { unit: e.target.value })} />
            }
            return <div className="text-center text-xs md:text-sm text-muted-foreground font-medium">{row.getValue("unit")}</div>
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
                return <Input className="h-8 text-xs text-center font-bold border-primary/20 bg-primary/2" type="number" placeholder="0" value={row.original.price || ""} onChange={(e) => meta.updatePlaceholderRow?.(row.original.id, { price: Number(e.target.value) })} />
            }
            const price = parseFloat(row.getValue("price"))
            const formatted = new Intl.NumberFormat("ru-RU", { style: "currency", currency: "RUB", minimumFractionDigits: 0 }).format(price || 0)
            return <div className="text-center font-bold text-xs md:text-sm tracking-tight">{formatted}</div>
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
                return <Input className="h-8 text-xs border-primary/20" placeholder="Кат1..." value={row.original.categoryLv1 || ""} onChange={(e) => meta.updatePlaceholderRow?.(row.original.id, { categoryLv1: e.target.value })} />
            }
            const cats = [row.original.categoryLv1, row.original.categoryLv2, row.original.categoryLv3, row.original.categoryLv4].filter(Boolean)
            return (
                <div className="flex flex-col gap-0.5">
                    <span className="text-[11px] font-medium text-muted-foreground truncate" title={cats.join(' > ')}>
                        {cats.join(' / ') || '—'}
                    </span>
                    {row.original.weight && (
                        <span className="text-[10px] text-foreground/70">{row.original.weight} кг</span>
                    )}
                </div>
            )
        }
    },
    {
        id: "actions",
        size: 80,
        header: ({ table }) => {
            const meta = table.options.meta as TableMeta<MaterialRow>
            return (
                <div className="flex justify-end pr-4 items-center gap-1">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-primary opacity-50 hover:opacity-100"
                                onClick={() => meta.onInsertRequest?.()}
                                aria-label="Добавить строку"
                                title="Добавить строку"
                            >
                                <Plus className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Добавить строку</p>
                        </TooltipContent>
                    </Tooltip>
                    <DropdownMenu modal={false}>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 opacity-50 hover:opacity-100" aria-label="Дополнительные действия" title="Дополнительные действия">
                                <Settings className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => meta.onReorder?.()}>
                                Сбросить сортировку
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            )
        },
        cell: ({ row, table }) => <MaterialRowActions row={row} table={table} />
    }
]
