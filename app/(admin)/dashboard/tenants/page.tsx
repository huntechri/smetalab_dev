import { getAllTeams } from '@/lib/data/db/admin-queries';
import { Button } from '@/shared/ui/button';
import {
    AdminCardGrid,
    AdminInlineStat,
    AdminPageShell,
    AdminStatusBadge,
    AdminTenantCard,
} from '@/shared/ui/admin-surface';
import { Building2, Users, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { getSubscriptionBadgeVariant } from '@/features/admin';

export const dynamic = 'force-dynamic';

export default async function TenantsPage() {
    const teams = await getAllTeams();

    return (
        <AdminPageShell
            title="Управление тенантами"
            actions={<AdminStatusBadge mono>Total: {teams.length}</AdminStatusBadge>}
        >
            <AdminCardGrid>
                {teams.map((team) => (
                    <AdminTenantCard
                        key={team.id}
                        icon={Building2}
                        title={team.name}
                        status={(
                            <AdminStatusBadge variant={getSubscriptionBadgeVariant(team.subscriptionStatus)}>
                                {team.subscriptionStatus || 'free'}
                            </AdminStatusBadge>
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
