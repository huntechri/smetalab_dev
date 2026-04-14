import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { GuideScreen } from '@/features/guide';

describe('GuideScreen', () => {
    it('renders guide sections', () => {
        render(<GuideScreen />);

        expect(screen.getByRole('heading', { level: 1, name: 'Справочники' })).toBeInTheDocument();
        expect(screen.getByText('Работы')).toBeInTheDocument();
        expect(screen.getByText('Материалы')).toBeInTheDocument();
        expect(screen.getByText('Контрагенты')).toBeInTheDocument();
    });
});
