import { SidebarProvider, SidebarInset } from '@/shared/ui/sidebar';
import { WorkspaceMain } from '@/shared/ui/page-shell';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { AppHeader } from '@/components/layout/app-header';
import { getUser, getTeamForUser } from '@/lib/data/db/queries';
import { getUserPermissions } from '@/lib/infrastructure/auth/rbac';
import { UserProvider } from '@/components/providers/permissions-provider';
import { BreadcrumbProvider } from '@/components/providers/breadcrumb-provider';
import { ImpersonationBanner } from '@/features/admin';

export default async function MainLayout({ children }: { children: React.ReactNode }) {
    const [user, team] = await Promise.all([getUser(), getTeamForUser()]);

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
                    <WorkspaceMain>
                        {children}
                    </WorkspaceMain>
                </SidebarInset>
                </SidebarProvider>
            </BreadcrumbProvider>
        </UserProvider>
    );
}
