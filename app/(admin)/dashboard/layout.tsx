import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/shared/ui/sidebar';
import { AdminSidebar } from '@/features/admin/components/admin-sidebar';
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
          <header className="flex h-14 items-center gap-4 border-b bg-background px-6">
            <SidebarTrigger />
            <div className="flex-1">
              <span className="font-semibold text-lg">Admin Dashboard</span>
            </div>
          </header>
          <main className="flex-1 p-6">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </UserProvider>
  );
}
