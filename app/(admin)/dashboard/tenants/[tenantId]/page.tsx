import { getTeamDetails } from '@/lib/data/db/admin-queries';
import { notFound } from 'next/navigation';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Tabs, TabsContent } from '@/shared/ui/tabs';
import {
    AdminActivityRecord,
    AdminEmptyMessage,
    AdminHeaderActions,
    AdminInlineMeta,
    AdminListCard,
    AdminListItem,
    AdminMetricCard,
    AdminMetricGrid,
    AdminPageHeader,
    AdminPageHeading,
    AdminPageShell,
    AdminPersonAvatar,
    AdminRecordText,
    AdminTabsList,
    AdminTabsTrigger,
} from '@/shared/ui/admin-surface';
import {
    Users,
    Activity,
    Package,
    Hammer,
    ArrowLeft,
    Clock
} from 'lucide-react';
import Link from 'next/link';
import { ImpersonateButton } from '@/features/admin';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
function getSubscriptionBadgeVariant(status?: string | null): "success" | "info" | "warning" | "danger" | "paused" | "neutral" {
  const normalizedStatus = (status ?? "free").toLowerCase();

  if (normalizedStatus === "active") {
    return "success";
  }

  if (normalizedStatus === "trialing") {
    return "info";
  }

  if (normalizedStatus === "past_due" || normalizedStatus === "incomplete") {
    return "warning";
  }

  if (normalizedStatus === "unpaid" || normalizedStatus === "incomplete_expired") {
    return "danger";
  }

  if (normalizedStatus === "paused") {
    return "paused";
  }

  return "neutral";
}

function getRoleBadgeVariant(role?: string | null): "info" | "paused" | "warning" | "neutral" {
  const normalizedRole = (role ?? "").toLowerCase();

  if (normalizedRole === "owner" || normalizedRole === "admin") {
    return "info";
  }

  if (normalizedRole === "manager") {
    return "paused";
  }

  if (normalizedRole === "estimator") {
    return "warning";
  }

  return "neutral";
}

interface PageProps {
    params: Promise<{ tenantId: string }>;
}

export const dynamic = 'force-dynamic';

export default async function TenantDetailsPage({ params }: PageProps) {
    const { tenantId } = await params;
    const team = await getTeamDetails(parseInt(tenantId));

    if (!team) {
        notFound();
    }

    return (
        <AdminPageShell>
            <AdminPageHeader
                actions={(
                    <>
                        <Badge variant={getSubscriptionBadgeVariant(team.subscriptionStatus)} size="xs">
                            {team.subscriptionStatus || 'free'}
                        </Badge>
                        <Badge variant="neutral" size="xs">{team.planName || 'No Plan'}</Badge>
                    </>
                )}
            >
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/tenants">
                        <Button variant="ghost" size="icon-xs">
                            <ArrowLeft className="size-5" />
                        </Button>
                    </Link>
                    <AdminPageHeading
                        title={team.name}
                        description={`ID: ${team.id} • Создан ${format(team.createdAt, 'PPp', { locale: ru })}`}
                    />
                </div>
            </AdminPageHeader>

            <AdminMetricGrid>
                <AdminMetricCard title="Пользователи" value={team.teamMembers.length} icon={Users} />
                <AdminMetricCard title="Работы" value={team.metrics.worksCount} icon={Hammer} />
                <AdminMetricCard title="Материалы" value={team.metrics.materialsCount} icon={Package} />
                <AdminMetricCard
                    title="Последняя активность"
                    value={team.recentActivity.length > 0
                        ? format(team.recentActivity[0].timestamp, 'PPp', { locale: ru })
                        : 'Нет данных'}
                    icon={Activity}
                />
            </AdminMetricGrid>

            <Tabs defaultValue="members" className="w-full">
                <AdminTabsList>
                    <AdminTabsTrigger value="members">Участники</AdminTabsTrigger>
                    <AdminTabsTrigger value="activity">Логи активности</AdminTabsTrigger>
                </AdminTabsList>

                <TabsContent value="members" className="mt-4 space-y-4">
                    <AdminListCard>
                        {team.teamMembers.map((member) => (
                            <AdminListItem key={member.id} interactive>
                                <div className="flex items-center gap-3">
                                    <AdminPersonAvatar label={member.user.name?.[0] || member.user.email[0].toUpperCase()} />
                                    <AdminRecordText
                                        title={member.user.name || 'No name'}
                                        description={member.user.email}
                                    />
                                    <AdminHeaderActions>
                                        <Badge variant={getRoleBadgeVariant(member.role)} size="xs">
                                            {member.role}
                                        </Badge>
                                    </AdminHeaderActions>
                                </div>
                                <AdminHeaderActions>
                                    <ImpersonateButton teamId={team.id} />
                                </AdminHeaderActions>
                            </AdminListItem>
                        ))}
                    </AdminListCard>
                </TabsContent>

                <TabsContent value="activity" className="mt-4">
                    <AdminListCard>
                        {team.recentActivity.length === 0 ? (
                            <AdminEmptyMessage>Нет записей об активности</AdminEmptyMessage>
                        ) : (
                            team.recentActivity.map((log) => (
                                <AdminActivityRecord
                                    key={log.id}
                                    icon={Clock}
                                    title={log.action}
                                    timestamp={format(log.timestamp, 'PPp', { locale: ru })}
                                    meta={(
                                        <AdminInlineMeta>
                                            <span>{log.user?.name || log.user?.email || 'System'}</span>
                                            {log.ipAddress && (
                                                <>
                                                    <span>•</span>
                                                    <span>IP: {log.ipAddress}</span>
                                                </>
                                            )}
                                        </AdminInlineMeta>
                                    )}
                                />
                            ))
                        )}
                    </AdminListCard>
                </TabsContent>
            </Tabs>
        </AdminPageShell>
    );
}
