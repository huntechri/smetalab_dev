import { SidebarProvider, SidebarInset } from '@/shared/ui/sidebar';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { AppHeader } from '@/components/layout/app-header';
import { getUser, getTeamForUser } from '@/lib/data/db/queries';
import { getUserPermissions } from '@/lib/infrastructure/auth/rbac';
import { UserProvider } from '@/components/providers/permissions-provider';
import { BreadcrumbProvider } from '@/components/providers/breadcrumb-provider';
import { ImpersonationBanner } from '@/features/admin/components/impersonation-banner';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
    const user = await getUser();
    const team = await getTeamForUser();

    // Convert to simple PermissionEntry array
    const permissionsInfo = user ? await getUserPermissions(user, team?.id || null) : [];

    return (
        <UserProvider permissions={permissionsInfo} user={user} team={team}>
            <BreadcrumbProvider>
                <a href="#main" className="skip-link sr-only focus:not-sr-only">
                    Перейти к основному контенту
                </a>
                <SidebarProvider>
                <AppSidebar />
                <SidebarInset>
                    <ImpersonationBanner />
                    <AppHeader />
                    <main id="main" className="flex-1 p-4 md:p-6 lg:p-8 min-w-0">
                        {children}
                    </main>
                </SidebarInset>
                </SidebarProvider>
            </BreadcrumbProvider>
        </UserProvider>
    );
}
