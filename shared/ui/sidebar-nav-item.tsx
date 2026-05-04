import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';
import {
    SidebarMenuItem,
    SidebarMenuButton,
} from '@/shared/ui/sidebar';
import {
    primitiveSidebarMenuButtonClassName,
} from '@/shared/ui/primitive-navigation';

interface SidebarNavItemProps {
    icon: LucideIcon;
    label: string;
    isActive: boolean;
    href: string;
    onClick?: () => void;
}

export function SidebarNavItem({ icon: Icon, label, isActive, href, onClick }: SidebarNavItemProps) {
    const router = useRouter();

    return (
        <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive} className={primitiveSidebarMenuButtonClassName}>
                <Link
                    href={href}
                    prefetch={true}
                    onMouseEnter={() => router.prefetch(href)}
                    onFocus={() => router.prefetch(href)}
                    onClick={onClick}
                    className="gap-3"
                >
                    <Icon className={cn('h-4 w-4 transition-colors', isActive ? 'text-sidebar-primary' : 'text-sidebar-foreground/60')} />
                    <span className={cn('text-sm transition-colors', isActive ? 'text-sidebar-primary font-medium' : 'text-sidebar-foreground/75 hover:text-sidebar-foreground')}>{label}</span>
                </Link>
            </SidebarMenuButton>
        </SidebarMenuItem>
    );
}
