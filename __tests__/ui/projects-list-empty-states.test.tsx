import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { expect, test, vi, afterEach } from 'vitest';
import { ProjectsList } from '@/features/projects/list/components/projects-list';
import { ProjectListItem } from '@/features/projects/shared/types';

// Mock dependencies
vi.mock('@/components/ui/empty', () => ({
    Empty: ({ children }: { children: React.ReactNode }) => <div data-testid="empty-container">{children}</div>,
    EmptyContent: ({ children }: { children: React.ReactNode }) => <div data-testid="empty-content">{children}</div>,
    EmptyDescription: ({ children }: { children: React.ReactNode }) => <div data-testid="empty-description">{children}</div>,
    EmptyHeader: ({ children }: { children: React.ReactNode }) => <div data-testid="empty-header">{children}</div>,
    EmptyMedia: ({ children }: { children: React.ReactNode }) => <div data-testid="empty-media">{children}</div>,
    EmptyTitle: ({ children }: { children: React.ReactNode }) => <div data-testid="empty-title">{children}</div>,
}));

vi.mock('@/components/ui/button', () => ({
    Button: ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => (
        <button onClick={onClick}>{children}</button>
    ),
}));

vi.mock('lucide-react', () => ({
    FolderPlus: () => <svg data-testid="icon-folder-plus" />,
    SearchX: () => <svg data-testid="icon-search-x" />,
}));

// Mock child components to isolate ProjectsList logic
vi.mock('@/features/projects/list/components/project-card', () => ({
    ProjectCard: ({ project }: { project: ProjectListItem }) => (
        <div data-testid={`project-card-${project.id}`}>{project.name}</div>
    ),
}));

vi.mock('@/features/projects/list/components/project-row', () => ({
    ProjectRow: ({ project }: { project: ProjectListItem }) => (
        <div data-testid={`project-row-${project.id}`}>{project.name}</div>
    ),
}));

const mockProject: ProjectListItem = {
    id: '1',
    name: 'Project 1',
    slug: 'project-1',
    customerName: 'Customer 1',
    contractAmount: 1000,
    startDate: new Date(),
    endDate: new Date(),
    progress: 50,
    status: 'active',
};

afterEach(() => {
    cleanup();
});

test('renders "No projects yet" state when totalProjectsCount is 0', () => {
    const onCreate = vi.fn();
    render(
        <ProjectsList
            projects={[]}
            totalProjectsCount={0}
            viewMode="list"
            onCreate={onCreate}
            onDelete={vi.fn()}
            onEdit={vi.fn()}
        />
    );

    expect(screen.getByTestId('empty-title')).toHaveTextContent('Нет проектов');
    expect(screen.getByTestId('empty-description')).toHaveTextContent('Создайте свой первый проект, чтобы начать работу.');
    expect(screen.getByTestId('icon-folder-plus')).toBeInTheDocument();

    const createButton = screen.getByText('Создать проект');
    fireEvent.click(createButton);
    expect(onCreate).toHaveBeenCalled();
});

test('renders "No results found" state when totalProjectsCount > 0 but projects is empty', () => {
    render(
        <ProjectsList
            projects={[]}
            totalProjectsCount={5}
            viewMode="list"
            onDelete={vi.fn()}
            onEdit={vi.fn()}
        />
    );

    expect(screen.getByTestId('empty-title')).toHaveTextContent('Ничего не найдено');
    expect(screen.getByTestId('empty-description')).toHaveTextContent('Попробуйте изменить параметры поиска.');
    expect(screen.getByTestId('icon-search-x')).toBeInTheDocument();

    // Should NOT show create button
    expect(screen.queryByText('Создать проект')).not.toBeInTheDocument();
});

test('renders list of projects when projects are present (list view)', () => {
    render(
        <ProjectsList
            projects={[mockProject]}
            totalProjectsCount={1}
            viewMode="list"
            onDelete={vi.fn()}
            onEdit={vi.fn()}
        />
    );

    expect(screen.getByTestId(`project-row-${mockProject.id}`)).toBeInTheDocument();
    expect(screen.queryByTestId('empty-container')).not.toBeInTheDocument();
});

test('renders grid of projects when projects are present (grid view)', () => {
    render(
        <ProjectsList
            projects={[mockProject]}
            totalProjectsCount={1}
            viewMode="grid"
            onDelete={vi.fn()}
            onEdit={vi.fn()}
        />
    );

    expect(screen.getByTestId(`project-card-${mockProject.id}`)).toBeInTheDocument();
    expect(screen.queryByTestId('empty-container')).not.toBeInTheDocument();
});
