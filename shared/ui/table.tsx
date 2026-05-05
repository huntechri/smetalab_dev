"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { primitiveTableCellClassName, primitiveTableHeadCellClassName } from '@/shared/ui/primitive-table'

function Table({ className, ...props }: React.ComponentProps<"table">) {
    return (
        <div className="relative w-full overflow-auto">
            <table
                data-slot="table"
                className={cn("w-full border-collapse caption-bottom text-sm", className)}
                {...props}
            />
        </div>
    )
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
    return (
        <thead
            data-slot="table-header"
            className={cn("[&_tr]:border-b", className)}
            {...props}
        />
    )
}

/** Variant of TableHeader with sticky-on-scroll behavior */
function StickyTableHeader({ className, ...props }: React.ComponentProps<"thead">) {
    return (
        <thead
            data-slot="table-header"
            className={cn("sticky top-0 z-20 border-b bg-muted/80 backdrop-blur [&_tr]:border-b", className)}
            {...props}
        />
    )
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
    return (
        <tbody
            data-slot="table-body"
            className={cn("[&_tr:last-child]:border-0", className)}
            {...props}
        />
    )
}

function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
    return (
        <tfoot
            data-slot="table-footer"
            className={cn(
                "bg-muted/50 border-t font-normal [&>tr]:last:border-b-0",
                className
            )}
            {...props}
        />
    )
}

const tableRowVariantClassNames: Record<string, string> = {
  default: 'border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted',
  header: 'bg-background shadow-[0_1px_0_0_rgba(0,0,0,0.08)]',
  body: 'group/row cursor-default animate-in border-b fade-in slide-in-from-left-1 transition-colors duration-300 last:border-0 hover:bg-muted/60',
} as const

function TableRow({ className, variant = 'default', ...props }: React.ComponentProps<"tr"> & { variant?: string }) {
    return (
        <tr
            data-slot="table-row"
            className={cn(
                tableRowVariantClassNames[variant] ?? tableRowVariantClassNames.default,
                className
            )}
            {...props}
        />
    )
}

const tableHeadVariantClassNames: Record<string, string> = {
  default: primitiveTableHeadCellClassName,
  mutedMeta: primitiveTableHeadCellClassName + ' text-xs',
  roleLabel: 'border-l border-border px-2 py-4 text-center h-10 align-middle font-normal [&:has([role=checkbox])]:pr-0',
} as const

function TableHead({ className, variant = 'default', ...props }: React.ComponentProps<"th"> & { variant?: string }) {
    return (
        <th
            data-slot="table-head"
            className={cn(
                tableHeadVariantClassNames[variant] ?? tableHeadVariantClassNames.default,
                className
            )}
            {...props}
        />
    )
}

const tableCellVariantClassNames: Record<string, string> = {
  default: primitiveTableCellClassName,
  body: 'border-b px-3 py-1.5 align-middle transition-colors md:px-4 md:py-2',
  roleControl: 'border-l border-border/50 px-2 py-4',
} as const

function TableCell({ className, variant = 'default', ...props }: React.ComponentProps<"td"> & { variant?: string }) {
    return (
        <td
            data-slot="table-cell"
            className={cn(
                tableCellVariantClassNames[variant] ?? tableCellVariantClassNames.default,
                className
            )}
            {...props}
        />
    )
}

function TableCaption({
    className,
    ...props
}: React.ComponentProps<"caption">) {
    return (
        <caption
            data-slot="table-caption"
            className={cn("text-muted-foreground mt-4 text-sm", className)}
            {...props}
        />
    )
}

export {
    Table,
    TableHeader,
    StickyTableHeader,
    TableBody,
    TableFooter,
    TableHead,
    TableRow,
    TableCell,
    TableCaption,
}
