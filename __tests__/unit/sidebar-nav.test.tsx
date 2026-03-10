import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Home } from 'lucide-react';
import { SidebarNav } from '@/components/navigation/sidebar-nav';

const prefetchSpy = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    prefetch: prefetchSpy,
  }),
}));

vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    prefetch: _prefetch,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; children: React.ReactNode; prefetch?: boolean }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock('@/shared/ui/sidebar', () => ({
  SidebarGroup: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SidebarGroupContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SidebarGroupLabel: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SidebarMenu: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SidebarMenuButton: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SidebarMenuItem: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useSidebar: () => ({
    isMobile: false,
    setOpenMobile: vi.fn(),
  }),
}));

describe('SidebarNav', () => {
  beforeEach(() => {
    prefetchSpy.mockReset();
  });

  it('prefetches route when nav item is hovered or focused', () => {
    render(
      <SidebarNav
        label="Навигация"
        pathname="/app"
        items={[
          { title: 'Главная', url: '/app', icon: Home },
        ]}
      />
    );

    const link = screen.getByRole('link', { name: 'Главная' });

    fireEvent.mouseEnter(link);
    fireEvent.focus(link);

    expect(prefetchSpy).toHaveBeenCalledWith('/app');
    expect(prefetchSpy).toHaveBeenCalledTimes(2);
  });
});
