import { db } from '@/lib/data/db/drizzle';
import { notifications } from '@/lib/data/db/schema';
import { and, desc, eq, sql } from 'drizzle-orm';

export class NotificationsApiService {
  static async listForUser(userId: number, limit = 50) {
    return db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(limit);
  }

  static async countUnreadForUser(userId: number) {
    const [row] = await db
      .select({ count: sql<number>`count(*)` })
      .from(notifications)
      .where(and(eq(notifications.userId, userId), eq(notifications.read, false)));

    return Number(row?.count ?? 0);
  }
}
