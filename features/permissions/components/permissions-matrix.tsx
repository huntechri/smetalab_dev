'use client';

import { Badge } from '@/shared/ui/badge';
import { LoadingState } from '@/shared/ui/states';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { Building2, Settings2, Users } from 'lucide-react';

import { PermissionLevelControl } from './PermissionLevelControl';
import { Permission, usePermissionsMatrix } from '@/features/permissions/hooks/usePermissionsMatrix';

const ROLE_LABELS: Record<string, string> = {
  admin: 'Админ',
  estimator: 'Сметчик',
  manager: 'Менеджер',
  superadmin: 'Суперадмин',
  support: 'Поддержка',
};

export function PermissionsMatrix() {
  const { data, loading, updating, setLevel } = usePermissionsMatrix();

  if (loading) return <LoadingState height="h-96" />;
  if (!data) return null;

  const renderMatrix = (
    type: 'tenant' | 'platform',
    roles: string[],
    permissions: Permission[],
    roleMap: Record<string, Record<number, string>>
  ) => (
    <Table className="w-full border-collapse">
      <TableHeader className="sticky top-0 z-20 border-b bg-muted/80 backdrop-blur">
        <TableRow className="hover:bg-transparent">
          <TableHead className="text-caption w-1/3 px-6 py-4 text-left font-semibold tracking-wide">
            Функциональная область
          </TableHead>
          {roles.map((role) => (
            <TableHead key={role} className="border-l border-border px-2 py-4 text-center">
              <Badge variant="neutral" size="xs">
                {ROLE_LABELS[role]}
              </Badge>
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {permissions.map((perm) => (
          <TableRow key={perm.id} className="border-b transition-colors hover:bg-muted/50">
            <TableCell className="px-6 py-4 align-top">
              <div className="flex flex-col">
                <span className="text-body font-semibold tracking-tight text-foreground">{perm.name}</span>
                <p className="text-caption mt-1 max-w-xs text-muted-foreground">{perm.description}</p>
              </div>
            </TableCell>
            {roles.map((role) => {
              const currentLevel = roleMap[role]?.[perm.id] || 'none';
              const isUpdating = updating === `${type}-${role}-${perm.id}`;

              return (
                <TableCell key={role} className="border-l border-border/50 px-2 py-4">
                  <div className="flex items-center justify-center">
                    <PermissionLevelControl
                      currentLevel={currentLevel}
                      isUpdating={isUpdating}
                      permissionName={perm.name}
                      roleLabel={ROLE_LABELS[role]}
                      onSetLevel={(level) => {
                        void setLevel(type, role, perm.id, level);
                      }}
                    />
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-title flex items-center gap-2 bg-transparent text-foreground">
            <Settings2 className="h-5 w-5" /> Контроль доступа
          </h2>
          <p className="text-caption">
            Модель прав 3-го уровня: <span className="font-bold text-muted-foreground/60">Выкл</span> /{' '}
            <span className="font-bold text-primary">Чтение</span> /{' '}
            <span className="font-bold text-brand">Полный</span>
          </p>
        </div>
      </div>

      <Tabs defaultValue="tenant" className="w-full">
        <TabsList className="mb-6 h-12 w-full rounded-2xl bg-muted p-1 sm:w-auto">
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

        <CardShell variant="card" shadow="md">
          <TabsContent value="tenant" className="m-0 overflow-x-auto">
            {renderMatrix('tenant', data.tenantRoles, data.tenantPermissions, data.tenantRoleMap)}
          </TabsContent>

          <TabsContent value="platform" className="m-0 overflow-x-auto">
            {renderMatrix('platform', data.platformRoles, data.platformPermissions, data.platformRoleMap)}
          </TabsContent>
        </CardShell>
      </Tabs>
    </div>
  );
}
