import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserMenu } from '@/components/layout/user-menu';
import type { User } from '@/lib/data/db/schema';
import type { ReactNode } from 'react';

const pushMock = vi.fn();

const { contextState, hasPermissionMock } = vi.hoisted(() => ({
  contextState: {
    user: null as User | null,
    loading: false,
  },
  hasPermissionMock: vi.fn(() => false),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: pushMock,
    refresh: vi.fn(),
  }),
  usePathname: () => '/app',
}));

vi.mock('@/shared/hooks/use-permissions', () => ({
  usePermissions: () => ({
    hasPermission: hasPermissionMock,
  }),
}));

vi.mock('@/components/providers/permissions-provider', () => ({
  useUserContext: () => ({
    user: contextState.user,
    loading: contextState.loading,
    permissions: [],
    team: null,
  }),
}));

vi.mock('@/app/(login)/actions', () => ({
  signOut: vi.fn(),
}));

vi.mock('@repo/ui', () => ({
  Button: ({ children, onClick }: { children: ReactNode; onClick?: () => void }) => (
    <button type="button" onClick={onClick}>{children}</button>
  ),
  DropdownMenu: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DropdownMenuTrigger: ({ children }: { children: ReactNode }) => <>{children}</>,
  DropdownMenuContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DropdownMenuItem: ({ children, onClick }: { children: ReactNode; onClick?: () => void }) => (
    <button type="button" onClick={onClick}>{children}</button>
  ),
  DropdownMenuLabel: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DropdownMenuSeparator: () => <hr />,
  Avatar: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  AvatarFallback: ({ children }: { children: ReactNode }) => <span>{children}</span>,
  AvatarImage: ({ src, alt }: { src?: string; alt?: string }) => <img src={src} alt={alt} />,
}));

describe('UserMenu', () => {
  beforeEach(() => {
    cleanup();
    pushMock.mockClear();
    hasPermissionMock.mockReset();
    hasPermissionMock.mockReturnValue(false);
  });

  it('shows platform navigation item for superadmin even without explicit platform permission', async () => {
    contextState.user = {
      id: 1,
      name: 'Super Admin',
      email: 'superadmin@example.com',
      passwordHash: null,
      platformRole: 'superadmin',
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    } as User;
    contextState.loading = false;

    render(<UserMenu />);

    const platformItem = await screen.findByText('Платформа');
    expect(platformItem).toBeInTheDocument();

    fireEvent.click(platformItem);
    expect(pushMock).toHaveBeenCalledWith('/dashboard');
  });

  it('hides platform navigation item for regular users without permission', async () => {
    contextState.user = {
      id: 2,
      name: 'Regular User',
      email: 'user@example.com',
      passwordHash: null,
      platformRole: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    } as User;
    contextState.loading = false;

    render(<UserMenu />);

    expect(screen.queryByText('Платформа')).not.toBeInTheDocument();
  });
});
