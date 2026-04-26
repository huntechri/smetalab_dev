import { BellOff } from 'lucide-react';
import { NotificationItem } from '@/features/notifications/components/notification-item';
import { NotificationPayload } from '@/features/notifications/components/types';
import { LoadingIndicator } from '@repo/ui';
import { ScrollArea } from '@/shared/ui/scroll-area';
import { cn } from '@/lib/utils';

interface NotificationsListProps {
  notifications?: NotificationPayload[];
  isLoading?: boolean;
  onMarkAsRead?: (id: number) => void;
  emptyTitle?: string;
  emptyDescription?: string;
  className?: string;
}

export function NotificationsList({
  notifications,
  isLoading = false,
  onMarkAsRead,
  emptyTitle = 'Нет новых уведомлений',
  emptyDescription = 'Вы прочитали всё важное',
  className,
}: NotificationsListProps) {
  return (
    <ScrollArea className={cn('max-h-80 pr-1', className)}>
      <div className="space-y-2">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <LoadingIndicator label="Загрузка уведомлений..." />
          </div>
        ) : !notifications || notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground text-center">
            <BellOff className="h-10 w-10 mb-3 opacity-20" />
            <p className="text-sm font-medium">{emptyTitle}</p>
            <p className="text-xs opacity-70 mt-1">{emptyDescription}</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onMarkAsRead={onMarkAsRead}
            />
          ))
        )}
      </div>
    </ScrollArea>
  );
}
