import { fireEvent, render, screen, cleanup } from '@testing-library/react';
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
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

vi.mock('@repo/ui', () => ({
  SidebarGroup: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SidebarGroupContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SidebarGroupLabel: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SidebarMenu: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SidebarMenuButton: ({ children, isActive, ...props }: { children: React.ReactNode; isActive?: boolean }) => (
    <button data-active={isActive} {...props}>{children}</button>
  ),
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

  afterEach(() => {
    cleanup();
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

describe('SidebarNav Active State', () => {
    afterEach(() => {
        cleanup();
    });

    it('is active for exact matches', () => {
        render(
            <SidebarNav
                label="Навигация"
                pathname="/app/projects"
                items={[
                    { title: 'Проекты', url: '/app/projects', icon: Home },
                ]}
            />
        );
        const button = screen.getByRole('button', { name: /Проекты/i });
        expect(button.getAttribute('data-active')).toBe('true');
    });

    it('is active for nested routes', () => {
        render(
            <SidebarNav
                label="Навигация"
                pathname="/app/projects/123"
                items={[
                    { title: 'Проекты', url: '/app/projects', icon: Home },
                ]}
            />
        );
        const button = screen.getByRole('button', { name: /Проекты/i });
        expect(button.getAttribute('data-active')).toBe('true');
    });

    it('is NOT active for nested routes when it is the root /app', () => {
        render(
            <SidebarNav
                label="Навигация"
                pathname="/app/projects"
                items={[
                    { title: 'Главная', url: '/app', icon: Home },
                ]}
            />
        );
        const button = screen.getByRole('button', { name: /Главная/i });
        expect(button.getAttribute('data-active')).toBe('false');
    });

    it('is active for root /app when pathname is exactly /app', () => {
        render(
            <SidebarNav
                label="Навигация"
                pathname="/app"
                items={[
                    { title: 'Главная', url: '/app', icon: Home },
                ]}
            />
        );
        const button = screen.getByRole('button', { name: /Главная/i });
        expect(button.getAttribute('data-active')).toBe('true');
    });
});
