import { getTeamDetails } from '@/lib/data/db/admin-queries';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui';
import { Badge } from '@repo/ui';
import { Button } from '@repo/ui';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/ui';
import {
    Users,
    Activity,
    Package,
    Hammer,
    ArrowLeft,
    Clock
} from 'lucide-react';
import Link from 'next/link';
import { ImpersonateButton } from '@/features/admin/components/impersonate-button';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { getRoleBadgeClassName, getSubscriptionBadgeClassName } from '@/features/admin/lib/badge-tones';

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
        <section className="flex-1 p-4 lg:p-8 space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/dashboard/tenants">
                    <Button variant="ghost" size="icon-xs">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">{team.name}</h1>
                    <p className="text-sm text-muted-foreground">ID: {team.id} • Создан {format(team.createdAt, 'PPp', { locale: ru })}</p>
                </div>
                <div className="ml-auto flex items-center gap-2">
                    <Badge variant="secondary" className={getSubscriptionBadgeClassName(team.subscriptionStatus)}>
                        {team.subscriptionStatus || 'free'}
                    </Badge>
                    <Badge variant="secondary" className="border-none bg-slate-500/12 text-slate-700 uppercase tracking-wide">
                        {team.planName || 'No Plan'}
                    </Badge>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="rounded-2xl shadow-sm border-gray-100">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Пользователи</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{team.teamMembers.length}</div>
                    </CardContent>
                </Card>
                <Card className="rounded-2xl shadow-sm border-gray-100">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Работы</CardTitle>
                        <Hammer className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{team.metrics.worksCount}</div>
                    </CardContent>
                </Card>
                <Card className="rounded-2xl shadow-sm border-gray-100">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Материалы</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{team.metrics.materialsCount}</div>
                    </CardContent>
                </Card>
                <Card className="rounded-2xl shadow-sm border-gray-100">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Последняя активность</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-sm font-medium">
                            {team.recentActivity.length > 0
                                ? format(team.recentActivity[0].timestamp, 'PPp', { locale: ru })
                                : 'Нет данных'}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="members" className="w-full">
                <TabsList className="grid w-full grid-cols-2 lg:w-[400px] rounded-xl">
                    <TabsTrigger value="members" className="rounded-lg">Участники</TabsTrigger>
                    <TabsTrigger value="activity" className="rounded-lg">Логи активности</TabsTrigger>
                </TabsList>

                <TabsContent value="members" className="mt-4 space-y-4">
                    <Card className="rounded-2xl shadow-sm border-gray-100 overflow-hidden">
                        <div className="divide-y divide-gray-100">
                            {team.teamMembers.map((member) => (
                                <div key={member.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
                                            {member.user.name?.[0] || member.user.email[0].toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">{member.user.name || 'No name'}</p>
                                            <p className="text-xs text-muted-foreground">{member.user.email}</p>
                                        </div>
                                        <Badge variant="secondary" className={`ml-2 text-[10px] uppercase tracking-wide ${getRoleBadgeClassName(member.role)}`}>
                                            {member.role}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <ImpersonateButton teamId={team.id} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </TabsContent>

                <TabsContent value="activity" className="mt-4">
                    <Card className="rounded-2xl shadow-sm border-gray-100 overflow-hidden">
                        <div className="divide-y divide-gray-100 text-sm">
                            {team.recentActivity.length === 0 ? (
                                <div className="p-8 text-center text-muted-foreground italic">
                                    Нет записей об активности
                                </div>
                            ) : (
                                team.recentActivity.map((log) => (
                                    <div key={log.id} className="p-4 flex items-start gap-4">
                                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg mt-0.5">
                                            <Clock className="h-4 w-4" />
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <div className="flex items-center justify-between">
                                                <p className="font-medium text-gray-900">{log.action}</p>
                                                <p className="text-xs text-muted-foreground">{format(log.timestamp, 'PPp', { locale: ru })}</p>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <span>{log.user?.name || log.user?.email || 'System'}</span>
                                                {log.ipAddress && (
                                                    <>
                                                        <span>•</span>
                                                        <span>IP: {log.ipAddress}</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </Card>
                </TabsContent>
            </Tabs>
        </section>
    );
}
