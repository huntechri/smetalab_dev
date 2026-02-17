import { EstimateRoomParamDraft } from '../types/room-params.dto';

export const toSafeNumber = (value: string | number | null | undefined): number => {
    const parsed = typeof value === 'number' ? value : Number(value ?? 0);
    return Number.isFinite(parsed) ? parsed : 0;
};

export const format2 = (value: number): string => toSafeNumber(value).toFixed(2);

const sumOpeningsArea = (row: EstimateRoomParamDraft): number => {
    const windows = row.windows.reduce((sum, item) => sum + toSafeNumber(item.height) * toSafeNumber(item.width), 0);
    const portals = row.portals.reduce((sum, item) => sum + toSafeNumber(item.height) * toSafeNumber(item.width), 0);
    return windows + portals;
};

export const calcWallsArea = (row: EstimateRoomParamDraft): number => {
    const perimeter = toSafeNumber(row.perimeter);
    const height = toSafeNumber(row.height);
    const result = perimeter * height - sumOpeningsArea(row);
    if (!Number.isFinite(result) || result < 0) {
        return 0;
    }
    return result;
};

export const calcSlopes = (row: EstimateRoomParamDraft): number => {
    const windowsSlopes = row.windows.reduce((sum, item) => {
        const h = toSafeNumber(item.height);
        const w = toSafeNumber(item.width);
        return sum + h * 2 + w;
    }, 0);

    return windowsSlopes + toSafeNumber(row.wallSegments);
};

export const calculateTotals = (rows: EstimateRoomParamDraft[]) => rows.reduce((acc, row) => {
    acc.floorArea += toSafeNumber(row.floorArea);
    acc.wallsArea += calcWallsArea(row);
    acc.slopes += calcSlopes(row);
    acc.ceilingArea += toSafeNumber(row.ceilingArea);
    acc.doors += toSafeNumber(row.doorsCount);
    return acc;
}, {
    floorArea: 0,
    wallsArea: 0,
    slopes: 0,
    ceilingArea: 0,
    doors: 0,
});
