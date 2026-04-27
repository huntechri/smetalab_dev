import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  notifyEstimateCoefficientUpdated,
  notifyEstimatePurchasesMutated,
  notifyEstimateRowsMutated,
} from '@/features/projects/estimates/lib/estimate-client-events';
import { useEstimateExecutionController } from '@/features/projects/estimates/hooks/use-estimate-execution-controller';
import { useEstimateProcurementController } from '@/features/projects/estimates/hooks/use-estimate-procurement-controller';
import type { EstimateExecutionRow } from '@/features/projects/estimates/types/execution.dto';
import type { EstimateProcurementRow } from '@/shared/types/estimate-procurement';

const toastMock = vi.fn();
const routerRefreshMock = vi.fn();

const executionRepoMocks = vi.hoisted(() => ({
  list: vi.fn(),
  patch: vi.fn(),
  addExtraWork: vi.fn(),
}));

const procurementRepoMocks = vi.hoisted(() => ({
  list: vi.fn(),
}));

vi.mock('@/features/projects/estimates/repository/execution.actions', () => ({
  estimateExecutionActionsRepo: executionRepoMocks,
}));

vi.mock('@/features/projects/estimates/repository/procurement.actions', () => ({
  estimateProcurementActionsRepo: procurementRepoMocks,
}));

vi.mock('@/components/providers/use-app-toast', () => ({
  useAppToast: () => ({ toast: toastMock }),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: routerRefreshMock,
    push: vi.fn(),
    replace: vi.fn(),
  }),
}));

const estimateId = 'estimate-a';
const otherEstimateId = 'estimate-b';

function makeExecutionRow(overrides: Partial<EstimateExecutionRow> = {}): EstimateExecutionRow {
  return {
    id: 'execution-row-1',
    estimateRowId: 'estimate-row-1',
    source: 'from_estimate',
    status: 'not_started',
    code: '1',
    name: 'Демонтаж',
    unit: 'м2',
    plannedQty: 10,
    plannedPrice: 100,
    plannedSum: 1000,
    actualQty: 10,
    actualPrice: 100,
    actualSum: 1000,
    isCompleted: false,
    order: 100,
    ...overrides,
  };
}

function makeProcurementRow(overrides: Partial<EstimateProcurementRow> = {}): EstimateProcurementRow {
  return {
    materialName: 'Штукатурка',
    unit: 'меш',
    source: 'estimate',
    plannedQty: 10,
    plannedPrice: 500,
    plannedAmount: 5000,
    actualQty: 0,
    actualAvgPrice: 0,
    actualAmount: 0,
    qtyDelta: -10,
    amountDelta: -5000,
    purchaseCount: 0,
    lastPurchaseDate: null,
    ...overrides,
  };
}

describe('estimate stale-data refresh parity', () => {
  beforeEach(() => {
    toastMock.mockReset();
    routerRefreshMock.mockReset();
    executionRepoMocks.list.mockReset();
    executionRepoMocks.patch.mockReset();
    executionRepoMocks.addExtraWork.mockReset();
    procurementRepoMocks.list.mockReset();
  });

  it('reloads execution rows after base estimate rows mutate', async () => {
    const refreshedRows = [makeExecutionRow({ id: 'execution-row-refreshed', plannedQty: 12 })];
    executionRepoMocks.list.mockResolvedValue(refreshedRows);

    const { result, unmount } = renderHook(() =>
      useEstimateExecutionController({
        estimateId,
        initialRows: [makeExecutionRow()],
      }),
    );

    act(() => {
      notifyEstimateRowsMutated(estimateId);
    });

    await waitFor(() => {
      expect(executionRepoMocks.list).toHaveBeenCalledWith(estimateId);
      expect(result.current.rows).toEqual(refreshedRows);
    });

    unmount();
  });

  it('reloads execution rows after coefficient updates', async () => {
    const refreshedRows = [makeExecutionRow({ id: 'execution-row-coef', plannedPrice: 120 })];
    executionRepoMocks.list.mockResolvedValue(refreshedRows);

    const { result, unmount } = renderHook(() =>
      useEstimateExecutionController({
        estimateId,
        initialRows: [makeExecutionRow()],
      }),
    );

    act(() => {
      notifyEstimateCoefficientUpdated(estimateId);
    });

    await waitFor(() => {
      expect(executionRepoMocks.list).toHaveBeenCalledWith(estimateId);
      expect(result.current.rows).toEqual(refreshedRows);
    });

    unmount();
  });

  it('ignores execution invalidation events for another estimate', () => {
    const { unmount } = renderHook(() =>
      useEstimateExecutionController({
        estimateId,
        initialRows: [makeExecutionRow()],
      }),
    );

    act(() => {
      notifyEstimateRowsMutated(otherEstimateId);
      notifyEstimateCoefficientUpdated(otherEstimateId);
    });

    expect(executionRepoMocks.list).not.toHaveBeenCalled();

    unmount();
  });

  it('reloads procurement rows after base estimate rows mutate', async () => {
    const refreshedRows = [makeProcurementRow({ materialName: 'Грунтовка', plannedQty: 4 })];
    procurementRepoMocks.list.mockResolvedValue(refreshedRows);

    const { result, unmount } = renderHook(() =>
      useEstimateProcurementController({
        estimateId,
        initialRows: [makeProcurementRow()],
      }),
    );

    act(() => {
      notifyEstimateRowsMutated(estimateId);
    });

    await waitFor(() => {
      expect(procurementRepoMocks.list).toHaveBeenCalledWith(estimateId);
      expect(result.current.rows).toEqual(refreshedRows);
    });

    unmount();
  });

  it('reloads procurement rows after global purchase invalidation', async () => {
    const refreshedRows = [makeProcurementRow({ materialName: 'Шпаклевка', actualQty: 3 })];
    procurementRepoMocks.list.mockResolvedValue(refreshedRows);

    const { result, unmount } = renderHook(() =>
      useEstimateProcurementController({
        estimateId,
        initialRows: [makeProcurementRow()],
      }),
    );

    act(() => {
      notifyEstimatePurchasesMutated();
    });

    await waitFor(() => {
      expect(procurementRepoMocks.list).toHaveBeenCalledWith(estimateId);
      expect(result.current.rows).toEqual(refreshedRows);
    });

    unmount();
  });

  it('ignores procurement purchase events for another estimate', () => {
    const { unmount } = renderHook(() =>
      useEstimateProcurementController({
        estimateId,
        initialRows: [makeProcurementRow()],
      }),
    );

    act(() => {
      notifyEstimatePurchasesMutated(otherEstimateId);
    });

    expect(procurementRepoMocks.list).not.toHaveBeenCalled();

    unmount();
  });

  it('uses the shared visible-route refresh lifecycle for mounted estimate tabs', async () => {
    const refreshedExecutionRows = [makeExecutionRow({ id: 'execution-row-focus' })];
    const refreshedProcurementRows = [makeProcurementRow({ materialName: 'Краска' })];
    executionRepoMocks.list.mockResolvedValue(refreshedExecutionRows);
    procurementRepoMocks.list.mockResolvedValue(refreshedProcurementRows);

    const executionHook = renderHook(() =>
      useEstimateExecutionController({
        estimateId,
        initialRows: [makeExecutionRow()],
      }),
    );
    const procurementHook = renderHook(() =>
      useEstimateProcurementController({
        estimateId,
        initialRows: [makeProcurementRow()],
      }),
    );

    act(() => {
      window.dispatchEvent(new Event('focus'));
    });

    await waitFor(() => {
      expect(executionRepoMocks.list).toHaveBeenCalledWith(estimateId);
      expect(procurementRepoMocks.list).toHaveBeenCalledWith(estimateId);
      expect(executionHook.result.current.rows).toEqual(refreshedExecutionRows);
      expect(procurementHook.result.current.rows).toEqual(refreshedProcurementRows);
    });

    executionHook.unmount();
    procurementHook.unmount();
  });
});
