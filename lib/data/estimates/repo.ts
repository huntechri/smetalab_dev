import { db } from '../db/drizzle';
import { estimates, type NewEstimate } from '../db/schema';
import { eq, and, desc, isNull } from 'drizzle-orm';
import { withActiveTenant } from '../db/queries';

export async function createEstimate(data: NewEstimate) {
    const result = await db.insert(estimates).values(data).returning();
    return result[0];
}

export async function getEstimatesByProjectId(projectId: string, teamId: number) {
    return await db
        .select({
            id: estimates.id,
            projectId: estimates.projectId,
            name: estimates.name,
            slug: estimates.slug,
            status: estimates.status,
            total: estimates.total,
            createdAt: estimates.createdAt,
            updatedAt: estimates.updatedAt,
        })
        .from(estimates)
        .where(
            and(
                eq(estimates.projectId, projectId),
                isNull(estimates.deletedAt),
                withActiveTenant(estimates, teamId)
            )
        )
        .orderBy(desc(estimates.updatedAt));
}

export async function getEstimateById(estimateId: string, teamId: number) {
    const result = await db
        .select()
        .from(estimates)
        .where(
            and(
                eq(estimates.id, estimateId),
                isNull(estimates.deletedAt),
                withActiveTenant(estimates, teamId)
            )
        )
        .limit(1);
    return result[0] || null;
}

export async function getEstimateBySlug(slug: string, projectId: string, teamId: number) {
    const result = await db
        .select()
        .from(estimates)
        .where(
            and(
                eq(estimates.slug, slug),
                eq(estimates.projectId, projectId),
                isNull(estimates.deletedAt),
                withActiveTenant(estimates, teamId)
            )
        )
        .limit(1);
    return result[0] || null;
}
