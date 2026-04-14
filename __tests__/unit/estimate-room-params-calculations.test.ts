import { describe, expect, it } from 'vitest';
import { calcSlopes, calcWallsArea, calculateTotals, toSafeNumber } from '@/features/projects/estimates/lib/room-params-calculations';
import { EstimateRoomParamDraft } from '@/features/projects/estimates/types/room-params.dto';

const baseRow: EstimateRoomParamDraft = {
    id: '1f665de7-1935-4dfe-8718-4fe78a3e6402',
    name: 'Комната',
    perimeter: '20',
    height: '3',
    floorArea: '25',
    ceilingArea: '25',
    ceilingSlopes: '3',
    doorsCount: '2',
    wallSegments: '4',
    windows: [
        { height: '1.5', width: '1.2' },
        { height: '', width: '' },
        { height: 'bad', width: '2' },
    ],
    portals: [
        { height: '2', width: '1' },
        { height: '', width: '' },
        { height: '', width: '' },
    ],
};

describe('room params calculations', () => {
    it('converts invalid values to zero', () => {
        expect(toSafeNumber('abc')).toBe(0);
        expect(toSafeNumber('')).toBe(0);
        expect(toSafeNumber(Infinity)).toBe(0);
    });

    it('calculates walls area and clamps negatives', () => {
        expect(calcWallsArea(baseRow)).toBeCloseTo(56.2, 4);

        const negativeRow = { ...baseRow, perimeter: '1', height: '1', windows: [{ height: '10', width: '10' }, { height: '', width: '' }, { height: '', width: '' }] };
        expect(calcWallsArea(negativeRow)).toBe(0);
    });

    it('calculates slopes using only windows and wall segments', () => {
        expect(calcSlopes(baseRow)).toBeCloseTo(10.2, 4);
    });

    it('calculates totals safely', () => {
        const totals = calculateTotals([baseRow, { ...baseRow, id: '7b25a3f7-e8e3-4f2f-b461-b2c2840618df', floorArea: 'bad', doorsCount: '1' }]);
        expect(totals.floorArea).toBe(25);
        expect(totals.wallsArea).toBeCloseTo(112.4, 4);
        expect(totals.slopes).toBeCloseTo(20.4, 4);
        expect(totals.ceilingArea).toBe(50);
        expect(totals.doors).toBe(3);
    });
});
