import React from 'react';
import { render, screen } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import Page from '@/app/(workspace)/app/projects/page';
import { ProjectRow } from '@/features/projects/components/project-row';

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

test('projects page uses desktop 4-column placeholders and 4-column grid layout classes', () => {
    mockedSearchParams = '';
    const { container } = render(<Page />);

    const placeholdersGrid = container.querySelector('.lg\\:grid-cols-4');
    expect(placeholdersGrid).toHaveClass('grid', 'grid-cols-1', 'gap-3', 'lg:grid-cols-4');

    const projectsGrid = container.querySelector('.grid.grid-cols-1.gap-4.lg\\:grid-cols-4');
    expect(projectsGrid).toHaveClass('grid', 'grid-cols-1', 'gap-4', 'lg:grid-cols-4');
});

test('list rows keep compact actions and smaller progress bar', () => {
    const onDelete = vi.fn();
    const { container } = render(
        <ProjectRow
            project={{
                id: 'north-park',
                name: 'ЖК «Северный парк»',
                customerName: 'ООО СеверСтрой',
                contractAmount: 84_300_000,
                startDate: '2025-01-10T00:00:00.000Z',
                endDate: '2025-06-18T00:00:00.000Z',
                progress: 62,
                status: 'active',
            }}
            onDelete={onDelete}
        />,
    );

    expect(container.querySelector('a[href="/app/projects/north-park"]')).toBeInTheDocument();
    expect(container.querySelector('a[href="/app/projects/north-park?mode=edit"]')).toBeInTheDocument();
    expect(container.querySelector('button[aria-label="Delete ЖК «Северный парк»"]')).toBeInTheDocument();

    const progressBars = container.querySelectorAll('.h-1.w-24');
    expect(progressBars.length).toBeGreaterThan(0);
});
