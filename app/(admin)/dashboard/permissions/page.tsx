import { PermissionsMatrix } from '@/features/permissions/components/permissions-matrix';
import { AdminPageShell } from '@/shared/ui/admin-surface';

export default function PermissionsPage() {
    return (
        <AdminPageShell title="Управление разрешениями">
            <PermissionsMatrix />
        </AdminPageShell>
    );
}
