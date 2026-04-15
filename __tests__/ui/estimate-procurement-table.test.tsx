import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EstimateProcurementTable } from '@/features/projects/estimates/components/procurement/EstimateProcurementTable.client';
import type { EstimateProcurementRow } from '@/shared/types/estimate-procurement';

const mockData: EstimateProcurementRow[] = [
    {
        materialName: 'Material A',
        unit: 'шт',
        source: 'estimate',
        plannedQty: 10,
        plannedPrice: 100,
        plannedAmount: 1000,
        actualQty: 5,
        actualAvgPrice: 110,
        actualAmount: 550,
        qtyDelta: 5,
        amountDelta: 450,
        purchaseCount: 1,
        lastPurchaseDate: '2024-01-01',
    },
    {
        materialName: 'Material B',
        unit: 'м',
        source: 'fact_only',
        plannedQty: 0,
        plannedPrice: 0,
        plannedAmount: 0,
        actualQty: 2,
        actualAvgPrice: 200,
        actualAmount: 400,
        qtyDelta: -2,
        amountDelta: -400,
        purchaseCount: 1,
        lastPurchaseDate: '2024-01-02',
    },
];

describe('EstimateProcurementTable', () => {
    it('renders data correctly', () => {
        render(<EstimateProcurementTable data={mockData} />);

        expect(screen.getAllByText('Material A')).toBeDefined();
        expect(screen.getAllByText('Material B')).toBeDefined();
        expect(screen.getAllByText('шт')).toBeDefined();
        // Just check that we found at least one instance of the expected amounts
        expect(screen.getAllByText(/1.*000/)).toBeDefined(); 
    });

    it('displays totals in footer', () => {
        render(<EstimateProcurementTable data={mockData} />);

        // Totals:
        // Planned: 1000
        // Actual: 550 + 400 = 950
        // Delta: 450 + (-400) = 50
        
        expect(screen.getAllByText(/1.*000/)).toBeDefined(); 
        expect(screen.getAllByText(/950/)).toBeDefined();
        expect(screen.getAllByText(/50/)).toBeDefined();
    });

    it('shows empty message when no data', () => {
        render(<EstimateProcurementTable data={[]} />);
        expect(screen.getByText('Нет данных для отображения.')).toBeDefined();
    });
});
