import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { UserSettingsPage } from '@/features/settings/components/user-settings-page';

vi.mock('@/app/(login)/actions', () => ({
  updateAccount: vi.fn(),
  updatePassword: vi.fn(),
}));

describe('UserSettingsPage', () => {
  it('renders personal cabinet with key sections and tenant fields', () => {
    render(
      <UserSettingsPage
        user={{
          id: 11,
          name: 'Иван Петров',
          email: 'ivan@example.com',
          teamRole: 'admin',
          platformRole: null,
        }}
        team={{ id: 5, name: 'ООО Смета' }}
        permissions={[
          { code: 'projects', level: 'manage' },
          { code: 'settings', level: 'read' },
        ]}
      />,
    );

    expect(screen.getByText('Личный кабинет')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Профиль' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Организация' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Безопасность' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Сохранить профиль' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: 'Организация' }));

    expect(screen.getByLabelText('Организация (тенант)')).toBeInTheDocument();
    expect(screen.getByLabelText('ID организации')).toBeInTheDocument();
    expect(screen.getByLabelText('Роль в организации')).toBeInTheDocument();
  });
});
