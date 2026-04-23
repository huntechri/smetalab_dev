import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { EstimateProcurement } from '@/features/projects/estimates/components/tabs/EstimateProcurement';
import type { EstimateProcurementRow } from '@/shared/types/estimate-procurement';

const repoMocks = vi.hoisted(() => ({
  list: vi.fn(),
}));

vi.mock('@/features/projects/estimates/repository/procurement.actions', () => ({
  estimateProcurementActionsRepo: repoMocks,
}));

const rows: EstimateProcurementRow[] = [
  {
    materialName: 'Штукатурка Ротбанд',
    unit: 'меш',
    source: 'estimate',
    plannedQty: 10,
    plannedPrice: 500,
    plannedAmount: 5000,
    actualQty: 8,
    actualAvgPrice: 550,
    actualAmount: 4400,
    qtyDelta: -2,
    amountDelta: -600,
    purchaseCount: 2,
    lastPurchaseDate: '2026-04-16T00:00:00.000Z',
  },
  {
    materialName: 'Грунтовка Ceresit',
    unit: 'шт',
    source: 'fact_only',
    plannedQty: 0,
    plannedPrice: 0,
    plannedAmount: 0,
    actualQty: 4,
    actualAvgPrice: 800,
    actualAmount: 3200,
    qtyDelta: 4,
    amountDelta: 3200,
    purchaseCount: 1,
    lastPurchaseDate: null,
  },
];

describe('EstimateProcurement cards', () => {
  beforeEach(() => {
    repoMocks.list.mockResolvedValue(rows);
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    repoMocks.list.mockReset();
  });

  it('renders procurement rows as cards and filters them', async () => {
    render(<EstimateProcurement estimateId="estimate-1" />);

    expect(await screen.findByText('Штукатурка Ротбанд')).toBeInTheDocument();
    expect(screen.getByText('Грунтовка Ceresit')).toBeInTheDocument();
    expect(screen.getByText('Только факт')).toBeInTheDocument();
    expect(screen.queryByText('Материал')).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Поиск закупок'), {
      target: { value: 'ceresit' },
    });

    expect(screen.queryByText('Штукатурка Ротбанд')).not.toBeInTheDocument();
    expect(screen.getByText('Грунтовка Ceresit')).toBeInTheDocument();
  });

  it('opens procurement export endpoint', async () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);

    render(<EstimateProcurement estimateId="estimate-1" />);

    await waitFor(() => expect(repoMocks.list).toHaveBeenCalledWith('estimate-1'));
    fireEvent.click(screen.getByRole('button', { name: /Экспорт Excel/i }));

    expect(openSpy).toHaveBeenCalledWith(
      '/api/estimates/estimate-1/export/procurement',
      '_blank',
      'noopener,noreferrer',
    );
  });
});
