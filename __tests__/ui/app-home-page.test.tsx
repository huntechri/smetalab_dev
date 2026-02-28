import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AppHomeScreen } from '@/features/dashboard';

describe('AppHomeScreen', () => {
    it('renders main dashboard sections', () => {
        render(<AppHomeScreen />);

        expect(screen.getByRole('heading', { level: 1, name: 'Операционный центр' })).toBeInTheDocument();
        expect(screen.getByRole('heading', { level: 2, name: 'Сводка' })).toBeInTheDocument();
        expect(screen.getByRole('heading', { level: 2, name: 'Фокус на сегодня' })).toBeInTheDocument();
        expect(screen.getByRole('heading', { level: 2, name: 'Команда' })).toBeInTheDocument();
        expect(screen.getByRole('heading', { level: 2, name: 'Отклонения' })).toBeInTheDocument();
    });
});
