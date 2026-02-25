import { and, eq, isNull } from 'drizzle-orm';
import { db } from '@/lib/data/db/drizzle';
import { estimateRoomParams, estimates } from '@/lib/data/db/schema';
import { withActiveTenant } from '@/lib/data/db/queries';
import { Result, error, success } from '@/lib/utils/result';
import { roomParamSaveArraySchema, RoomParamSaveInput } from '@/features/projects/estimates/schemas/room-params.schema';
import { EstimateRoomParam } from '@/features/projects/estimates/types/room-params.dto';

const ensureEstimateAccess = async (teamId: number, estimateId: string) => db.query.estimates.findFirst({
    where: and(eq(estimates.id, estimateId), withActiveTenant(estimates, teamId)),
});

class ConcurrencyError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ConcurrencyError';
    }
}

type RoomParamSnapshot = Pick<EstimateRoomParam, 'id' | 'order' | 'name' | 'perimeter' | 'height' | 'floorArea' | 'ceilingArea' | 'ceilingSlopes' | 'doorsCount' | 'wallSegments' | 'windows' | 'portals'> & {
    updatedAt: Date;
};

const hasRoomParamChanges = (incoming: RoomParamSaveInput, current: RoomParamSnapshot): boolean => {
    if (
        incoming.order !== current.order
        || incoming.name !== current.name
        || incoming.perimeter !== current.perimeter
        || incoming.height !== current.height
        || incoming.floorArea !== current.floorArea
        || incoming.ceilingArea !== current.ceilingArea
        || incoming.ceilingSlopes !== current.ceilingSlopes
        || incoming.doorsCount !== current.doorsCount
        || incoming.wallSegments !== current.wallSegments
    ) {
        return true;
    }

    return JSON.stringify(incoming.windows) !== JSON.stringify(current.windows)
        || JSON.stringify(incoming.portals) !== JSON.stringify(current.portals);
};

export class EstimateRoomParamsService {
    static async list(teamId: number, estimateId: string): Promise<Result<EstimateRoomParam[]>> {
        try {
            const estimate = await ensureEstimateAccess(teamId, estimateId);
            if (!estimate) {
                return error('Смета не найдена', 'NOT_FOUND');
            }

            const rows = await db
                .select({
                    id: estimateRoomParams.id,
                    estimateId: estimateRoomParams.estimateId,
                    order: estimateRoomParams.order,
                    name: estimateRoomParams.name,
                    perimeter: estimateRoomParams.perimeter,
                    height: estimateRoomParams.height,
                    floorArea: estimateRoomParams.floorArea,
                    ceilingArea: estimateRoomParams.ceilingArea,
                    ceilingSlopes: estimateRoomParams.ceilingSlopes,
                    doorsCount: estimateRoomParams.doorsCount,
                    wallSegments: estimateRoomParams.wallSegments,
                    windows: estimateRoomParams.windows,
                    portals: estimateRoomParams.portals,
                })
                .from(estimateRoomParams)
                .where(and(eq(estimateRoomParams.estimateId, estimateId), withActiveTenant(estimateRoomParams, teamId)))
                .orderBy(estimateRoomParams.order);

            return success(rows as EstimateRoomParam[]);
        } catch (e) {
            console.error('EstimateRoomParamsService.list error:', e);
            return error('Ошибка при загрузке параметров помещений');
        }
    }

    static async save(teamId: number, estimateId: string, rawPayload: unknown): Promise<Result<{ count: number }>> {
        const parsed = roomParamSaveArraySchema.safeParse(rawPayload);
        if (!parsed.success) {
            return error(`Ошибка валидации: ${parsed.error.message}`, 'VALIDATION_ERROR');
        }

        try {
            const estimate = await ensureEstimateAccess(teamId, estimateId);
            if (!estimate) {
                return error('Смета не найдена', 'NOT_FOUND');
            }

            const payload = parsed.data;

            await db.transaction(async (tx) => {
                const currentRows = await tx
                    .select({
                        id: estimateRoomParams.id,
                        order: estimateRoomParams.order,
                        name: estimateRoomParams.name,
                        perimeter: estimateRoomParams.perimeter,
                        height: estimateRoomParams.height,
                        floorArea: estimateRoomParams.floorArea,
                        ceilingArea: estimateRoomParams.ceilingArea,
                        ceilingSlopes: estimateRoomParams.ceilingSlopes,
                        doorsCount: estimateRoomParams.doorsCount,
                        wallSegments: estimateRoomParams.wallSegments,
                        windows: estimateRoomParams.windows,
                        portals: estimateRoomParams.portals,
                        updatedAt: estimateRoomParams.updatedAt,
                    })
                    .from(estimateRoomParams)
                    .where(and(eq(estimateRoomParams.estimateId, estimateId), withActiveTenant(estimateRoomParams, teamId), isNull(estimateRoomParams.deletedAt)));

                const byId = new Map(currentRows.map((row) => [row.id, row]));
                const incomingIds = new Set<string>();
                const toInsert: RoomParamSaveInput[] = [];
                const toUpdate: Array<{ incoming: RoomParamSaveInput; current: RoomParamSnapshot }> = [];

                for (const row of payload) {
                    if (!row.id) {
                        toInsert.push(row);
                        continue;
                    }

                    incomingIds.add(row.id);
                    const current = byId.get(row.id);

                    if (!current) {
                        throw new ConcurrencyError('Одна или несколько комнат уже были изменены другим пользователем');
                    }

                    if (hasRoomParamChanges(row, current)) {
                        toUpdate.push({ incoming: row, current });
                    }
                }

                const toDelete = currentRows.filter((row) => !incomingIds.has(row.id));

                for (const { incoming, current } of toUpdate) {
                    const updatedRows = await tx
                        .update(estimateRoomParams)
                        .set({
                            order: incoming.order,
                            name: incoming.name,
                            perimeter: incoming.perimeter,
                            height: incoming.height,
                            floorArea: incoming.floorArea,
                            ceilingArea: incoming.ceilingArea,
                            ceilingSlopes: incoming.ceilingSlopes,
                            doorsCount: incoming.doorsCount,
                            wallSegments: incoming.wallSegments,
                            windows: incoming.windows,
                            portals: incoming.portals,
                            updatedAt: new Date(),
                        })
                        .where(and(
                            eq(estimateRoomParams.id, current.id),
                            eq(estimateRoomParams.updatedAt, current.updatedAt),
                            eq(estimateRoomParams.estimateId, estimateId),
                            withActiveTenant(estimateRoomParams, teamId),
                            isNull(estimateRoomParams.deletedAt),
                        ))
                        .returning({ id: estimateRoomParams.id });

                    if (updatedRows.length !== 1) {
                        throw new ConcurrencyError('Комната была изменена другим пользователем');
                    }
                }

                if (toInsert.length > 0) {
                    await tx.insert(estimateRoomParams).values(toInsert.map((row: RoomParamSaveInput) => ({
                        tenantId: teamId,
                        estimateId,
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
                    })));
                }

                for (const row of toDelete) {
                    const deletedRows = await tx
                        .update(estimateRoomParams)
                        .set({ deletedAt: new Date(), updatedAt: new Date() })
                        .where(and(
                            eq(estimateRoomParams.id, row.id),
                            eq(estimateRoomParams.updatedAt, row.updatedAt),
                            eq(estimateRoomParams.estimateId, estimateId),
                            withActiveTenant(estimateRoomParams, teamId),
                            isNull(estimateRoomParams.deletedAt),
                        ))
                        .returning({ id: estimateRoomParams.id });

                    if (deletedRows.length !== 1) {
                        throw new ConcurrencyError('Комната была удалена или изменена другим пользователем');
                    }
                }
            });

            return success({ count: payload.length });
        } catch (e) {
            if (e instanceof ConcurrencyError) {
                return error(e.message, 'CONFLICT');
            }

            console.error('EstimateRoomParamsService.save error:', e);
            return error('Ошибка при сохранении параметров помещений');
        }
    }
}
