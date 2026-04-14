import { and, eq, sql } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/lib/data/db/drizzle';
import { estimates } from '@/lib/data/db/schema';
import { withActiveTenant } from '@/lib/data/db/queries';
import { Result, error, success } from '@/lib/utils/result';
import { ESTIMATE_COEF_MAX, ESTIMATE_COEF_MIN } from '@/lib/utils/estimate-coefficient';

const estimateCoefficientSchema = z.object({
    coefPercent: z.number().min(ESTIMATE_COEF_MIN).max(ESTIMATE_COEF_MAX),
});

export class EstimateCoefficientService {
    static async update(teamId: number, estimateId: string, rawPayload: unknown): Promise<Result<{ coefPercent: number }>> {
        const parsed = estimateCoefficientSchema.safeParse(rawPayload);
        if (!parsed.success) {
            return error(`Ошибка валидации: ${parsed.error.message}`, 'VALIDATION_ERROR');
        }

        try {
            const [updated] = await db
                .update(estimates)
                .set({
                    coefPercent: parsed.data.coefPercent,
                    executionSyncVersion: sql`${estimates.executionSyncVersion} + 1`,
                    updatedAt: new Date(),
                })
                .where(and(eq(estimates.id, estimateId), withActiveTenant(estimates, teamId)))
                .returning({ coefPercent: estimates.coefPercent });

            if (!updated) {
                return error('Смета не найдена', 'NOT_FOUND');
            }

            return success({ coefPercent: updated.coefPercent ?? 0 });
        } catch (e) {
            console.error('EstimateCoefficientService.update error:', e);
            return error('Ошибка при сохранении коэффициента сметы');
        }
    }

    static async reset(teamId: number, estimateId: string): Promise<Result<{ coefPercent: number }>> {
        return this.update(teamId, estimateId, { coefPercent: 0 });
    }
}
