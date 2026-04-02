import { and, eq, isNull, sql } from 'drizzle-orm';
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

                if (toUpdate.length > 0) {
                    const now = new Date();
                    const updateMatchCondition = sql.join(
                        toUpdate.map(({ current }) => sql`(${estimateRoomParams.id} = ${current.id} AND ${estimateRoomParams.updatedAt} = ${current.updatedAt})`),
                        sql` OR `,
                    );
                    const orderCase = sql.join(toUpdate.map(({ incoming, current }) => sql`WHEN ${estimateRoomParams.id} = ${current.id} THEN ${incoming.order}`), sql` `);
                    const nameCase = sql.join(toUpdate.map(({ incoming, current }) => sql`WHEN ${estimateRoomParams.id} = ${current.id} THEN ${incoming.name}`), sql` `);
                    const perimeterCase = sql.join(toUpdate.map(({ incoming, current }) => sql`WHEN ${estimateRoomParams.id} = ${current.id} THEN ${incoming.perimeter}`), sql` `);
                    const heightCase = sql.join(toUpdate.map(({ incoming, current }) => sql`WHEN ${estimateRoomParams.id} = ${current.id} THEN ${incoming.height}`), sql` `);
                    const floorAreaCase = sql.join(toUpdate.map(({ incoming, current }) => sql`WHEN ${estimateRoomParams.id} = ${current.id} THEN ${incoming.floorArea}`), sql` `);
                    const ceilingAreaCase = sql.join(toUpdate.map(({ incoming, current }) => sql`WHEN ${estimateRoomParams.id} = ${current.id} THEN ${incoming.ceilingArea}`), sql` `);
                    const ceilingSlopesCase = sql.join(toUpdate.map(({ incoming, current }) => sql`WHEN ${estimateRoomParams.id} = ${current.id} THEN ${incoming.ceilingSlopes}`), sql` `);
                    const doorsCountCase = sql.join(toUpdate.map(({ incoming, current }) => sql`WHEN ${estimateRoomParams.id} = ${current.id} THEN ${incoming.doorsCount}`), sql` `);
                    const wallSegmentsCase = sql.join(toUpdate.map(({ incoming, current }) => sql`WHEN ${estimateRoomParams.id} = ${current.id} THEN ${incoming.wallSegments}`), sql` `);
                    const windowsCase = sql.join(toUpdate.map(({ incoming, current }) => sql`WHEN ${estimateRoomParams.id} = ${current.id} THEN ${incoming.windows}`), sql` `);
                    const portalsCase = sql.join(toUpdate.map(({ incoming, current }) => sql`WHEN ${estimateRoomParams.id} = ${current.id} THEN ${incoming.portals}`), sql` `);

                    const updatedRows = await tx.execute<{ id: string }>(sql`
                        UPDATE ${estimateRoomParams}
                        SET
                            ${estimateRoomParams.order} = CASE ${estimateRoomParams.id} ${orderCase} ELSE ${estimateRoomParams.order} END,
                            ${estimateRoomParams.name} = CASE ${estimateRoomParams.id} ${nameCase} ELSE ${estimateRoomParams.name} END,
                            ${estimateRoomParams.perimeter} = CASE ${estimateRoomParams.id} ${perimeterCase} ELSE ${estimateRoomParams.perimeter} END,
                            ${estimateRoomParams.height} = CASE ${estimateRoomParams.id} ${heightCase} ELSE ${estimateRoomParams.height} END,
                            ${estimateRoomParams.floorArea} = CASE ${estimateRoomParams.id} ${floorAreaCase} ELSE ${estimateRoomParams.floorArea} END,
                            ${estimateRoomParams.ceilingArea} = CASE ${estimateRoomParams.id} ${ceilingAreaCase} ELSE ${estimateRoomParams.ceilingArea} END,
                            ${estimateRoomParams.ceilingSlopes} = CASE ${estimateRoomParams.id} ${ceilingSlopesCase} ELSE ${estimateRoomParams.ceilingSlopes} END,
                            ${estimateRoomParams.doorsCount} = CASE ${estimateRoomParams.id} ${doorsCountCase} ELSE ${estimateRoomParams.doorsCount} END,
                            ${estimateRoomParams.wallSegments} = CASE ${estimateRoomParams.id} ${wallSegmentsCase} ELSE ${estimateRoomParams.wallSegments} END,
                            ${estimateRoomParams.windows} = CASE ${estimateRoomParams.id} ${windowsCase} ELSE ${estimateRoomParams.windows} END,
                            ${estimateRoomParams.portals} = CASE ${estimateRoomParams.id} ${portalsCase} ELSE ${estimateRoomParams.portals} END,
                            ${estimateRoomParams.updatedAt} = ${now}
                        WHERE
                            ${estimateRoomParams.estimateId} = ${estimateId}
                            AND ${withActiveTenant(estimateRoomParams, teamId)}
                            AND ${estimateRoomParams.deletedAt} IS NULL
                            AND (${updateMatchCondition})
                        RETURNING ${estimateRoomParams.id} AS id
                    `);

                    if (updatedRows.length !== toUpdate.length) {
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

                if (toDelete.length > 0) {
                    const now = new Date();
                    const deleteMatchCondition = sql.join(
                        toDelete.map((row) => sql`(${estimateRoomParams.id} = ${row.id} AND ${estimateRoomParams.updatedAt} = ${row.updatedAt})`),
                        sql` OR `,
                    );
                    const deletedRows = await tx.execute<{ id: string }>(sql`
                        UPDATE ${estimateRoomParams}
                        SET ${estimateRoomParams.deletedAt} = ${now}, ${estimateRoomParams.updatedAt} = ${now}
                        WHERE
                            ${estimateRoomParams.estimateId} = ${estimateId}
                            AND ${withActiveTenant(estimateRoomParams, teamId)}
                            AND ${estimateRoomParams.deletedAt} IS NULL
                            AND (${deleteMatchCondition})
                        RETURNING ${estimateRoomParams.id} AS id
                    `);

                    if (deletedRows.length !== toDelete.length) {
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
