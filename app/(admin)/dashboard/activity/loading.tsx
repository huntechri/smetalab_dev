import { AdminPageShell, AdminSectionCard } from '@/shared/ui/admin-surface';

export default function ActivityPageSkeleton() {
  return (
    <AdminPageShell title="Activity Log">
      <AdminSectionCard title="Recent Activity">{null}</AdminSectionCard>
    </AdminPageShell>
  );
}
