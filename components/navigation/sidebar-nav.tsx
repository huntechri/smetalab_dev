import Link from 'next/link';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';
import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from '@/shared/ui/sidebar';

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
    const { isMobile, setOpenMobile } = useSidebar();

    if (items.length === 0) {
        return null;
    }

    return (
        <SidebarGroup>
            <SidebarGroupLabel className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/70 mb-2 px-3">{label}</SidebarGroupLabel>
            <SidebarGroupContent>
                <SidebarMenu className="gap-1.5 px-2">
                    {items.map((item) => {
                        const itemIsActive = isActive
                            ? isActive(item)
                            : pathname === item.url;

                        return (
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton asChild isActive={itemIsActive} className={cn('h-10 rounded-xl px-4 transition-all duration-300 hover:bg-muted/60 data-[active=true]:bg-primary/10 data-[active=true]:text-primary data-[active=true]:font-semibold', itemIsActive && 'shadow-sm ring-1 ring-primary/20')}>
                                    <Link
                                        href={item.url}
                                        onClick={() => {
                                            if (isMobile) {
                                                setOpenMobile(false);
                                            }
                                        }}
                                        className="gap-3"
                                    >
                                        <item.icon className={cn('h-4 w-4', itemIsActive ? 'text-primary' : 'text-muted-foreground')} />
                                        <span className={cn('text-sm transition-colors', itemIsActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground')}>{item.title}</span>
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
