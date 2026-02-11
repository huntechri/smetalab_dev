import React from 'react';
import { render, screen } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import Page from '@/app/(workspace)/app/projects/page';

let mockedSearchParams = '';

vi.mock('next/link', () => ({
    default: ({ children, href }: { children: React.ReactNode; href: string }) => (
        <a href={href}>{children}</a>
    ),
}));

vi.mock('next/navigation', () => ({
    useSearchParams: () => new URLSearchParams(mockedSearchParams),
    usePathname: () => '/app/projects',
    useRouter: () => ({
        replace: vi.fn(),
    }),
}));

test('projects page renders toolbar and project cards', () => {
    mockedSearchParams = '';
    render(<Page />);

    expect(screen.getByRole('heading', { name: 'Проекты' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Create project' })).toBeInTheDocument();
    expect(screen.getByLabelText('Search projects')).toBeInTheDocument();
    expect(screen.getByText('ЖК «Северный парк»')).toBeInTheDocument();
    expect(screen.getByText('ООО СеверСтрой')).toBeInTheDocument();
});

test('projects page uses desktop 4-column placeholders and 5-column grid layout classes', () => {
    mockedSearchParams = '';
    const { container } = render(<Page />);

    const placeholdersGrid = container.querySelector('.lg\\:grid-cols-4');
    expect(placeholdersGrid).toHaveClass('grid', 'grid-cols-1', 'gap-3', 'lg:grid-cols-4');

    const projectsGrid = container.querySelector('.lg\\:grid-cols-5');
    expect(projectsGrid).toHaveClass('grid', 'grid-cols-1', 'gap-3', 'lg:grid-cols-5');
});

test('list view uses compact actions menu trigger', () => {
    mockedSearchParams = 'view=list';
    render(<Page />);

    expect(screen.getAllByLabelText(/Open actions menu for/i).length).toBeGreaterThan(0);
});
