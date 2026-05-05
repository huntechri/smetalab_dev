'use client';

import { Badge } from '@/shared/ui/badge';
import { CardShell } from '@/shared/ui/card-shell';
import { LoadingState } from '@/shared/ui/states';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  StickyTableHeader,
} from '@/shared/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { Building2, Settings2, Users } from 'lucide-react';

import { primitiveVisualTypographyClassNames } from '@/shared/ui/primitive-surface';
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
    <Table>
      <StickyTableHeader>
        <TableRow variant="header">
          <TableHead variant="mutedMeta">
            Функциональная область
          </TableHead>
          {roles.map((role) => (
            <TableHead key={role} variant="roleLabel">
              <Badge variant="neutral" size="xs">
                {ROLE_LABELS[role]}
              </Badge>
            </TableHead>
          ))}
        </TableRow>
      </StickyTableHeader>
      <TableBody>
        {permissions.map((perm) => (
          <TableRow key={perm.id} variant="body">
            <TableCell variant="body">
              <div className="flex flex-col">
                <span className="text-sm font-semibold tracking-tight text-foreground">{perm.name}</span>
                <p className={`${primitiveVisualTypographyClassNames.mutedMeta} mt-1 max-w-xs`}>{perm.description}</p>
              </div>
            </TableCell>
            {roles.map((role) => {
              const currentLevel = roleMap[role]?.[perm.id] || 'none';
              const isUpdating = updating === `${type}-${role}-${perm.id}`;

              return (
                <TableCell key={role} variant="roleControl">
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
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
            <Settings2 className="h-5 w-5" /> Контроль доступа
          </h2>
          <p className={primitiveVisualTypographyClassNames.mutedMeta}>
            Модель прав 3-го уровня: <span className="font-bold text-muted-foreground/60">Выкл</span> /{' '}
            <span className="font-bold text-primary">Чтение</span> /{' '}
            <span className="font-bold text-brand">Полный</span>
          </p>
        </div>
      </div>

      <Tabs defaultValue="tenant">
        <TabsList>
          <TabsTrigger value="tenant">
            <Users className="mr-2 h-4 w-4" /> Роли команды
          </TabsTrigger>
          <TabsTrigger value="platform">
            <Building2 className="mr-2 h-4 w-4" /> Платформа
          </TabsTrigger>
        </TabsList>

        <CardShell shadow="md">
          <TabsContent value="tenant" variant="scroll">
            {renderMatrix('tenant', data.tenantRoles, data.tenantPermissions, data.tenantRoleMap)}
          </TabsContent>

          <TabsContent value="platform" variant="scroll">
            {renderMatrix('platform', data.platformRoles, data.platformPermissions, data.platformRoleMap)}
          </TabsContent>
        </CardShell>
      </Tabs>
    </div>
  );
}
