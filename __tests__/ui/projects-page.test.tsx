import React from 'react';
import { render, screen } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import Page from '@/app/(workspace)/app/projects/page';

let mockedSearchParams = '';
const { MockNextLink } = vi.hoisted(() => ({
    MockNextLink: ({
        href,
        children,
        prefetch: _prefetch,
        ...props
    }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; children: React.ReactNode; prefetch?: boolean }) => (
        <a href={href} {...props}>{children}</a>
    ),
}));

vi.mock('next/link', () => ({
    default: MockNextLink,
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

test('projects page uses responsive grid layout classes for cards', async () => {
    mockedSearchParams = '';
    const PageComponent = await Page();
    const { container } = render(PageComponent);

    const projectsGrid = Array.from(container.querySelectorAll('div')).find((element) => {
        const className = typeof element.className === 'string' ? element.className : '';

        return className.includes('grid')
            && className.includes('grid-cols-1')
            && className.includes('gap-4')
            && className.includes('md:grid-cols-2')
            && className.includes('xl:grid-cols-3')
            && className.includes('2xl:grid-cols-4');
    });

    expect(projectsGrid).toBeInTheDocument();
    expect(projectsGrid).toHaveClass(
        'grid',
        'grid-cols-1',
        'gap-4',
        'md:grid-cols-2',
        'xl:grid-cols-3',
        '2xl:grid-cols-4',
    );
});
