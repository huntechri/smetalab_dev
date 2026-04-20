import { getUser } from '@/lib/data/db/queries';
import { NotificationsApiService } from '@/lib/services/notifications-api.service';

export async function GET() {
  const user = await getUser();

  if (!user) {
    return new Response('Unauthorized', { status: 401 });
  }

  const userNotifications = await NotificationsApiService.listForUser(user.id);
  return Response.json(userNotifications);
}
