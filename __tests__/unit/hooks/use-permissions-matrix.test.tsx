import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { usePermissionsMatrix } from '@/features/permissions/hooks/usePermissionsMatrix';

const mockData = {
  tenantPermissions: [
    { id: 1, code: 'projects.view', name: 'Проекты', description: 'Доступ к списку проектов', scope: 'tenant' as const },
  ],
  platformPermissions: [],
  tenantRoleMap: { admin: { 1: 'read' } },
  platformRoleMap: {},
  tenantRoles: ['admin'],
  platformRoles: [],
};

describe('usePermissionsMatrix', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(global, 'fetch').mockImplementation(async (input, init) => {
      const url = typeof input === 'string' ? input : input.toString();

      if (url === '/api/admin/permissions' && (!init || init.method === 'GET')) {
        return new Response(JSON.stringify(mockData), { status: 200 });
      }

      if (url === '/api/admin/permissions' && init?.method === 'PUT') {
        return new Response(null, { status: 200 });
      }

      return new Response(null, { status: 404 });
    });
  });

  it('loads matrix data and updates a permission level', async () => {
    const { result } = renderHook(() => usePermissionsMatrix());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.data?.tenantPermissions).toHaveLength(1);
    });

    await result.current.setLevel('tenant', 'admin', 1, 'manage');

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/admin/permissions',
      expect.objectContaining({ method: 'PUT' })
    );
  });
});
