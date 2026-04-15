'use client';

import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow,
    TableFooter
} from '@/shared/ui/table';
import { flexRender } from '@tanstack/react-table';
import { Input } from '@/shared/ui/input';
import { Search } from 'lucide-react';
import type { EstimateProcurementRow } from '@/shared/types/estimate-procurement';
import { useEstimateProcurementTable } from '../../hooks/useEstimateProcurementTable';

const moneyFormatter = new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 2,
});

interface EstimateProcurementTableProps {
    data: EstimateProcurementRow[];
}

export function EstimateProcurementTable({ data }: EstimateProcurementTableProps) {
    const { table, globalFilter, setGlobalFilter, totals } = useEstimateProcurementTable(data);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="relative w-72">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Поиск по материалу..."
                        value={globalFilter ?? ''}
                        onChange={(e) => setGlobalFilter(e.target.value)}
                        className="pl-8 h-9 text-xs"
                    />
                </div>
            </div>

            <div className="rounded-[9.6px] border bg-white overflow-hidden shadow-sm">
                <Table>
                    <TableHeader className="bg-muted/30">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id} className="hover:bg-transparent border-b">
                                {headerGroup.headers.map((header) => (
                                    <TableHead 
                                        key={header.id}
                                        style={{ width: header.getSize() }}
                                        className="h-10 text-[11px] font-bold uppercase tracking-wider text-muted-foreground"
                                    >
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(header.column.columnDef.header, header.getContext())}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && 'selected'}
                                    className="hover:bg-muted/30 transition-colors h-10 border-b last:border-0"
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id} className="py-2">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={10} className="h-24 text-center text-muted-foreground italic">
                                    Нет данных для отображения.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                    <TableFooter className="bg-muted/20 font-semibold border-t">
                        <TableRow className="hover:bg-transparent border-0 h-12">
                            <TableCell colSpan={4} className="text-right text-[12px] font-bold uppercase tracking-wide text-muted-foreground/80">Итого по материалам:</TableCell>
                            <TableCell className="text-right text-[13px] font-extrabold text-primary">{moneyFormatter.format(totals.plannedAmount)}</TableCell>
                            <TableCell colSpan={2} />
                            <TableCell className="text-right text-[13px] font-extrabold text-primary">{moneyFormatter.format(totals.actualAmount)}</TableCell>
                            <TableCell colSpan={1} />
                            <TableCell className="text-right text-[13px] font-extrabold text-[#f60]">{moneyFormatter.format(totals.amountDelta)}</TableCell>
                        </TableRow>
                    </TableFooter>
                </Table>
            </div>
        </div>
    );
}
