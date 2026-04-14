import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
    EstimateAccomplishmentScreen,
    EstimateDocsScreen,
    EstimateParametersScreen,
    EstimatePurchasesScreen,
} from '@/features/projects';

describe('Estimate placeholder screens', () => {
    it('renders docs screen', () => {
        render(<EstimateDocsScreen />);
        expect(screen.getByText('Документы сметы')).toBeInTheDocument();
    });

    it('renders parameters screen', () => {
        render(<EstimateParametersScreen />);
        expect(screen.getByText('Параметры сметы')).toBeInTheDocument();
    });

    it('renders purchases screen', () => {
        render(<EstimatePurchasesScreen />);
        expect(screen.getByText('Закупки по смете')).toBeInTheDocument();
    });

    it('renders accomplishment screen', () => {
        render(<EstimateAccomplishmentScreen />);
        expect(screen.getByText('Выполнение сметы')).toBeInTheDocument();
    });
});
