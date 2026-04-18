"use client"

import * as React from "react"
import {
    closestCenter,
    DndContext,
    KeyboardSensor,
    MouseSensor,
    TouchSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
    type UniqueIdentifier,
} from "@dnd-kit/core"
import { restrictToVerticalAxis } from "@dnd-kit/modifiers"
import {
    arrayMove,
    SortableContext,
    useSortable,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    CircleCheckBig,
    EllipsisVertical,
    GripVertical,
    Columns2,
    Loader,
    Plus,
} from "lucide-react"
import {
    type ColumnDef,
    type ColumnFiltersState,
    flexRender,
    getCoreRowModel,
    getFacetedRowModel,
    getFacetedUniqueValues,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    type Row,
    type SortingState,
    useReactTable,
    type VisibilityState,
} from "@tanstack/react-table"
import { z } from "zod"

import { taskSchema } from "../schemas/task-schema"
import { useIsMobile } from "@/shared/hooks/use-mobile"
import { Badge } from "@/shared/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/shared/ui/checkbox"
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/shared/ui/drawer"
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu"
import { Input } from "@/shared/ui/input"
import { Label } from "@/shared/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/shared/ui/select"
import { Separator } from "@/shared/ui/separator"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/shared/ui/table"
import {
    Tabs,
    TabsList,
    TabsTrigger,
} from "@/shared/ui/tabs"

import demoData from "../data/demo-tasks.json"

// Helper component for drag handle
function DragHandle({ id }: { id: number }) {
    const { attributes, listeners, setNodeRef } = useSortable({
        id,
    })

    return (
        <Button
            {...attributes}
            {...listeners}
            ref={setNodeRef}
            variant="ghost"
            size="icon-xs"
        >
            <GripVertical className="text-muted-foreground size-3" />
            <span className="sr-only">Move</span>
        </Button>
    )
}

function getTaskStatusMeta(status: string) {
    const normalizedStatus = status.trim().toLowerCase()

    if (normalizedStatus === "done" || normalizedStatus === "готово") {
        return {
            label: "Готово",
            className: "border-none bg-emerald-500/12 text-emerald-700",
            icon: "done" as const,
        }
    }

    if (
        normalizedStatus === "in process" ||
        normalizedStatus === "in progress" ||
        normalizedStatus === "в работе" ||
        normalizedStatus === "в процессе"
    ) {
        return {
            label: "В работе",
            className: "border-none bg-blue-500/12 text-blue-700",
            icon: "progress" as const,
        }
    }

    return {
        label: status,
        className: "border-none bg-slate-500/12 text-slate-700",
        icon: "neutral" as const,
    }
}

const columns: ColumnDef<z.infer<typeof taskSchema>>[] = [
    {
        id: "drag",
        header: () => null,
        cell: ({ row }) => <DragHandle id={row.original.id} />,
    },
    {
        id: "select",
        header: ({ table }) => (
            <div className="flex items-center justify-center">
                <Checkbox
                    checked={
                        table.getIsAllPageRowsSelected() ||
                        (table.getIsSomePageRowsSelected() && "indeterminate")
                    }
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Select all"
                />
            </div>
        ),
        cell: ({ row }) => (
            <div className="flex items-center justify-center">
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Select row"
                />
            </div>
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "header",
        header: "Header",
        cell: ({ row }) => {
            return <TableCellViewer item={row.original} />
        },
        enableHiding: false,
    },
    {
        accessorKey: "type",
        header: "Section Type",
        cell: ({ row }) => (
            <div className="w-40">
                <Badge variant="secondary" className="border-none bg-slate-500/10 px-1.5 font-normal text-slate-700">
                    {row.original.type}
                </Badge>
            </div>
        ),
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const statusMeta = getTaskStatusMeta(row.original.status)

            return (
                <div className="w-32">
                    <Badge variant="secondary" className={`gap-1.5 min-w-[100px] justify-start px-1.5 font-normal ${statusMeta.className}`}>
                        {statusMeta.icon === "progress" ? (
                            <Loader className="size-3 animate-spin" />
                        ) : statusMeta.icon === "done" ? (
                            <CircleCheckBig className="size-3" />
                        ) : (
                            <span className="size-2 rounded-full bg-current/70" aria-hidden="true" />
                        )}
                        {statusMeta.label}
                    </Badge>
                </div>
            )
        },
    },
    {
        accessorKey: "target",
        header: "Target",
        cell: ({ row }) => (
            <div className="w-12 tabular-nums">
                {row.original.target}
            </div>
        ),
    },
    {
        accessorKey: "limit",
        header: "Limit",
        cell: ({ row }) => (
            <div className="w-12 tabular-nums">
                {row.original.limit}
            </div>
        ),
    },
    {
        accessorKey: "reviewer",
        header: "Reviewer",
        cell: ({ row }) => {
            const isAssigned = row.original.reviewer && row.original.reviewer !== "Назначить" && row.original.reviewer !== "Assign reviewer"

            if (isAssigned) {
                return (
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{row.original.reviewer}</span>
                    </div>
                )
            }

            return (
                <Select>
                    <SelectTrigger
                        className="w-40 cursor-pointer text-muted-foreground"
                    >
                        <SelectValue placeholder="Assign reviewer..." />
                    </SelectTrigger>
                    <SelectContent align="end">
                        <SelectItem value="Eddie Lake">Eddie Lake</SelectItem>
                        <SelectItem value="Jamik Tashpulatov">
                            Jamik Tashpulatov
                        </SelectItem>
                        <SelectItem value="Emily Whalen">Emily Whalen</SelectItem>
                    </SelectContent>
                </Select>
            )
        },
    },
    {
        id: "actions",
        cell: () => (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon-sm"
                    >
                        <EllipsisVertical className="size-4" />
                        <span className="sr-only">Open menu</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-32">
                    <DropdownMenuItem>Edit</DropdownMenuItem>
                    <DropdownMenuItem>Duplicate</DropdownMenuItem>
                    <DropdownMenuItem>Favorite</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        ),
    },
]

function DraggableRow({ row }: { row: Row<z.infer<typeof taskSchema>> }) {
    const { transform, transition, setNodeRef, isDragging } = useSortable({
        id: row.original.id,
    })

    return (
        <TableRow
            data-state={row.getIsSelected() && "selected"}
            data-dragging={isDragging}
            ref={setNodeRef}
            className="relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80"
            style={{
                transform: CSS.Transform.toString(transform),
                transition: transition,
            }}
        >
            {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
            ))}
        </TableRow>
    )
}

type DashboardDataTableProps = {
    addButtonLabel?: string;
};

export function DashboardDataTable({ addButtonLabel = 'Add Section' }: DashboardDataTableProps) {
    const [data, setData] = React.useState(() => demoData)
    const [rowSelection, setRowSelection] = React.useState({})
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [pagination, setPagination] = React.useState({
        pageIndex: 0,
        pageSize: 10,
    })
    const sortableId = React.useId()
    const sensors = useSensors(
        useSensor(MouseSensor, {}),
        useSensor(TouchSensor, {}),
        useSensor(KeyboardSensor, {})
    )

    const dataIds = React.useMemo<UniqueIdentifier[]>(
        () => data?.map(({ id }) => id) || [],
        [data]
    )

    const table = useReactTable({
        data,
        columns,
        state: {
            sorting,
            columnVisibility,
            rowSelection,
            columnFilters,
            pagination,
        },
        getRowId: (row) => row.id.toString(),
        enableRowSelection: true,
        onRowSelectionChange: setRowSelection,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFacetedRowModel: getFacetedRowModel(),
        getFacetedUniqueValues: getFacetedUniqueValues(),
    })

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event
        if (active && over && active.id !== over.id) {
            setData((data) => {
                const oldIndex = dataIds.indexOf(active.id)
                const newIndex = dataIds.indexOf(over.id)
                return arrayMove(data, oldIndex, newIndex)
            })
        }
    }

    return (
        <div className="space-y-4 px-4 lg:px-6 mt-8">
            <div className="flex items-center justify-between flex-wrap gap-3">
                <Tabs defaultValue="outline" className="w-full sm:w-auto">
                    <Select defaultValue="outline">
                        <SelectTrigger
                            className="flex w-fit sm:hidden cursor-pointer"
                            id="view-selector"
                        >
                            <SelectValue placeholder="Select a view" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="outline">Outline</SelectItem>
                            <SelectItem value="past-performance">Past Performance</SelectItem>
                            <SelectItem value="key-personnel">Key Personnel</SelectItem>
                            <SelectItem value="focus-documents">Focus Documents</SelectItem>
                        </SelectContent>
                    </Select>
                    <TabsList className="**:data-[slot=badge]:bg-muted-foreground/30 hidden **:data-[slot=badge]:size-5 **:data-[slot=badge]:rounded-full **:data-[slot=badge]:px-1 sm:flex h-9">
                        <TabsTrigger value="outline" className="cursor-pointer">
                            Outline
                        </TabsTrigger>
                        <TabsTrigger value="past-performance" className="cursor-pointer">
                            Past Performance <Badge variant="secondary">3</Badge>
                        </TabsTrigger>
                        <TabsTrigger value="key-personnel" className="cursor-pointer">
                            Key Personnel <Badge variant="secondary">2</Badge>
                        </TabsTrigger>
                        <TabsTrigger value="focus-documents" className="cursor-pointer">
                            Focus Documents
                        </TabsTrigger>
                    </TabsList>
                </Tabs>

                <div className="flex items-center gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline">
                                <Columns2 className="size-4" />
                                <span className="hidden lg:inline">Customize Columns</span>
                                <span className="lg:hidden">Columns</span>
                                <ChevronDown className="size-4 opacity-50" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            {table
                                .getAllColumns()
                                .filter(
                                    (column) =>
                                        typeof column.accessorFn !== "undefined" &&
                                        column.getCanHide()
                                )
                                .map((column) => {
                                    return (
                                        <DropdownMenuCheckboxItem
                                            key={column.id}
                                            className="capitalize"
                                            checked={column.getIsVisible()}
                                            onCheckedChange={(value) =>
                                                column.toggleVisibility(!!value)
                                            }
                                        >
                                            {column.id}
                                        </DropdownMenuCheckboxItem>
                                    )
                                })}
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <Button variant="outline">
                        <Plus className="size-4" />
                        <span className="hidden lg:inline">{addButtonLabel}</span>
                    </Button>
                </div>
            </div>

            <div className="overflow-x-auto rounded-lg border bg-card mt-4 scrollbar-thin scrollbar-thumb-muted-foreground/20">
                <DndContext
                    collisionDetection={closestCenter}
                    modifiers={[restrictToVerticalAxis]}
                    onDragEnd={handleDragEnd}
                    sensors={sensors}
                    id={sortableId}
                >
                    <Table>
                        <TableHeader className="bg-muted/30">
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id} className="hover:bg-transparent">
                                    {headerGroup.headers.map((header) => (
                                        <TableHead
                                            key={header.id}
                                            colSpan={header.colSpan}
                                            className="h-11 text-xs font-semibold text-foreground whitespace-nowrap px-4"
                                        >
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody className="[&_tr:last-child]:border-0 font-medium">
                            {table.getRowModel().rows?.length ? (
                                <SortableContext
                                    items={dataIds}
                                    strategy={verticalListSortingStrategy}
                                >
                                    {table.getRowModel().rows.map((row) => (
                                        <DraggableRow key={row.id} row={row} />
                                    ))}
                                </SortableContext>
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={columns.length}
                                        className="h-24 text-center"
                                    >
                                        No results.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </DndContext>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between py-4 gap-4">
                <div className="text-muted-foreground text-sm font-medium order-2 sm:order-1">
                    {table.getFilteredSelectedRowModel().rows.length} of{" "}
                    {table.getFilteredRowModel().rows.length} row(s) selected.
                </div>
                <div className="flex flex-wrap items-center justify-center gap-4 order-1 sm:order-2">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">Rows per page</span>
                        <Select
                            value={`${table.getState().pagination.pageSize}`}
                            onValueChange={(value) => {
                                table.setPageSize(Number(value))
                            }}
                        >
                            <SelectTrigger className="w-16 border-none shadow-none tabular-nums font-semibold">
                                <SelectValue placeholder={table.getState().pagination.pageSize} />
                            </SelectTrigger>
                            <SelectContent side="top">
                                {[10, 20, 30, 40, 50].map((pageSize) => (
                                    <SelectItem key={pageSize} value={`${pageSize}`}>
                                        {pageSize}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex items-center justify-center text-sm font-medium tabular-nums min-w-[100px]">
                        Page {table.getState().pagination.pageIndex + 1} of{" "}
                        {table.getPageCount() || 1}
                    </div>
                    <div className="flex items-center gap-1">
                        <Button
                            variant="outline"
                            size="icon-sm"
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                        >
                            <ChevronLeft className="size-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon-sm"
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                        >
                            <ChevronRight className="size-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

function TableCellViewer({ item }: { item: z.infer<typeof taskSchema> }) {
    const isMobile = useIsMobile()

    return (
        <Drawer direction={isMobile ? "bottom" : "right"}>
            <DrawerTrigger asChild>
                <Button variant="link">
                    {item.header}
                </Button>
            </DrawerTrigger>
            <DrawerContent className={isMobile ? "" : "h-full w-[400px] ml-auto p-0"}>
                <DrawerHeader className="gap-1 p-6 border-b">
                    <DrawerTitle className="text-xl">{item.header}</DrawerTitle>
                    <DrawerDescription>
                        Details for this section
                    </DrawerDescription>
                </DrawerHeader>
                <div className="flex flex-col gap-6 overflow-y-auto p-6 text-sm">
                    <div className="space-y-4">
                        <div className="flex flex-col gap-2">
                            <Label className="text-muted-foreground font-semibold uppercase text-[10px] tracking-wider">Status</Label>
                            <div className="font-semibold text-base">{item.status}</div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label className="text-muted-foreground font-semibold uppercase text-[10px] tracking-wider">Section Type</Label>
                            <div className="font-semibold text-base">{item.type}</div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label className="text-muted-foreground font-semibold uppercase text-[10px] tracking-wider">Reviewer</Label>
                            <div className="font-semibold text-base">{item.reviewer}</div>
                        </div>
                    </div>

                    <Separator />

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                            <Label className="text-muted-foreground font-semibold uppercase text-[10px] tracking-wider">Target</Label>
                            <Input defaultValue={item.target} className="font-semibold" />
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label className="text-muted-foreground font-semibold uppercase text-[10px] tracking-wider">Limit</Label>
                            <Input defaultValue={item.limit} className="font-semibold" />
                        </div>
                    </div>
                </div>
                <DrawerFooter className="mt-auto border-t p-6 gap-3 flex-row shrink-0">
                    <Button>Save changes</Button>
                    <DrawerClose asChild>
                        <Button variant="outline">Close</Button>
                    </DrawerClose>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    )
}
