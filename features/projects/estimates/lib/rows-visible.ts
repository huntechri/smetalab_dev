import { EstimateRow } from '../types/dto';

export type VisibleEstimateRow = EstimateRow & { depth: number };

export const getVisibleRows = (rows: EstimateRow[], expandedWorkIds: Set<string>): VisibleEstimateRow[] => {
    return rows
        .slice()
        .sort((a, b) => a.order - b.order)
        .filter((row) => row.kind === 'section' || row.kind === 'work' || (row.parentWorkId ? expandedWorkIds.has(row.parentWorkId) : false))
        .map((row) => ({
            ...row,
            depth: row.kind === 'section' ? 0 : row.kind === 'work' ? 1 : 2,
        }));
};
