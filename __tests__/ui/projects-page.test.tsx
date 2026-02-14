import React from 'react';
import { render, screen } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import Page from '@/app/(workspace)/app/projects/page';
import { ProjectRow } from '@/features/projects/list/components/project-row';

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
        refresh: vi.fn(),
    }),
    redirect: vi.fn(),
}));

vi.mock('@/lib/data/projects/repo', () => ({
    getProjects: vi.fn(async () => [
        {
            id: 'uuid-1',
            slug: 'north-park',
            name: 'ЖК «Северный парк»',
            customerName: 'ООО СеверСтрой',
            contractAmount: 84300000,
            startDate: new Date('2025-01-10T00:00:00.000Z'),
            endDate: new Date('2025-06-18T00:00:00.000Z'),
            progress: 62,
            status: 'active',
        },
    ]),
}));

vi.mock('@/lib/data/db/queries', () => ({
    getTeamForUser: vi.fn(async () => ({ id: 1, name: 'Test Team' })),
    getCounterparties: vi.fn(async () => ({ data: [], count: 0 })),
}));

test('projects page renders heading and project data', async () => {
    mockedSearchParams = '';
    const PageComponent = await Page();
    render(PageComponent);

    expect(screen.getByRole('heading', { name: 'Проекты' })).toBeInTheDocument();
    expect(screen.getByText('Создать проект')).toBeInTheDocument();
    expect(screen.getByLabelText('Поиск проектов')).toBeInTheDocument();
    expect(screen.getByText('ЖК «Северный парк»')).toBeInTheDocument();
    expect(screen.getByText('ООО СеверСтрой')).toBeInTheDocument();
});

test('projects page uses 4-column grid layout classes', async () => {
    mockedSearchParams = '';
    const PageComponent = await Page();
    const { container } = render(PageComponent);

    const projectsGrid = container.querySelector('.grid.grid-cols-1.gap-4.lg\\:grid-cols-4');
    expect(projectsGrid).toBeInTheDocument();
    expect(projectsGrid).toHaveClass('grid', 'grid-cols-1', 'gap-4', 'lg:grid-cols-4');
});

test('list rows render correctly', () => {
    const onDelete = vi.fn();
    const onEdit = vi.fn();
    const { container } = render(
        <ProjectRow
            project={{
                id: 'uuid-1',
                slug: 'north-park',
                name: 'ЖК «Северный парк»',
                customerName: 'ООО СеверСтрой',
                contractAmount: 84300000,
                startDate: '2025-01-10T00:00:00.000Z',
                endDate: '2025-06-18T00:00:00.000Z',
                progress: 62,
                status: 'active',
            }}
            onDelete={onDelete}
            onEdit={onEdit}
        />,
    );

    // Link to project detail page
    expect(container.querySelector('a[href="/app/projects/north-park"]')).toBeInTheDocument();

    // Edit and Delete buttons exist (3 action buttons: open, edit, delete)
    const actionButtons = container.querySelectorAll('button');
    expect(actionButtons.length).toBeGreaterThanOrEqual(2);

    // Progress bar with compact height
    const progressBar = container.querySelector('.h-1.w-24');
    expect(progressBar).toBeInTheDocument();
});
