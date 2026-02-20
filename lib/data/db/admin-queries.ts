import { db } from './drizzle';
import { teams, teamMembers, works, materials, activityLogs } from './schema';
import { and, desc, eq, sql } from 'drizzle-orm';
import { withActiveTenant } from './tenant';

export async function getAllTeams() {
    if (!process.env.DATABASE_URL) {
        console.warn('⚠️ getAllTeams: DATABASE_URL not set, returning empty array (build mode)');
        return [];
    }

    return await db
        .select({
            id: teams.id,
            name: teams.name,
            planName: teams.planName,
            subscriptionStatus: teams.subscriptionStatus,
            createdAt: teams.createdAt,
            memberCount: sql<number>`count(${teamMembers.id})`.mapWith(Number),
        })
        .from(teams)
        .leftJoin(teamMembers, sql`${teams.id} = ${teamMembers.teamId}`)
        .groupBy(teams.id)
        .orderBy(desc(teams.createdAt));
}

export async function getTeamDetails(teamId: number) {
    if (!process.env.DATABASE_URL) {
        console.warn('⚠️ getTeamDetails: DATABASE_URL not set, returning null (build mode)');
        return null;
    }

    const team = await db.query.teams.findFirst({
        where: eq(teams.id, teamId),
        with: {
            teamMembers: {
                with: {
                    user: {
                        columns: {
                            id: true,
                            name: true,
                            email: true,
                        }
                    }
                }
            }
        }
    });

    if (!team) return null;

    const [worksCount] = await db
        .select({ count: sql<number>`count(*)` })
        .from(works)
        .where(and(withActiveTenant(works, teamId), eq(works.tenantId, teamId)));

    const [materialsCount] = await db
        .select({ count: sql<number>`count(*)` })
        .from(materials)
        .where(and(withActiveTenant(materials, teamId), eq(materials.tenantId, teamId)));

    const recentActivity = await db.query.activityLogs.findMany({
        where: eq(activityLogs.teamId, teamId),
        limit: 10,
        orderBy: [desc(activityLogs.timestamp)],
        with: {
            user: {
                columns: {
                    name: true,
                    email: true,
                }
            }
        }
    });

    return {
        ...team,
        metrics: {
            worksCount: Number(worksCount?.count || 0),
            materialsCount: Number(materialsCount?.count || 0),
        },
        recentActivity,
    };
}
