import { render, screen, cleanup } from '@testing-library/react';
import { ProjectsList } from '@/features/projects/list/components/projects-list';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { ProjectListItem } from '@/features/projects/shared/types';
import { ComponentProps } from 'react';

// Explicit cleanup for this environment
afterEach(() => {
    cleanup();
});

// Mock Lucide icons
vi.mock('lucide-react', () => ({
    FolderKanban: (props: ComponentProps<'div'>) => <div data-testid="folder-kanban-icon" {...props} />,
    LayoutGrid: () => <div />,
    List: () => <div />,
    Edit: () => <div />,
    ExternalLink: () => <div />,
    Trash2: () => <div />,
}));

// Mock ProjectCard and ProjectRow
vi.mock('@/features/projects/list/components/project-card', () => ({
    ProjectCard: () => <div data-testid="project-card" />,
}));
vi.mock('@/features/projects/list/components/project-row', () => ({
    ProjectRow: () => <div data-testid="project-row" />,
}));

describe('ProjectsList', () => {
    it('renders empty state when projects list is empty', () => {
        render(
            <ProjectsList
                projects={[]}
                viewMode="grid"
                onDelete={() => {}}
                onEdit={() => {}}
            />
        );

        // Check text
        expect(screen.getByText('Проекты не найдены')).toBeInTheDocument();
        expect(screen.getByText(/По вашему запросу ничего не найдено/)).toBeInTheDocument();

        // Check icon
        expect(screen.getByTestId('folder-kanban-icon')).toBeInTheDocument();
    });

    it('renders project list when projects are provided', () => {
        const mockProjects: ProjectListItem[] = [
            {
                id: '1',
                name: 'Test Project',
                status: 'active',
                progress: 50,
                slug: 'test-project',
                customerName: 'Customer',
                contractAmount: 1000,
                startDate: '2023-01-01',
                endDate: '2023-12-31',
                counterpartyId: 'c1'
            },
        ];

        render(
            <ProjectsList
                projects={mockProjects}
                viewMode="grid"
                onDelete={() => {}}
                onEdit={() => {}}
            />
        );

        expect(screen.queryByText('Проекты не найдены')).not.toBeInTheDocument();
        expect(screen.getByTestId('project-card')).toBeInTheDocument();
    });
});
