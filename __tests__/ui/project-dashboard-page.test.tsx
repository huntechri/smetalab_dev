import React from 'react';
import { render, screen } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import Page from '@/app/(workspace)/app/projects/[projectId]/page';

const projectDashboardSpy = vi.fn(({ project }: { project: { name: string }; estimates: Array<{ id: string }> }) => (
    <div data-testid="project-dashboard">{project.name}</div>
));

vi.mock('@/features/projects', () => ({
    ProjectDashboard: (props: { project: { name: string }; estimates: Array<{ id: string }> }) => projectDashboardSpy(props),
}));

vi.mock('next/navigation', () => ({
    redirect: vi.fn(),
    notFound: vi.fn(),
}));

vi.mock('@/lib/data/db/queries', () => ({
    getTeamForUser: vi.fn(async () => ({ id: 1, name: 'Test Team' })),
}));

vi.mock('@/lib/data/projects/repo', () => ({
    getProjectBySlug: vi.fn(async () => ({
        id: 'uuid-1',
        slug: 'north-park',
        name: 'ЖК «Северный парк»',
        customerName: 'ООО СеверСтрой',
        counterpartyId: 'f95e8f2a-918e-4594-95fb-c74c6ca5bdbf',
        contractAmount: 84300000,
        startDate: new Date('2025-01-10T00:00:00.000Z'),
        endDate: new Date('2025-06-18T00:00:00.000Z'),
        progress: 62,
        status: 'active',
    })),
}));

vi.mock('@/lib/data/estimates/repo', () => ({
    getEstimatesByProjectId: vi.fn(async () => [
        { id: 'est-uuid', name: 'Смета 1', slug: 'smeta-1' }
    ]),
}));

test('project dashboard page maps project data and renders feature screen', async () => {
    const PageComponent = await Page({
        params: Promise.resolve({ projectId: 'north-park' }),
    });

    render(PageComponent as React.ReactElement);

    expect(screen.getByTestId('project-dashboard')).toHaveTextContent('ЖК «Северный парк»');
    expect(projectDashboardSpy).toHaveBeenCalledTimes(1);
    expect(projectDashboardSpy.mock.calls[0]?.[0]?.project).toMatchObject({
        id: 'uuid-1',
        slug: 'north-park',
        name: 'ЖК «Северный парк»',
        customerName: 'ООО СеверСтрой',
        progress: 62,
        status: 'active',
    });
    expect(projectDashboardSpy.mock.calls[0]?.[0]?.estimates).toEqual([
        { id: 'est-uuid', name: 'Смета 1', slug: 'smeta-1' }
    ]);
});
