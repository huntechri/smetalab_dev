import { EstimateRow } from '../types/dto';

export type VisibleEstimateRow = EstimateRow & { depth: number };

export const getVisibleRows = (rows: EstimateRow[], expandedWorkIds: Set<string>): VisibleEstimateRow[] => {
    return rows
        .slice()
        .sort((a, b) => a.order - b.order)
        .filter((row) => row.kind === 'work' || (row.parentWorkId ? expandedWorkIds.has(row.parentWorkId) : false))
        .map((row) => ({
            ...row,
            depth: row.kind === 'work' ? 0 : 1,
        }));
};
