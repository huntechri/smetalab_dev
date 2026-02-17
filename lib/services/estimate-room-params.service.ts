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
                await tx
                    .update(estimateRoomParams)
                    .set({ deletedAt: new Date(), updatedAt: new Date() })
                    .where(and(eq(estimateRoomParams.estimateId, estimateId), withActiveTenant(estimateRoomParams, teamId), isNull(estimateRoomParams.deletedAt)));

                if (payload.length === 0) {
                    return;
                }

                await tx.insert(estimateRoomParams).values(payload.map((row: RoomParamSaveInput) => ({
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
            });

            return success({ count: payload.length });
        } catch (e) {
            console.error('EstimateRoomParamsService.save error:', e);
            return error('Ошибка при сохранении параметров помещений');
        }
    }
}
