import React from 'react';
import { render, screen } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import Page from '@/app/(workspace)/app/projects/page';

vi.mock('next/link', () => ({
    default: ({ children, href }: { children: React.ReactNode; href: string }) => (
        <a href={href}>{children}</a>
    ),
}));

vi.mock('next/navigation', () => ({
    useSearchParams: () => new URLSearchParams(''),
    usePathname: () => '/app/projects',
    useRouter: () => ({
        replace: vi.fn(),
    }),
}));

test('projects page renders toolbar and project cards', () => {
    render(<Page />);

    expect(screen.getByRole('heading', { name: 'Проекты' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Create project' })).toBeInTheDocument();
    expect(screen.getByLabelText('Search projects')).toBeInTheDocument();
    expect(screen.getByText('ЖК «Северный парк»')).toBeInTheDocument();
    expect(screen.getByText('ООО СеверСтрой')).toBeInTheDocument();
});
