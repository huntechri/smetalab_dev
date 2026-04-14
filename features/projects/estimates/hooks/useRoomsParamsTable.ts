'use client';

import { useMemo, useState } from 'react';
import { EstimateRoomParam, EstimateRoomParamDraft } from '../types/room-params.dto';
import { calculateTotals } from '../lib/room-params-calculations';

const createDraftRow = (): EstimateRoomParamDraft => ({
    id: crypto.randomUUID(),
    name: '',
    perimeter: '',
    height: '',
    floorArea: '',
    ceilingArea: '',
    ceilingSlopes: '',
    doorsCount: '',
    wallSegments: '',
    windows: [
        { height: '', width: '' },
        { height: '', width: '' },
        { height: '', width: '' },
    ],
    portals: [
        { height: '', width: '' },
        { height: '', width: '' },
        { height: '', width: '' },
    ],
});

const toDraft = (row: EstimateRoomParam): EstimateRoomParamDraft => ({
    id: row.id,
    name: row.name,
    perimeter: String(row.perimeter),
    height: String(row.height),
    floorArea: String(row.floorArea),
    ceilingArea: String(row.ceilingArea),
    ceilingSlopes: String(row.ceilingSlopes),
    doorsCount: String(row.doorsCount),
    wallSegments: String(row.wallSegments),
    windows: row.windows.map((window) => ({ height: String(window.height), width: String(window.width) })) as EstimateRoomParamDraft['windows'],
    portals: row.portals.map((portal) => ({ height: String(portal.height), width: String(portal.width) })) as EstimateRoomParamDraft['portals'],
});

export function useRoomsParamsTable(initialRows: EstimateRoomParam[]) {
    const [rows, setRows] = useState<EstimateRoomParamDraft[]>(
        initialRows.length > 0 ? initialRows.sort((a, b) => a.order - b.order).map(toDraft) : [createDraftRow()],
    );

    const totals = useMemo(() => calculateTotals(rows), [rows]);

    const updateCell = (rowId: string, field: keyof Omit<EstimateRoomParamDraft, 'id' | 'windows' | 'portals'>, value: string) => {
        setRows((prev) => prev.map((row) => row.id === rowId ? { ...row, [field]: value } : row));
    };

    const updateOpening = (rowId: string, type: 'windows' | 'portals', index: number, field: 'height' | 'width', value: string) => {
        setRows((prev) => prev.map((row) => {
            if (row.id !== rowId) {
                return row;
            }
            const next = [...row[type]];
            next[index] = { ...next[index], [field]: value };
            return { ...row, [type]: next as EstimateRoomParamDraft[typeof type] };
        }));
    };

    const addRoom = () => setRows((prev) => [...prev, createDraftRow()]);
    const removeRoom = (rowId: string) => setRows((prev) => prev.filter((row) => row.id !== rowId));

    return {
        rows,
        totals,
        addRoom,
        removeRoom,
        updateCell,
        updateOpening,
        setRows,
    };
}
