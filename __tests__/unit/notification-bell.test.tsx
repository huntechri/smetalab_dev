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
        (useSWR as unknown as Mock).mockImplementation((key: string | null) => {
            if (key === '/api/notifications/unread-count') {
                return { data: { unreadCount: 0 }, isLoading: false };
            }

            if (key === '/api/notifications') {
                return { data: [], isLoading: false };
            }

            return { data: undefined, isLoading: false };
        });

        render(<NotificationBell />);

        const bellButton = screen.getByRole('button', { name: "Уведомления" });
        fireEvent.click(bellButton);

        // Check for new empty state text
        expect(await screen.findByText('Нет новых уведомлений')).toBeInTheDocument();
        expect(screen.getByText('Вы прочитали всё важное')).toBeInTheDocument();
    });

    it('renders unread count before opening notifications list', () => {
        (useSWR as unknown as Mock).mockImplementation((key: string | null) => {
            if (key === '/api/notifications/unread-count') {
                return { data: { unreadCount: 2 }, isLoading: false };
            }

            return { data: undefined, isLoading: false };
        });

        render(<NotificationBell />);

        const bellButton = screen.getByRole('button', { name: "Уведомления: 2 непрочитанных" });
        expect(bellButton).toBeInTheDocument();
        expect(useSWR).toHaveBeenCalledWith(null, expect.any(Function));
        expect(useSWR).toHaveBeenCalledWith('/api/notifications/unread-count', expect.any(Function));
    });
});
