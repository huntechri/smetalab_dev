import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
} from '@repo/ui';

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
    const router = useRouter();

    if (items.length === 0) {
        return null;
    }

    return (
        <SidebarGroup className="py-3">
            <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-widest text-sidebar-foreground/50 mb-3 px-3">{label}</SidebarGroupLabel>
            <SidebarGroupContent>
                <SidebarMenu className="gap-2 px-2">
                    {items.map((item) => {
                        const itemIsActive = isActive
                            ? isActive(item)
                            : item.url === '/app'
                                ? pathname === '/app'
                                : pathname === item.url || pathname.startsWith(item.url + '/');

                        return (
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton asChild isActive={itemIsActive} className={cn('h-11 rounded-lg px-4 transition-all duration-200 hover:bg-sidebar-accent/60 data-[active=true]:bg-sidebar-primary/12 data-[active=true]:text-sidebar-primary data-[active=true]:font-medium border-l-2 border-l-transparent', itemIsActive && 'data-[active=true]:border-l-sidebar-primary data-[active=true]:shadow-sm')}>
                                    <Link
                                        href={item.url}
                                        prefetch={true}
                                        onMouseEnter={() => router.prefetch(item.url)}
                                        onFocus={() => router.prefetch(item.url)}
                                        onClick={() => {
                                            if (isMobile) {
                                                setOpenMobile(false);
                                            }
                                        }}
                                        className="gap-3"
                                    >
                                        <item.icon className={cn('h-4 w-4 transition-colors', itemIsActive ? 'text-sidebar-primary' : 'text-sidebar-foreground/60')} />
                                        <span className={cn('text-sm transition-colors', itemIsActive ? 'text-sidebar-primary font-medium' : 'text-sidebar-foreground/75 hover:text-sidebar-foreground')}>{item.title}</span>
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
