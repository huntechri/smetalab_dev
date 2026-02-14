import { db } from '../db/drizzle';
import { projects, counterparties, type NewProject } from '../db/schema';
import { eq, and, desc, isNull } from 'drizzle-orm';
import { withActiveTenant } from '../db/queries';

export async function createProject(data: NewProject) {
    const result = await db.insert(projects).values(data).returning();
    return result[0];
}



export async function getProjects(teamId: number) {
    if (!process.env.DATABASE_URL) {
        console.warn('⚠️ getProjects: DATABASE_URL not set, returning empty array (build mode)');
        return [];
    }

    return await db
        .select({
            id: projects.id,
            name: projects.name,
            slug: projects.slug,
            tenantId: projects.tenantId,
            counterpartyId: projects.counterpartyId,
            customerName: projects.customerName,
            contractAmount: projects.contractAmount,
            startDate: projects.startDate,
            endDate: projects.endDate,
            progress: projects.progress,
            status: projects.status,
            createdAt: projects.createdAt,
            updatedAt: projects.updatedAt,
            counterpartyName: counterparties.name,
        })
        .from(projects)
        .leftJoin(counterparties, eq(projects.counterpartyId, counterparties.id))
        .where(
            and(
                isNull(projects.deletedAt),
                withActiveTenant(projects, teamId)
            )
        )
        .orderBy(desc(projects.updatedAt));
}

export async function getProjectById(id: string, teamId: number) {
    const result = await db
        .select()
        .from(projects)
        .where(
            and(
                eq(projects.id, id),
                isNull(projects.deletedAt),
                withActiveTenant(projects, teamId)
            )
        )
        .limit(1);
    return result[0] || null;
}

export async function getProjectBySlug(slug: string, teamId: number) {
    const result = await db
        .select()
        .from(projects)
        .where(
            and(
                eq(projects.slug, slug),
                isNull(projects.deletedAt),
                withActiveTenant(projects, teamId)
            )
        )
        .limit(1);
    return result[0] || null;
}

export async function deleteProject(id: string, teamId: number) {
    const result = await db
        .update(projects)
        .set({ deletedAt: new Date() })
        .where(
            and(
                eq(projects.id, id),
                withActiveTenant(projects, teamId)
            )
        )
        .returning();
    return result[0];
}
