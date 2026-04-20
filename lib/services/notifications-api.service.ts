import { db } from '@/lib/data/db/drizzle';
import { notifications } from '@/lib/data/db/schema';
import { desc, eq } from 'drizzle-orm';

export class NotificationsApiService {
  static async listForUser(userId: number, limit = 50) {
    return db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(limit);
  }
}
