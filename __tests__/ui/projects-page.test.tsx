import { render, screen } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import Page from '@/app/(workspace)/app/projects/page';

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

test('projects page renders header and list', () => {
  render(<Page />);
  expect(screen.getByRole('heading', { name: 'Проекты' })).toBeInTheDocument();
  expect(screen.getByText('Портфель')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Создать проект' })).toBeInTheDocument();
  expect(screen.getByText('ЖК «Северный парк»')).toBeInTheDocument();
});
