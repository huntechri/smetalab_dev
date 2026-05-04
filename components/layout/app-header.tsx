'use client';

import { useBreadcrumbs } from '@/components/providers/breadcrumb-provider';
import { AppBreadcrumbs } from '@/shared/ui/breadcrumbs';
import { SidebarTrigger } from '@/shared/ui/sidebar';
import { Separator } from '@/shared/ui/separator';
import { NotificationBell } from '@/features/notifications/components/notification-bell';
import { UserMenu } from '@/components/layout/user-menu';
import { AppHeaderShell } from '@/shared/ui/app-header';
import { ActiveTeamIndicator } from '@/components/layout/active-team-indicator';

export function AppHeader() {
    const { breadcrumbs } = useBreadcrumbs();

    return (
        <AppHeaderShell>
            <SidebarTrigger />
            <Separator orientation="vertical" className="hidden h-6 bg-border/40 sm:block" />
            <div className="flex-1 min-w-0">
                {breadcrumbs.length > 0 && (
                    <AppBreadcrumbs items={breadcrumbs} />
                )}
            </div>
            <div className="flex shrink-0 items-center gap-1.5 sm:gap-2 md:gap-4">
                <ActiveTeamIndicator />
                <NotificationBell />
                <div className="h-6 w-px bg-border/40 hidden sm:block" />
                <UserMenu />
            </div>
        </AppHeaderShell>
    );
}
