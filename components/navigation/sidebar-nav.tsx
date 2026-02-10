import Link from 'next/link';
import { LucideIcon } from 'lucide-react';
import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';

interface SidebarNavItem {
    title: string;
    url: string;
    icon: LucideIcon;
}

interface SidebarNavProps {
    label: string;
    items: SidebarNavItem[];
    pathname: string;
    isActive?: (item: SidebarNavItem) => boolean;
}

export function SidebarNav({ label, items, pathname, isActive }: SidebarNavProps) {
    if (items.length === 0) {
        return null;
    }

    return (
        <SidebarGroup>
            <SidebarGroupLabel>{label}</SidebarGroupLabel>
            <SidebarGroupContent>
                <SidebarMenu>
                    {items.map((item) => {
                        const itemIsActive = isActive
                            ? isActive(item)
                            : pathname === item.url;

                        return (
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton asChild isActive={itemIsActive}>
                                    <Link href={item.url}>
                                        <item.icon />
                                        <span>{item.title}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        );
                    })}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    );
}
