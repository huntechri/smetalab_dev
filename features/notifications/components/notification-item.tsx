import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { StatusIndicator } from '@/shared/ui/status-badge';
import { cn } from '@/lib/utils';
import { primitiveVisualTypographyClassNames, primitiveCardShellInsetDensityClassNames } from '@/shared/ui/primitive-surface';
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
  const baseClasses = `w-full text-left ${primitiveCardShellInsetDensityClassNames.default} transition-colors flex items-start gap-3`;

  if (notification.read) {
    return (
      <div
        role="article"
        className={cn(baseClasses, 'cursor-default opacity-75 bg-muted/20')}
        aria-label={`Прочитано: ${notification.title}`}
      >
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className={primitiveVisualTypographyClassNames.itemTitle}>{notification.title}</p>
            <Badge variant="neutral" size="xs">
              Прочитано
            </Badge>
          </div>
          <p className={primitiveVisualTypographyClassNames.mutedMeta}>
            {notification.description}
          </p>
          <p className={`${primitiveVisualTypographyClassNames.mutedMeta} mt-1`}>{timeLabel}</p>
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
      <StatusIndicator tone="brand" size="sm" aria-hidden="true" />
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <p className={primitiveVisualTypographyClassNames.sectionTitle}>{notification.title}</p>
          <Badge variant="info" size="xs">
            Новое
          </Badge>
        </div>
        <p className={primitiveVisualTypographyClassNames.mutedMeta}>
          {notification.description}
        </p>
        <p className={`${primitiveVisualTypographyClassNames.mutedMeta} mt-1`}>{timeLabel}</p>
      </div>
    </Button>
  );
}
