import { AdminPageHeader, AdminPageShell } from '@/shared/ui/admin-surface';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/shared/ui/sidebar';
import { AdminSidebar } from '@/features/admin';
import { getUser } from '@/lib/data/db/queries';
import { UserProvider } from '@/components/providers/permissions-provider';
import { getUserPermissions } from '@/lib/infrastructure/auth/rbac';
import { isPlatformAdminRole } from '@/lib/infrastructure/auth/admin-guard';
import { redirect } from 'next/navigation';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser();
  if (!user) {
    redirect('/sign-in');
  }

  if (!isPlatformAdminRole(user.platformRole)) {
    redirect('/app');
  }

  const userData = { name: user.name, email: user.email };
  const permissionsInfo = await getUserPermissions(user, null);

  return (
    <UserProvider permissions={permissionsInfo} user={user} team={null}>
      <SidebarProvider>
        <AdminSidebar user={userData} />
        <SidebarInset>
          <header className="border-b bg-background">
            <AdminPageHeader>
              <div className="flex h-14 items-center gap-4">
                <SidebarTrigger />
                <div className="flex-1">
                  <span className="font-semibold text-lg">Admin Dashboard</span>
                </div>
              </div>
            </AdminPageHeader>
          </header>
          <AdminPageShell>
            {children}
          </AdminPageShell>
        </SidebarInset>
      </SidebarProvider>
    </UserProvider>
  );
}
