import { db } from '@/lib/data/db/drizzle';
import { notifications } from '@/lib/data/db/schema';
import { getUser } from '@/lib/data/db/queries';
import { eq, desc } from 'drizzle-orm';

export async function GET() {
  const user = await getUser();

  if (!user) {
    return new Response('Unauthorized', { status: 401 });
  }

  const userNotifications = await db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, user.id))
    .orderBy(desc(notifications.createdAt))
    .limit(50);

  return Response.json(userNotifications);
}
