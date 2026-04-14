import { redirect } from 'next/navigation';
import { getTeamForUser, getUser } from '@/lib/data/db/queries';
import { getUserPermissions } from '@/lib/infrastructure/auth/rbac';
import { UserSettingsPage } from '@/features/settings/components/user-settings-page';

export default async function SettingsPage() {
  const user = await getUser();

  if (!user) {
    redirect('/sign-in');
  }

  const team = await getTeamForUser();
  const permissions = await getUserPermissions(user, team?.id ?? null);

  return (
    <UserSettingsPage
      user={{
        id: user.id,
        name: user.name,
        email: user.email,
        teamRole: user.teamRole,
        platformRole: user.platformRole,
      }}
      team={team ? { id: team.id, name: team.name } : null}
      permissions={permissions}
    />
  );
}
