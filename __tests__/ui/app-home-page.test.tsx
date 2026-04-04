import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AppHomeScreen } from '@/features/dashboard';

describe('AppHomeScreen', () => {
    it('renders project-style summary cards and project dynamics chart', () => {
        render(
            <AppHomeScreen
                kpi={{
                    revenue: 150_000,
                    expense: 110_000,
                    profit: 40_000,
                    progress: 62,
                    remainingDays: 12,
                }}
                showDynamicsChart={true}
                dynamics={[
                    {
                        date: '2026-01-10',
                        receiptsFact: 1_450_000,
                        executionPlan: 1_200_000,
                        executionFact: 980_000,
                        procurementPlan: 650_000,
                        procurementFact: 520_000,
                    },
                ]}
            />
        );

        expect(screen.getByRole('heading', { level: 1, name: 'Сводка проекта' })).toBeInTheDocument();
        expect(screen.getByText('Приход')).toBeInTheDocument();
        expect(screen.getByText('Расход')).toBeInTheDocument();
        expect(screen.getByText('Прибыль')).toBeInTheDocument();
        expect(screen.getByText('Срок')).toBeInTheDocument();
        expect(screen.getByText((_, element) => element?.textContent === 'Динамика проекта')).toBeInTheDocument();

        expect(screen.queryByText('Фокус на сегодня')).not.toBeInTheDocument();
        expect(screen.queryByText('Команда')).not.toBeInTheDocument();
        expect(screen.queryByText('Отклонения')).not.toBeInTheDocument();
    });
});
