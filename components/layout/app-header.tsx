'use client';

import * as React from 'react';
import { useBreadcrumbs } from '@/components/providers/breadcrumb-provider';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
    BreadcrumbEllipsis,
} from '@/shared/ui/breadcrumb';
import Link from 'next/link';
import { SidebarTrigger } from '@/shared/ui/sidebar';
import { Separator } from '@/shared/ui/separator';
import { usePageTitle } from '@/hooks/use-page-title';
import { NotificationBell } from '@/features/notifications/components/notification-bell';
import { UserMenu } from '@/components/layout/user-menu';
import { ActiveTeamIndicator } from '@/components/layout/active-team-indicator';

export function AppHeader() {
    const pageTitle = usePageTitle();
    const { breadcrumbs } = useBreadcrumbs();

    return (
        <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-4 border-b border-border/40 bg-background/60 px-4 backdrop-blur-xl md:px-6 transition-all duration-300">
            <SidebarTrigger className="-ml-2 hover:bg-muted/80 rounded-lg transition-colors" />
            <Separator orientation="vertical" className="h-6 bg-border/40" />
            <div className="flex-1 min-w-0">
                {breadcrumbs.length > 0 ? (
                    <>
                        <Breadcrumb className="hidden md:block">
                            <BreadcrumbList>
                                {breadcrumbs.map((item, index) => (
                                    <React.Fragment key={index}>
                                        <BreadcrumbItem>
                                            {item.href && index < breadcrumbs.length - 1 ? (
                                                <BreadcrumbLink asChild>
                                                    <Link href={item.href}>{item.label}</Link>
                                                </BreadcrumbLink>
                                            ) : (
                                                <BreadcrumbPage className="max-w-[150px] truncate">
                                                    {item.label}
                                                </BreadcrumbPage>
                                            )}
                                        </BreadcrumbItem>
                                        {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
                                    </React.Fragment>
                                ))}
                            </BreadcrumbList>
                        </Breadcrumb>
                        <Breadcrumb className="md:hidden">
                            <BreadcrumbList className="gap-1 sm:gap-1.5 font-semibold text-black dark:text-white text-xs leading-tight">
                                {breadcrumbs.length > 2 ? (
                                    <>
                                        <BreadcrumbItem>
                                            <BreadcrumbLink asChild className="text-black dark:text-white hover:text-black">
                                                <Link href={breadcrumbs[0].href || '#'}>{breadcrumbs[0].label}</Link>
                                            </BreadcrumbLink>
                                        </BreadcrumbItem>
                                        <BreadcrumbSeparator className="[&>svg]:size-3 opacity-50" />
                                        <BreadcrumbItem>
                                            <BreadcrumbEllipsis className="size-5" />
                                        </BreadcrumbItem>
                                        <BreadcrumbSeparator className="[&>svg]:size-3 opacity-50" />
                                        <BreadcrumbItem>
                                            <BreadcrumbPage className="max-w-[100px] truncate text-black dark:text-white">
                                                {breadcrumbs[breadcrumbs.length - 1].label}
                                            </BreadcrumbPage>
                                        </BreadcrumbItem>
                                    </>
                                ) : (
                                    breadcrumbs.map((item, index) => (
                                        <React.Fragment key={index}>
                                            <BreadcrumbItem>
                                                {item.href && index < breadcrumbs.length - 1 ? (
                                                    <BreadcrumbLink asChild className="max-w-[80px] truncate text-black dark:text-white hover:text-black">
                                                        <Link href={item.href}>{item.label}</Link>
                                                    </BreadcrumbLink>
                                                ) : (
                                                    <BreadcrumbPage className="max-w-[120px] truncate text-black dark:text-white">
                                                        {item.label}
                                                    </BreadcrumbPage>
                                                )}
                                            </BreadcrumbItem>
                                            {index < breadcrumbs.length - 1 && <BreadcrumbSeparator className="[&>svg]:size-3 opacity-50" />}
                                        </React.Fragment>
                                    ))
                                )}
                            </BreadcrumbList>
                        </Breadcrumb>
                    </>
                ) : (
                    <h1 className="text-sm font-bold uppercase tracking-[0.2em] text-foreground/70 truncate">{pageTitle}</h1>
                )}
            </div>
            <div className="flex items-center gap-2 md:gap-4 shrink-0">
                <ActiveTeamIndicator />
                <NotificationBell />
                <div className="h-6 w-px bg-border/40 hidden sm:block" />
                <UserMenu />
            </div>
        </header>
    );
}
