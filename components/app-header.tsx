'use client';

import { SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { usePageTitle } from '@/hooks/use-page-title';
import { NotificationBell } from '@/components/notification-bell';
import { UserMenu } from '@/components/user-menu';
import { ActiveTeamIndicator } from '@/components/active-team-indicator';

export function AppHeader() {
    const pageTitle = usePageTitle();

    return (
        <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center gap-4 border-b border-border/40 bg-background/80 px-4 backdrop-blur-md md:px-6">
            <SidebarTrigger className="-ml-2 hover:bg-muted/50 transition-colors" />
            <Separator orientation="vertical" className="h-6 bg-border/40" />
            <div className="flex-1">
                <h1 className="text-sm font-bold uppercase tracking-[0.15em] text-foreground/80">{pageTitle}</h1>
            </div>
            <div className="flex items-center gap-3">
                <ActiveTeamIndicator />
                <NotificationBell />
                <div className="h-6 w-px bg-border/40 invisible sm:visible" />
                <UserMenu />
            </div>
        </header>
    );
}
