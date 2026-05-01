import {
  AdminActivityItem,
  AdminActivityList,
  AdminEmptyState,
  AdminPageShell,
  AdminSectionCard,
} from '@/shared/ui/admin-surface';
import {
  Settings,
  LogOut,
  UserPlus,
  Lock,
  UserCog,
  AlertCircle,
  UserMinus,
  Mail,
  CheckCircle,
  Eye,
  EyeOff,
  type LucideIcon,
} from 'lucide-react';
import { redirect } from 'next/navigation';

import { ActivityType } from '@/lib/data/db/schema';
import { getActivityLogs, getUser } from '@/lib/data/db/queries';

const iconMap: Record<ActivityType, LucideIcon> = {
  [ActivityType.SIGN_UP]: UserPlus,
  [ActivityType.SIGN_IN]: UserCog,
  [ActivityType.SIGN_OUT]: LogOut,
  [ActivityType.UPDATE_PASSWORD]: Lock,
  [ActivityType.DELETE_ACCOUNT]: UserMinus,
  [ActivityType.UPDATE_ACCOUNT]: Settings,
  [ActivityType.CREATE_TEAM]: UserPlus,
  [ActivityType.REMOVE_TEAM_MEMBER]: UserMinus,
  [ActivityType.INVITE_TEAM_MEMBER]: Mail,
  [ActivityType.ACCEPT_INVITATION]: CheckCircle,
  [ActivityType.IMPERSONATION_START]: Eye,
  [ActivityType.IMPERSONATION_END]: EyeOff,
};

function getRelativeTime(date: Date) {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) {
    return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  }
  if (diffInSeconds < 86400) {
    return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  }
  if (diffInSeconds < 604800) {
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  }

  return date.toLocaleDateString();
}

function formatAction(action: ActivityType): string {
  switch (action) {
    case ActivityType.SIGN_UP:
      return 'You signed up';
    case ActivityType.SIGN_IN:
      return 'You signed in';
    case ActivityType.SIGN_OUT:
      return 'You signed out';
    case ActivityType.UPDATE_PASSWORD:
      return 'You changed your password';
    case ActivityType.DELETE_ACCOUNT:
      return 'You deleted your account';
    case ActivityType.UPDATE_ACCOUNT:
      return 'You updated your account';
    case ActivityType.CREATE_TEAM:
      return 'You created a new team';
    case ActivityType.REMOVE_TEAM_MEMBER:
      return 'You removed a team member';
    case ActivityType.INVITE_TEAM_MEMBER:
      return 'You invited a team member';
    case ActivityType.ACCEPT_INVITATION:
      return 'You accepted an invitation';
    case ActivityType.IMPERSONATION_START:
      return 'You started impersonation';
    case ActivityType.IMPERSONATION_END:
      return 'You ended impersonation';
    default:
      return 'Unknown action occurred';
  }
}

export async function AdminActivityPage() {
  const user = await getUser();
  if (!user) {
    redirect('/sign-in');
  }

  const logs = await getActivityLogs(user.id);

  return (
    <AdminPageShell title="Activity Log">
      <AdminSectionCard title="Recent Activity">
        {logs.length > 0 ? (
          <AdminActivityList>
            {logs.map((log) => {
              const Icon = iconMap[log.action as ActivityType] || Settings;
              const formattedAction = formatAction(log.action as ActivityType);

              return (
                <AdminActivityItem
                  key={log.id}
                  icon={Icon}
                  title={(
                    <>
                      {formattedAction}
                      {log.ipAddress && ` from IP ${log.ipAddress}`}
                    </>
                  )}
                  description={getRelativeTime(new Date(log.timestamp))}
                />
              );
            })}
          </AdminActivityList>
        ) : (
          <AdminEmptyState
            icon={AlertCircle}
            title="No activity yet"
            description="When you perform actions like signing in or updating your account, they'll appear here."
          />
        )}
      </AdminSectionCard>
    </AdminPageShell>
  );
}
