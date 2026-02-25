import { beforeEach, describe, expect, it, vi } from 'vitest';

const dbMock = vi.hoisted(() => ({
    query: {
        estimates: {
            findFirst: vi.fn(),
        },
    },
    transaction: vi.fn(),
}));

vi.mock('@/lib/data/db/drizzle', () => ({
    db: dbMock,
}));

import { EstimateRoomParamsService } from '@/lib/services/estimate-room-params.service';

type MockRoomRow = {
    id: string;
    order: number;
    name: string;
    perimeter: number;
    height: number;
    floorArea: number;
    ceilingArea: number;
    ceilingSlopes: number;
    doorsCount: number;
    wallSegments: number;
    windows: [{ height: number; width: number }, { height: number; width: number }, { height: number; width: number }];
    portals: [{ height: number; width: number }, { height: number; width: number }, { height: number; width: number }];
    updatedAt: Date;
};

const openings = [{ height: 1, width: 1 }, { height: 1, width: 1 }, { height: 1, width: 1 }] as const;

const room = (id: string, order: number, updatedAt = new Date('2024-01-01T00:00:00.000Z')): MockRoomRow => ({
    id,
    order,
    name: `Комната ${order}`,
    perimeter: 10,
    height: 2.8,
    floorArea: 20,
    ceilingArea: 20,
    ceilingSlopes: 0,
    doorsCount: 1,
    wallSegments: 4,
    windows: [...openings],
    portals: [...openings],
    updatedAt,
});

const payloadFromRoom = (row: MockRoomRow) => ({
    id: row.id,
    order: row.order,
    name: row.name,
    perimeter: row.perimeter,
    height: row.height,
    floorArea: row.floorArea,
    ceilingArea: row.ceilingArea,
    ceilingSlopes: row.ceilingSlopes,
    doorsCount: row.doorsCount,
    wallSegments: row.wallSegments,
    windows: row.windows,
    portals: row.portals,
});

const createTx = (currentRows: MockRoomRow[], returningQueue: Array<Array<{ id: string }>> = []) => {
    const whereMock = vi.fn();
    const setMock = vi.fn(() => ({ where: whereMock }));
    const updateMock = vi.fn(() => ({ set: setMock }));

    whereMock.mockImplementation(() => ({
        returning: vi.fn().mockResolvedValue(returningQueue.shift() ?? [{ id: 'ok' }]),
    }));

    const tx = {
        select: vi.fn(() => ({
            from: vi.fn(() => ({
                where: vi.fn().mockResolvedValue(currentRows),
            })),
        })),
        update: updateMock,
        insert: vi.fn(() => ({
            values: vi.fn().mockResolvedValue(undefined),
        })),
    };

    return { tx, updateMock, insertMock: tx.insert };
};

describe('EstimateRoomParamsService.save diff updates', () => {
    beforeEach(() => {
        dbMock.query.estimates.findFirst.mockReset();
        dbMock.transaction.mockReset();
        dbMock.query.estimates.findFirst.mockResolvedValue({ id: 'est-1' });
    });

    it('updates only changed row when one field changed', async () => {
        const existing = room('11111111-1111-4111-8111-111111111111', 0);
        const { tx, updateMock, insertMock } = createTx([existing]);

        dbMock.transaction.mockImplementation(async (callback: (trx: typeof tx) => Promise<unknown>) => callback(tx));

        const payload = [{ ...payloadFromRoom(existing), name: 'Обновлённая комната' }];
        const result = await EstimateRoomParamsService.save(5, 'est-1', payload);

        expect(result.success).toBe(true);
        expect(updateMock).toHaveBeenCalledTimes(1);
        expect(insertMock).not.toHaveBeenCalled();
    });

    it('soft-deletes removed room and keeps unchanged rows intact', async () => {
        const kept = room('11111111-1111-4111-8111-111111111111', 0);
        const removed = room('22222222-2222-4222-8222-222222222222', 1);
        const { tx, updateMock, insertMock } = createTx([kept, removed]);

        dbMock.transaction.mockImplementation(async (callback: (trx: typeof tx) => Promise<unknown>) => callback(tx));

        const payload = [payloadFromRoom(kept)];
        const result = await EstimateRoomParamsService.save(5, 'est-1', payload);

        expect(result.success).toBe(true);
        expect(updateMock).toHaveBeenCalledTimes(1);
        expect(insertMock).not.toHaveBeenCalled();
    });

    it('updates all rows on mass reorder without inserts or deletes', async () => {
        const r1 = room('11111111-1111-4111-8111-111111111111', 0);
        const r2 = room('22222222-2222-4222-8222-222222222222', 1);
        const r3 = room('33333333-3333-4333-8333-333333333333', 2);
        const { tx, updateMock, insertMock } = createTx([r1, r2, r3]);

        dbMock.transaction.mockImplementation(async (callback: (trx: typeof tx) => Promise<unknown>) => callback(tx));

        const payload = [
            { ...payloadFromRoom(r1), order: 2 },
            { ...payloadFromRoom(r2), order: 0 },
            { ...payloadFromRoom(r3), order: 1 },
        ];

        const result = await EstimateRoomParamsService.save(5, 'est-1', payload);

        expect(result.success).toBe(true);
        expect(updateMock).toHaveBeenCalledTimes(3);
        expect(insertMock).not.toHaveBeenCalled();
    });

    it('returns conflict on optimistic lock mismatch', async () => {
        const existing = room('11111111-1111-4111-8111-111111111111', 0);
        const { tx } = createTx([existing], [[]]);

        dbMock.transaction.mockImplementation(async (callback: (trx: typeof tx) => Promise<unknown>) => callback(tx));

        const payload = [{ ...payloadFromRoom(existing), order: 10 }];
        const result = await EstimateRoomParamsService.save(5, 'est-1', payload);

        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.code).toBe('CONFLICT');
        }
    });
});
