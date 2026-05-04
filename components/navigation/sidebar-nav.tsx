import { LucideIcon } from 'lucide-react';
import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    useSidebar,
} from '@/shared/ui/sidebar';
import { SidebarNavItem } from '@/shared/ui/sidebar-nav-item';
import {
    primitiveSidebarGroupClassName,
    primitiveSidebarGroupLabelClassName,
    primitiveSidebarMenuClassName,
} from '@/shared/ui/primitive-navigation';

interface NavItem {
    title: string;
    url: string;
    icon: LucideIcon;
}

interface SidebarNavProps {
    label: string;
    items: NavItem[];
    pathname: string;
    isActive?: (item: NavItem) => boolean;
}

export function SidebarNav({ label, items, pathname, isActive }: SidebarNavProps) {
    const { isMobile, setOpenMobile } = useSidebar();

    if (items.length === 0) {
        return null;
    }

    return (
        <SidebarGroup className={primitiveSidebarGroupClassName}>
            <SidebarGroupLabel className={primitiveSidebarGroupLabelClassName}>{label}</SidebarGroupLabel>
            <SidebarGroupContent>
                <SidebarMenu className={primitiveSidebarMenuClassName}>
                    {items.map((item) => {
                        const itemIsActive = isActive
                            ? isActive(item)
                            : item.url === '/app'
                                ? pathname === '/app'
                                : pathname === item.url || pathname.startsWith(item.url + '/');

                        return (
                            <SidebarNavItem
                                key={item.title}
                                icon={item.icon}
                                label={item.title}
                                isActive={itemIsActive}
                                href={item.url}
                                onClick={() => {
                                    if (isMobile) {
                                        setOpenMobile(false);
                                    }
                                }}
                            />
                        );
                    })}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    );
}
