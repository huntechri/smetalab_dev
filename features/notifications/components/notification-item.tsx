import { Badge } from '@repo/ui';
import { Button } from '@repo/ui';
import { cn } from '@/lib/utils';
import { NotificationPayload } from '@/features/notifications/components/types';

interface NotificationItemProps {
  notification: NotificationPayload;
  onMarkAsRead?: (id: number) => void;
}

function formatRelativeTime(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  const intervals: Array<[number, string]> = [
    [31536000, 'г. назад'],
    [2592000, 'мес. назад'],
    [86400, 'дн. назад'],
    [3600, 'ч. назад'],
    [60, 'мин. назад'],
  ];

  for (const [intervalSeconds, label] of intervals) {
    const interval = seconds / intervalSeconds;
    if (interval > 1) {
      return `${Math.floor(interval)} ${label}`;
    }
  }

  return 'менее минуты назад';
}

export function NotificationItem({ notification, onMarkAsRead }: NotificationItemProps) {
  const timeLabel = formatRelativeTime(notification.createdAt);
  const baseClasses = 'w-full text-left p-3 rounded-lg transition-colors flex items-start gap-3';

  if (notification.read) {
    return (
      <div
        role="article"
        className={cn(baseClasses, 'cursor-default opacity-75 bg-muted/20')}
        aria-label={`Прочитано: ${notification.title}`}
      >
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium">{notification.title}</p>
            <Badge variant="secondary" className="border-none bg-slate-500/12 text-[10px] uppercase text-slate-700">
              Прочитано
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {notification.description}
          </p>
          <p className="text-xs text-muted-foreground mt-2">{timeLabel}</p>
        </div>
      </div>
    );
  }

  return (
    <Button variant="ghost"
      type="button"
      onClick={() => onMarkAsRead?.(notification.id)}
      aria-label={`Пометить как прочитанное: ${notification.title}`}
      title="Нажмите, чтобы отметить как прочитанное"
    >
      <div className="mt-1 h-2 w-2 rounded-full bg-brand shrink-0" aria-hidden="true" />
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold">{notification.title}</p>
          <Badge variant="secondary" className="border-none bg-blue-500/12 text-[10px] uppercase text-blue-700">
            Новое
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {notification.description}
        </p>
        <p className="text-xs text-muted-foreground mt-2">{timeLabel}</p>
      </div>
    </Button>
  );
}
