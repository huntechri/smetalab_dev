'use client';

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
} from '@/shared/ui/sidebar';
import {
    FolderKanban,
    Home,
    ShoppingCart,
    Layers,
    Wrench,
    Package,
    Users,
    Beaker,
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import { usePermissions } from '@/shared/hooks/use-permissions';
import { SidebarNav } from '@/components/navigation/sidebar-nav';

const mainNavItems = [
    {
        title: 'Главная',
        url: '/app',
        icon: Home,
    },
    {
        title: 'Проекты',
        url: '/app/projects',
        icon: FolderKanban,
        requiredPermission: 'projects',
    },
    {
        title: 'Закупки',
        url: '/app/global-purchases',
        icon: ShoppingCart,
    },
    {
        title: 'Шаблоны',
        url: '/app/patterns',
        icon: Layers,
    },
    {
        title: 'Демо',
        url: '/app/demo',
        icon: Beaker,
    },
    {
        title: 'Команда',
        url: '/app/team',
        icon: Users,
        requiredPermission: 'team',
    },
];

const guideNavItems = [
    {
        title: 'Работы',
        url: '/app/guide/works',
        icon: Wrench,
        requiredPermission: 'guide',
    },
    {
        title: 'Материалы',
        url: '/app/guide/materials',
        icon: Package,
        requiredPermission: 'guide',
    },
    {
        title: 'Контрагенты',
        url: '/app/guide/counterparties',
        icon: Users,
        requiredPermission: 'guide',
    },
    {
        title: 'Поставщики',
        url: '/app/guide/material-suppliers',
        icon: Users,
        requiredPermission: 'guide',
    },
];

export function AppSidebar() {
    const pathname = usePathname();
    const { hasPermission, loading } = usePermissions();

    if (loading) {
        return (
            <Sidebar>
                <SidebarHeader>
                    <div className="flex items-center gap-2 px-2 py-4">
                        <div className="h-8 w-8 rounded-lg bg-sidebar-accent animate-pulse" />
                        <div className="h-4 w-24 bg-sidebar-accent animate-pulse rounded" />
                    </div>
                </SidebarHeader>
                <SidebarContent>
                    <div className="px-4 py-6 space-y-6">
                        <div className="space-y-2">
                            <div className="h-3 w-16 bg-sidebar-accent animate-pulse rounded" />
                            <div className="space-y-1">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <div key={i} className="h-11 w-full bg-sidebar-accent animate-pulse rounded-lg" />
                                ))}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="h-3 w-20 bg-sidebar-accent animate-pulse rounded" />
                            <div className="space-y-1">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="h-11 w-full bg-sidebar-accent animate-pulse rounded-lg" />
                                ))}
                            </div>
                        </div>
                    </div>
                </SidebarContent>
            </Sidebar>
        );
    }

    const filterItems = (items: typeof mainNavItems) => {
        return items.filter((item) => {
            if (!item.requiredPermission) return true;
            return hasPermission(item.requiredPermission, 'read');
        });
    };

    const filteredMainNavItems = filterItems(mainNavItems);
    const filteredGuideNavItems = filterItems(guideNavItems);

    return (
        <Sidebar className="border-r-sidebar-border bg-sidebar backdrop-blur-sm">
            <SidebarHeader>
                <div className="flex items-center gap-3 px-3 py-5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 text-white font-bold shadow-sm ring-1 ring-orange-400/30" aria-hidden="true">
                        S
                    </div>
                    <span className="text-lg font-bold tracking-tight text-sidebar-foreground">Smetalab</span>
                </div>
            </SidebarHeader>
            <SidebarContent className="px-2 space-y-3">
                <SidebarNav
                    label="Навигация"
                    items={filteredMainNavItems}
                    pathname={pathname}
                />

                <SidebarNav
                    label="Справочники"
                    items={filteredGuideNavItems}
                    pathname={pathname}
                />
            </SidebarContent>
            <SidebarFooter />
        </Sidebar>
    );
}
