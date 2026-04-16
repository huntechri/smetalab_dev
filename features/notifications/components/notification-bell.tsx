'use client';

import { Bell } from 'lucide-react';
import { Badge } from '@/shared/ui/badge';
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

export function NotificationBell() {
    const [mounted, setMounted] = useState(false);
    const { data: notifications, isLoading } = useSWR<NotificationPayload[]>('/api/notifications', fetcher);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const unreadCount = notifications?.filter((n) => !n.read).length || 0;

    if (!mounted) {
        return (
            <button type="button" className="relative inline-flex size-8 items-center justify-center rounded-full border-none bg-transparent p-0" disabled>
                <Bell className="h-5 w-5" />
                <span className="sr-only">Уведомления</span>
            </button>
        );
    }

    const handleMarkAsRead = async (id: number) => {
        // Optimistic update
        mutate('/api/notifications', (currentNotifications: NotificationPayload[] | undefined) => {
            if (!currentNotifications) return [];
            return currentNotifications.map(n => n.id === id ? { ...n, read: true } : n);
        }, false);

        try {
            await fetch(`/api/notifications/${id}/read`, { method: 'POST' });
            mutate('/api/notifications'); // Revalidate to ensure data consistency
        } catch (error) {
            console.error('Failed to mark as read', error);
            mutate('/api/notifications'); // Revert on error
        }
    };

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <button
                    type="button"
                    className="relative inline-flex size-8 items-center justify-center rounded-full border-none bg-transparent p-0 outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                    aria-label={unreadCount > 0 ? `Уведомления: ${unreadCount} непрочитанных` : "Уведомления"}
                >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <Badge
                            variant="destructive"
                            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                        >
                            {unreadCount}
                        </Badge>
                    )}
                </button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
                <div className="flex items-center justify-between border-b pb-2 mb-2">
                    <h4 className="font-semibold">Уведомления</h4>
                    {unreadCount > 0 && (
                        <Badge variant="secondary" className="border-none bg-blue-500/12 text-[10px] uppercase text-blue-700">
                            {unreadCount} новых
                        </Badge>
                    )}
                </div>
                <NotificationsList
                    notifications={notifications}
                    isLoading={isLoading}
                    onMarkAsRead={handleMarkAsRead}
                    emptyTitle="Нет новых уведомлений"
                    emptyDescription="Вы прочитали всё важное"
                />
                <div className="border-t pt-2 mt-2">
                    <button type="button" className="w-full text-sm pointer-events-none border-none bg-transparent p-0 text-center" disabled>
                        Показать все уведомления
                    </button>
                </div>
            </PopoverContent>
        </Popover>
    );
}
