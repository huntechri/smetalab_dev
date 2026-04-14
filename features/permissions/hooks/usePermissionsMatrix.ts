import { useCallback, useEffect, useState } from 'react';

export interface Permission {
  id: number;
  code: string;
  name: string;
  description: string | null;
  scope: 'platform' | 'tenant';
}

export interface PermissionsData {
  tenantPermissions: Permission[];
  platformPermissions: Permission[];
  tenantRoleMap: Record<string, Record<number, string>>;
  platformRoleMap: Record<string, Record<number, string>>;
  tenantRoles: string[];
  platformRoles: string[];
}

export function usePermissionsMatrix() {
  const [data, setData] = useState<PermissionsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchPermissions = useCallback(async () => {
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
  }, []);

  const setLevel = useCallback(async (
    type: 'tenant' | 'platform',
    role: string,
    permissionId: number,
    level: 'none' | 'read' | 'manage'
  ) => {
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
  }, [fetchPermissions]);

  useEffect(() => {
    void fetchPermissions();
  }, [fetchPermissions]);

  return { data, loading, updating, setLevel };
}
