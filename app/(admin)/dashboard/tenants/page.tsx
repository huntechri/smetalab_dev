import { getAllTeams } from '@/lib/data/db/admin-queries';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import {
    AdminCardGrid,
    AdminInlineStat,
    AdminPageShell,
    AdminTenantCard,
} from '@/shared/ui/admin-surface';
import { Building2, Users, ArrowRight } from 'lucide-react';
import Link from 'next/link';

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

export const dynamic = 'force-dynamic';

export default async function TenantsPage() {
    const teams = await getAllTeams();

    return (
        <AdminPageShell
            title="Управление тенантами"
            actions={<Badge variant="neutral" size="xs" className="border-none font-mono">Total: {teams.length}</Badge>}
        >
            <AdminCardGrid>
                {teams.map((team) => (
                    <AdminTenantCard
                        key={team.id}
                        icon={Building2}
                        title={team.name}
                        status={(
                            <Badge variant={getSubscriptionBadgeVariant(team.subscriptionStatus)} size="xs">
                                {team.subscriptionStatus || 'free'}
                            </Badge>
                        )}
                        meta={(
                            <>
                                <AdminInlineStat icon={Users}>{team.memberCount} участников</AdminInlineStat>
                                <AdminInlineStat emphasis>{team.planName || 'No Plan'}</AdminInlineStat>
                            </>
                        )}
                        action={(
                            <Link href={`/dashboard/tenants/${team.id}`}>
                                <Button variant="outline" size="default">
                                    Подробнее
                                    <ArrowRight className="ml-2 size-3.5 transition-transform group-hover:translate-x-0.5" />
                                </Button>
                            </Link>
                        )}
                    />
                ))}
            </AdminCardGrid>
        </AdminPageShell>
    );
}
