import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { PermissionsMatrix } from '@/features/permissions/components/permissions-matrix';

afterEach(() => {
  cleanup();
});

const mockData = {
  tenantPermissions: [
    {
      id: 1,
      code: 'projects.view',
      name: 'Проекты',
      description: 'Доступ к списку проектов',
      scope: 'tenant' as const,
    },
  ],
  platformPermissions: [
    {
      id: 2,
      code: 'billing.manage',
      name: 'Биллинг',
      description: 'Управление подпиской',
      scope: 'platform' as const,
    },
  ],
  tenantRoleMap: { admin: { 1: 'read' } },
  platformRoleMap: { superadmin: { 2: 'manage' } },
  tenantRoles: ['admin'],
  platformRoles: ['superadmin'],
};

describe('PermissionsMatrix', () => {
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

  it('renders matrix and submits level update', async () => {
    render(<PermissionsMatrix />);

    await waitFor(() => {
      expect(screen.getByText('Контроль доступа')).toBeInTheDocument();
      expect(screen.getByText('Проекты')).toBeInTheDocument();
      expect(screen.getByText('Админ')).toBeInTheDocument();
    });

    await userEvent.click(screen.getByRole('button', { name: 'Отключить Проекты для роли Админ' }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/admin/permissions',
        expect.objectContaining({ method: 'PUT' })
      );
    });
  });
});
