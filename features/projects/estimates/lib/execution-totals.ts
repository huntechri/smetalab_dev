import type { EstimateExecutionRow } from '../types/execution.dto';

export type ExecutionTotals = {
    planned: number;
    actual: number;
};

export function calculateExecutionTotals(rows: EstimateExecutionRow[]): ExecutionTotals {
    return rows.reduce<ExecutionTotals>((acc, row) => {
        acc.planned += row.plannedSum;

        if (row.status === 'done') {
            acc.actual += row.actualSum;
        }

        return acc;
    }, { planned: 0, actual: 0 });
}
