'use client';

import { Bell } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { StatusBadge } from '@/shared/ui/status-badge';
import { primitiveVisualTypographyClassNames } from '@/shared/ui/primitive-surface';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/shared/ui/popover';
import useSWR, { mutate } from 'swr';
import { useState, useEffect } from 'react';
import { NotificationsList } from '@/features/notifications/components/notifications-list';
import { NotificationPayload } from '@/features/notifications/components/types';

const fetcher = (url: string) => fetch(url).then((res) => res.json());
const NOTIFICATIONS_LIST_KEY = '/api/notifications';
const NOTIFICATIONS_UNREAD_COUNT_KEY = '/api/notifications/unread-count';

export const getNotificationsSWRKey = (isOpen: boolean): string | null => (isOpen ? NOTIFICATIONS_LIST_KEY : null);

export function NotificationBell() {
    const [mounted, setMounted] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const notificationsKey = getNotificationsSWRKey(isOpen);
    const { data: notifications, isLoading } = useSWR<NotificationPayload[]>(notificationsKey, fetcher);
    const { data: unreadCountPayload } = useSWR<{ unreadCount: number }>(NOTIFICATIONS_UNREAD_COUNT_KEY, fetcher);

    useEffect(() => {
        setMounted(true);
    }, []);

    const unreadCount = notifications
        ? notifications.filter((n) => !n.read).length
        : unreadCountPayload?.unreadCount ?? 0;

    if (!mounted) {
        return (
            <Button type="button" variant="ghost" size="icon-xs" disabled>
                <Bell />
                <span className="sr-only">Уведомления</span>
            </Button>
        );
    }

    const handleMarkAsRead = async (id: number) => {
        // Optimistic update
        mutate(NOTIFICATIONS_LIST_KEY, (currentNotifications: NotificationPayload[] | undefined) => {
            if (!currentNotifications) return [];
            return currentNotifications.map(n => n.id === id ? { ...n, read: true } : n);
        }, false);
        mutate(
            NOTIFICATIONS_UNREAD_COUNT_KEY,
            (currentCount: { unreadCount: number } | undefined) => ({
                unreadCount: Math.max((currentCount?.unreadCount ?? unreadCount) - 1, 0),
            }),
            false,
        );

        try {
            const response = await fetch(`/api/notifications/${id}/read`, { method: 'POST' });
            if (!response.ok) {
                throw new Error('Failed to mark notification as read');
            }
            mutate(NOTIFICATIONS_LIST_KEY); // Revalidate to ensure data consistency
            mutate(NOTIFICATIONS_UNREAD_COUNT_KEY);
        } catch (error) {
            console.error('Failed to mark as read', error);
            mutate(NOTIFICATIONS_LIST_KEY); // Revert on error
            mutate(NOTIFICATIONS_UNREAD_COUNT_KEY);
        }
    };

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost"
                    size="icon-xs"
                    type="button"
                    aria-label={unreadCount > 0 ? `Уведомления: ${unreadCount} непрочитанных` : "Уведомления"}
                >
                    <Bell />
                    {unreadCount > 0 && (
                        <Badge
                            variant="destructive"
                            size="count"
                            className="absolute -right-1 -top-1"
                        >
                            {unreadCount}
                        </Badge>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
                <div className="flex items-center justify-between gap-2 border-b border-border/30 pb-2 mb-2">
                    <h4 className={`${primitiveVisualTypographyClassNames.dialogTitle} font-semibold`}>Уведомления</h4>
                    {unreadCount > 0 && (
                        <StatusBadge tone="info">
                            {unreadCount} новых
                        </StatusBadge>
                    )}
                </div>
                <NotificationsList
                    notifications={notifications}
                    isLoading={isLoading}
                    onMarkAsRead={handleMarkAsRead}
                    emptyTitle="Нет новых уведомлений"
                    emptyDescription="Вы прочитали всё важное"
                />
                <div className="flex items-center justify-center border-t border-border/30 pt-2 mt-2">
                    <Button type="button" variant="ghost" size="default" disabled>
                        Показать все уведомления
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    );
}
