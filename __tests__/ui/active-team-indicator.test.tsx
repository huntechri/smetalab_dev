import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ActiveTeamIndicator } from '@/components/layout/active-team-indicator';
import { UserProvider } from '@/components/providers/permissions-provider';
import { Team, User } from '@/lib/data/db/schema';

const user: User = {
  id: 1,
  name: 'Анна',
  email: 'anna@example.com',
  passwordHash: 'hashed',
  platformRole: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
};

const team: Team = {
  id: 10,
  name: 'СметаLab',
  createdAt: new Date(),
  updatedAt: new Date(),
  stripeCustomerId: null,
  stripeSubscriptionId: null,
  stripeProductId: null,
  planName: null,
  subscriptionStatus: null,
};

const renderWithProvider = (teamValue: Team | null) =>
  render(
    <UserProvider permissions={[]} user={user} team={teamValue}>
      <ActiveTeamIndicator />
    </UserProvider>
  );

describe('ActiveTeamIndicator', () => {
  it('shows active team name', () => {
    renderWithProvider(team);

    expect(screen.getByText('СметаLab')).toBeInTheDocument();
  });

  it('shows missing team state', () => {
    renderWithProvider(null);

    expect(screen.getByText('Команда не выбрана')).toBeInTheDocument();
  });
});
