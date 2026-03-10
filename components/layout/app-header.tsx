'use client';

import { SidebarTrigger } from '@/shared/ui/sidebar';
import { Separator } from '@/shared/ui/separator';
import { usePageTitle } from '@/hooks/use-page-title';
import { NotificationBell } from '@/features/notifications/components/notification-bell';
import { UserMenu } from '@/components/layout/user-menu';
import { ActiveTeamIndicator } from '@/components/layout/active-team-indicator';

export function AppHeader() {
    const pageTitle = usePageTitle();

    return (
        <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-4 border-b border-border/40 bg-background/60 px-4 backdrop-blur-xl md:px-6 transition-all duration-300">
            <SidebarTrigger className="-ml-2 hover:bg-muted/80 rounded-lg transition-colors" />
            <Separator orientation="vertical" className="h-6 bg-border/40" />
            <div className="flex-1">
                <h1 className="text-sm font-bold uppercase tracking-[0.2em] text-foreground/70">{pageTitle}</h1>
            </div>
            <div className="flex items-center gap-4">
                <ActiveTeamIndicator />
                <NotificationBell />
                <div className="h-6 w-px bg-border/40 invisible sm:visible" />
                <UserMenu />
            </div>
        </header>
    );
}
