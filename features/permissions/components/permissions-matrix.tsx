'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Building2, Edit3, Eye, Settings2, Users, XCircle } from 'lucide-react';

interface Permission {
  id: number;
  code: string;
  name: string;
  description: string | null;
  scope: 'platform' | 'tenant';
}

interface PermissionsData {
  tenantPermissions: Permission[];
  platformPermissions: Permission[];
  tenantRoleMap: Record<string, Record<number, string>>;
  platformRoleMap: Record<string, Record<number, string>>;
  tenantRoles: string[];
  platformRoles: string[];
}

const ROLE_LABELS: Record<string, string> = {
  admin: 'Админ',
  estimator: 'Сметчик',
  manager: 'Менеджер',
  superadmin: 'Суперадмин',
  support: 'Поддержка',
};

export function PermissionsMatrix() {
  const [data, setData] = useState<PermissionsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    void fetchPermissions();
  }, []);

  async function fetchPermissions() {
    try {
      const response = await fetch('/api/admin/permissions');
      if (response.ok) {
        const result = (await response.json()) as PermissionsData;
        setData(result);
      }
    } catch (error) {
      console.error('Failed to fetch permissions:', error);
    } finally {
      setLoading(false);
    }
  }

  async function setLevel(
    type: 'tenant' | 'platform',
    role: string,
    permissionId: number,
    level: 'none' | 'read' | 'manage'
  ) {
    const key = `${type}-${role}-${permissionId}`;
    setUpdating(key);

    try {
      const response = await fetch('/api/admin/permissions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, role, permissionId, level }),
      });

      if (response.ok) {
        await fetchPermissions();
      }
    } catch (error) {
      console.error('Failed to update level:', error);
    } finally {
      setUpdating(null);
    }
  }

  if (loading) return <Skeleton className="h-[400px] w-full rounded-2xl" />;
  if (!data) return null;

  const renderMatrix = (
    type: 'tenant' | 'platform',
    roles: string[],
    permissions: Permission[],
    roleMap: Record<string, Record<number, string>>
  ) => (
    <Table className="w-full border-collapse">
      <TableHeader className="sticky top-0 z-20 border-b bg-gray-50/80 backdrop-blur">
        <TableRow className="hover:bg-transparent">
          <TableHead className="text-caption w-1/3 px-6 py-4 text-left font-semibold tracking-wide">
            Функциональная область
          </TableHead>
          {roles.map((role) => (
            <TableHead key={role} className="border-l border-gray-100 px-2 py-4 text-center">
              <Badge
                variant="outline"
                className="rounded-md border-gray-200 px-2 py-0.5 text-xs font-semibold"
              >
                {ROLE_LABELS[role]}
              </Badge>
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {permissions.map((perm) => (
          <TableRow key={perm.id} className="border-b transition-colors hover:bg-zinc-50/50">
            <TableCell className="px-6 py-4 align-top">
              <div className="flex flex-col">
                <span className="text-body font-semibold tracking-tight text-zinc-900">{perm.name}</span>
                <p className="text-caption mt-1 max-w-xs text-zinc-500">{perm.description}</p>
              </div>
            </TableCell>
            {roles.map((role) => {
              const currentLevel = roleMap[role]?.[perm.id] || 'none';
              const isUpdating = updating === `${type}-${role}-${perm.id}`;

              return (
                <TableCell key={role} className="border-l border-gray-50 px-2 py-4">
                  <div className="flex items-center justify-center">
                    <div className="flex gap-1 rounded-xl bg-zinc-100 p-1">
                      <TooltipProvider delayDuration={200}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-xs"
                              onClick={() => void setLevel(type, role, perm.id, 'none')}
                              className={`rounded-lg p-1.5 ${
                                currentLevel === 'none'
                                  ? 'bg-white text-zinc-900 shadow-sm hover:bg-white'
                                  : 'text-zinc-400 hover:text-zinc-600'
                              }`}
                              disabled={isUpdating}
                              aria-label={`Отключить ${perm.name} для роли ${ROLE_LABELS[role]}`}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent className="text-xs">Отключить (скрыть)</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-xs"
                              onClick={() => void setLevel(type, role, perm.id, 'read')}
                              className={`rounded-lg p-1.5 ${
                                currentLevel === 'read'
                                  ? 'bg-blue-500 text-white shadow-sm hover:bg-blue-500'
                                  : 'text-zinc-400 hover:text-zinc-600'
                              }`}
                              disabled={isUpdating}
                              aria-label={`Включить чтение ${perm.name} для роли ${ROLE_LABELS[role]}`}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent className="text-xs">Чтение (только просмотр)</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-xs"
                              onClick={() => void setLevel(type, role, perm.id, 'manage')}
                              className={`rounded-lg p-1.5 ${
                                currentLevel === 'manage'
                                  ? 'bg-orange-500 text-white shadow-sm hover:bg-orange-500'
                                  : 'text-zinc-400 hover:text-zinc-600'
                              }`}
                              disabled={isUpdating}
                              aria-label={`Включить полный доступ ${perm.name} для роли ${ROLE_LABELS[role]}`}
                            >
                              <Edit3 className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent className="text-xs">Полный доступ (ред.)</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                </TableCell>
              );
            })}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-title flex items-center gap-2 bg-transparent text-zinc-900">
            <Settings2 className="h-5 w-5" /> Контроль доступа
          </h2>
          <p className="text-caption">
            Модель прав 3-го уровня: <span className="font-bold text-zinc-400">Выкл</span> /{' '}
            <span className="font-bold text-blue-500">Чтение</span> /{' '}
            <span className="font-bold text-orange-500">Полный</span>
          </p>
        </div>
      </div>

      <Tabs defaultValue="tenant" className="w-full">
        <TabsList className="mb-6 h-12 w-full rounded-2xl bg-zinc-100 p-1 sm:w-auto">
          <TabsTrigger
            value="tenant"
            className="rounded-xl px-6 text-sm font-semibold transition-all data-[state=active]:bg-white data-[state=active]:shadow-md"
          >
            <Users className="mr-2 h-4 w-4" /> Роли команды
          </TabsTrigger>
          <TabsTrigger
            value="platform"
            className="rounded-xl px-6 text-sm font-semibold transition-all data-[state=active]:bg-white data-[state=active]:shadow-md"
          >
            <Building2 className="mr-2 h-4 w-4" /> Платформа
          </TabsTrigger>
        </TabsList>

        <div className="overflow-hidden rounded-[2rem] border-2 border-zinc-100 bg-white shadow-2xl shadow-zinc-200/50">
          <TabsContent value="tenant" className="m-0 overflow-x-auto">
            {renderMatrix('tenant', data.tenantRoles, data.tenantPermissions, data.tenantRoleMap)}
          </TabsContent>

          <TabsContent value="platform" className="m-0 overflow-x-auto">
            {renderMatrix('platform', data.platformRoles, data.platformPermissions, data.platformRoleMap)}
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
