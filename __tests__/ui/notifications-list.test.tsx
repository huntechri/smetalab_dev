import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { NotificationsList } from '@/features/notifications/components/notifications-list';
import { NotificationPayload } from '@/features/notifications/components/types';

const notifications: NotificationPayload[] = [
  {
    id: 1,
    title: 'Приглашение в команду',
    description: 'Вас пригласили в команду «СметаLab».',
    createdAt: new Date().toISOString(),
    read: false,
  },
  {
    id: 2,
    title: 'Изменение роли',
    description: 'Ваша роль изменена на Менеджер.',
    createdAt: new Date(Date.now() - 3600 * 1000).toISOString(),
    read: true,
  },
];

describe('NotificationsList', () => {
  it('shows loading state', () => {
    render(<NotificationsList isLoading />);

    expect(screen.getByText('Загрузка уведомлений...')).toBeInTheDocument();
  });

  it('shows empty state when there are no notifications', () => {
    render(<NotificationsList notifications={[]} />);

    expect(screen.getByText('Нет новых уведомлений')).toBeInTheDocument();
    expect(screen.getByText('Вы прочитали всё важное')).toBeInTheDocument();
  });

  it('renders notifications and handles mark as read', () => {
    const onMarkAsRead = vi.fn();
    render(<NotificationsList notifications={notifications} onMarkAsRead={onMarkAsRead} />);

    expect(screen.getByText('Приглашение в команду')).toBeInTheDocument();
    expect(screen.getByText('Изменение роли')).toBeInTheDocument();
    expect(screen.getByText('Новое')).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText('Пометить как прочитанное: Приглашение в команду'));
    expect(onMarkAsRead).toHaveBeenCalledWith(1);
  });
});
