import { db } from '@/lib/data/db/drizzle';
import { impersonationSessions } from '@/lib/data/db/schema';
import { eq, sql } from 'drizzle-orm';

export async function createImpersonationSession(superadminUserId: number, targetTeamId: number, sessionToken: string, ipAddress: string) {
  await db.insert(impersonationSessions).values({
    superadminUserId,
    targetTeamId,
    sessionToken,
    ipAddress,
  });
}

export async function endImpersonationSession(sessionToken: string) {
  await db.update(impersonationSessions)
    .set({ endedAt: sql`CURRENT_TIMESTAMP` })
    .where(eq(impersonationSessions.sessionToken, sessionToken));
}
