'use client';

import { useMemo } from 'react';
import { DataTable } from '@repo/ui';
import { FilePlus } from 'lucide-react';
import { TableEmptyState } from '@repo/ui';
import { Skeleton } from '@repo/ui';
import { useEstimateExecutionController } from '../../hooks/use-estimate-execution-controller';
import { EstimateTotals } from '../EstimateTotals';
import { EstimateExecutionAddExtraWorkSheet } from './execution/EstimateExecutionAddExtraWorkSheet';
import { getEstimateExecutionColumns } from './execution/estimate-execution-columns';
import { EstimateExecutionTableActions } from './execution/EstimateExecutionTableActions';

export function EstimateExecution({ estimateId }: { estimateId: string }) {
    const {
        rows,
        isLoading,
        errorMessage,
        patchRow,
        addExtraWorkFromCatalog,
        handleExport,
        totals,
        addedWorkNames,
    } = useEstimateExecutionController({ estimateId });
    const columns = useMemo(() => getEstimateExecutionColumns({ onPatchRow: patchRow }), [patchRow]);

    if (isLoading) {
        return (
            <div className="space-y-2">
                <Skeleton className="h-9 w-full" />
                <Skeleton className="h-[460px] w-full" />
            </div>
        );
    }

    if (errorMessage) {
        return <div className="rounded-md border p-4 text-sm text-destructive">{errorMessage}</div>;
    }

    return (
        <div className="space-y-2">
            <DataTable
                columns={columns}
                data={rows}
                filterColumn="name"
                filterPlaceholder="Поиск..."
                height="600px"
                tableMinWidth="100%"
                tableContainerClassName="overflow-x-hidden md:overflow-x-auto"
                compactMobileToolbar
                emptyState={
                    <TableEmptyState
                        title="Список выполнения пуст"
                        description="Для начала работы добавьте позиции во вкладку «Смета» или создайте дополнительную работу"
                        icon={FilePlus}
                        action={
                            <EstimateExecutionAddExtraWorkSheet
                                addedWorkNames={addedWorkNames}
                                onAddWork={addExtraWorkFromCatalog}
                           />
                        }
                   />
                }
                actions={
                    <EstimateExecutionTableActions
                        addedWorkNames={addedWorkNames}
                        onExport={handleExport}
                        onAddWork={addExtraWorkFromCatalog}
                   />
                }
           />
            <div className="flex justify-end border-t border-border/60 bg-background/95 px-1 pt-1">
                <EstimateTotals planned={totals.planned} actual={totals.actual} />
            </div>
        </div>
    );
}
