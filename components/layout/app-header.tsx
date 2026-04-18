'use client';

import { useBreadcrumbs } from '@/components/providers/breadcrumb-provider';
import { Breadcrumb07 } from '@/components/shadcn-studio/breadcrumb/breadcrumb-07';
import { SidebarTrigger } from '@/shared/ui/sidebar';
import { Separator } from '@/shared/ui/separator';
import { NotificationBell } from '@/features/notifications/components/notification-bell';
import { UserMenu } from '@/components/layout/user-menu';
import { ActiveTeamIndicator } from '@/components/layout/active-team-indicator';

export function AppHeader() {
    const { breadcrumbs } = useBreadcrumbs();

    return (
        <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-2 border-b border-border/40 bg-background/60 px-3 backdrop-blur-xl transition-all duration-300 sm:gap-3 sm:px-4 md:gap-4 md:px-6">
            <SidebarTrigger />
            <Separator orientation="vertical" className="hidden h-6 bg-border/40 sm:block" />
            <div className="flex-1 min-w-0">
                {breadcrumbs.length > 0 && (
                    <Breadcrumb07 items={breadcrumbs} />
                )}
            </div>
            <div className="flex shrink-0 items-center gap-1.5 sm:gap-2 md:gap-4">
                <ActiveTeamIndicator />
                <NotificationBell />
                <div className="h-6 w-px bg-border/40 hidden sm:block" />
                <UserMenu />
            </div>
        </header>
    );
}
