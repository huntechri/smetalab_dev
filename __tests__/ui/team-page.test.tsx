import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { TeamScreen } from '@/features/team';

const { teamData } = vi.hoisted(() => {
  return {
    teamData: {
      id: 1,
      name: 'СметаLab',
      teamMembers: [
        {
          id: 10,
          role: 'admin',
          joinedAt: '2024-02-10T12:00:00.000Z',
          user: {
            id: 100,
            name: 'Анна Смирнова',
            email: 'anna@example.com',
          },
        },
        {
          id: 11,
          role: 'estimator',
          joinedAt: '2024-03-01T08:30:00.000Z',
          user: {
            id: 101,
            name: 'Илья Петров',
            email: 'ilya@example.com',
          },
        },
      ],
    },
  };
});

vi.mock('swr', () => ({
  default: () => ({ data: teamData, isLoading: false }),
  mutate: vi.fn(),
}));

vi.mock('@/hooks/use-permissions', () => ({
  usePermissions: () => ({ hasPermission: () => true }),
}));

vi.mock('@/app/(login)/actions', () => ({
  inviteTeamMember: vi.fn(),
  removeTeamMember: vi.fn(),
}));

describe('TeamScreen', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders team summary and members', () => {
    render(<TeamScreen />);

    expect(screen.getByRole('heading', { name: 'СметаLab' })).toBeInTheDocument();
    expect(screen.getByText(/2 участника/)).toBeInTheDocument();
    expect(screen.getByText('Анна Смирнова')).toBeInTheDocument();
    expect(screen.getByText('Илья Петров')).toBeInTheDocument();
  });

  it('filters members by role and search query', () => {
    render(<TeamScreen />);

    fireEvent.click(screen.getByRole('button', { name: 'Фильтр: Администратор' }));
    expect(screen.getByText('Анна Смирнова')).toBeInTheDocument();
    expect(screen.queryByText('Илья Петров')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Фильтр: Все' }));
    fireEvent.change(screen.getByLabelText('Поиск'), { target: { value: 'ilya' } });
    expect(screen.getByText('Илья Петров')).toBeInTheDocument();
    expect(screen.queryByText('Анна Смирнова')).not.toBeInTheDocument();
  });
});