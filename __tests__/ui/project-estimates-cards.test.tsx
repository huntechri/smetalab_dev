import React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ProjectEstimatesCards } from '@/features/projects/dashboard/components/ProjectEstimatesCards';
import type { EstimateMeta } from '@/features/projects/estimates/types/dto';

vi.mock('@/shared/ui/badge', () => ({
  Badge: ({ children, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
    <span {...props}>{children}</span>
  ),
}));

vi.mock('@/shared/ui/button', () => ({
  Button: ({
    children,
    asChild: _asChild,
    ...props
  }: React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }) => (
    <button {...props}>{children}</button>
  ),
}));

vi.mock('@/shared/ui/table-empty-state', () => ({
  TableEmptyState: ({
    title,
    description,
    action,
  }: {
    title: string;
    description: string;
    action?: React.ReactNode;
  }) => (
    <div>
      <p>{title}</p>
      <p>{description}</p>
      {action}
    </div>
  ),
}));

vi.mock('@/shared/ui/alert-dialog', () => ({
  AlertDialog: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  AlertDialogAction: ({
    children,
    ...props
  }: React.ButtonHTMLAttributes<HTMLButtonElement>) => <button {...props}>{children}</button>,
  AlertDialogCancel: ({ children }: { children: React.ReactNode }) => <button>{children}</button>,
  AlertDialogContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  AlertDialogDescription: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
  AlertDialogFooter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  AlertDialogHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  AlertDialogTitle: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
  AlertDialogTrigger: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

const estimates: EstimateMeta[] = [
  {
    id: 'estimate-1',
    projectId: 'project-1',
    name: 'Черновая отделка',
    slug: 'chernovaya-otdelka',
    status: 'draft',
    total: 150000,
    createdAt: '2026-04-01T00:00:00.000Z',
    updatedAt: '2026-04-02T00:00:00.000Z',
  },
];

afterEach(() => {
  cleanup();
});

describe('ProjectEstimatesCards', () => {
  it('renders estimate cards with detail links and create action', () => {
    const onCreateEstimate = vi.fn();

    render(
      <ProjectEstimatesCards
        estimates={estimates}
        projectSlug="otdelka-j1ss"
        onCreateEstimate={onCreateEstimate}
        onChangeStatus={vi.fn()}
        onDeleteEstimate={vi.fn()}
      />,
    );

    expect(screen.getByRole('link', { name: 'Черновая отделка' })).toHaveAttribute(
      'href',
      '/app/projects/otdelka-j1ss/estimates/chernovaya-otdelka',
    );
    expect(screen.getByText('150 000 ₽')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Создать смету' }));

    expect(onCreateEstimate).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('button', { name: /дублировать|копировать/i })).not.toBeInTheDocument();
  });

  it('shows empty state create action', () => {
    const onCreateEstimate = vi.fn();

    render(
      <ProjectEstimatesCards
        estimates={[]}
        projectSlug="otdelka-j1ss"
        onCreateEstimate={onCreateEstimate}
        onChangeStatus={vi.fn()}
        onDeleteEstimate={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByText('Создать смету'));

    expect(screen.getByText('Нет смет в проекте')).toBeInTheDocument();
    expect(onCreateEstimate).toHaveBeenCalledTimes(1);
  });
});
