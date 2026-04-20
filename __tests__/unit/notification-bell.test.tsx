import { render, screen, fireEvent } from '@testing-library/react';
import { NotificationBell } from '@/features/notifications/components/notification-bell';
import { describe, it, expect, vi, Mock } from 'vitest';

// Mock swr
vi.mock('swr', () => ({
    default: vi.fn(),
    mutate: vi.fn(),
}));

// Mock ResizeObserver for Tooltip
global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
};

import useSWR from 'swr';

describe('NotificationBell', () => {
    it('renders empty state correctly', async () => {
        (useSWR as unknown as Mock).mockReturnValue({
            data: [],
            isLoading: false,
        });

        render(<NotificationBell />);

        const bellButton = screen.getByRole('button', { name: "Уведомления" });
        fireEvent.click(bellButton);

        // Check for new empty state text
        expect(await screen.findByText('Нет новых уведомлений')).toBeInTheDocument();
        expect(screen.getByText('Вы прочитали всё важное')).toBeInTheDocument();
    });

    it('renders unread count in aria-label', () => {
        (useSWR as unknown as Mock).mockReturnValue({
            data: [
                { id: 1, title: 'Test 1', description: 'Desc 1', createdAt: new Date().toISOString(), read: false },
                { id: 2, title: 'Test 2', description: 'Desc 2', createdAt: new Date().toISOString(), read: false },
                { id: 3, title: 'Test 3', description: 'Desc 3', createdAt: new Date().toISOString(), read: true },
            ],
            isLoading: false,
        });

        render(<NotificationBell />);

        const bellButton = screen.getByRole('button', { name: "Уведомления: 2 непрочитанных" });
        expect(bellButton).toBeInTheDocument();
    });
});
