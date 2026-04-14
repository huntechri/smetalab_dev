import type React from 'react';
import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { useEstimateMutations } from '@/features/projects/estimates/hooks/use-estimate-mutations';
import type { EstimateMeta } from '@/features/projects/estimates/types/dto';

const toastMock = vi.fn();

const repoMocks = vi.hoisted(() => ({
  updateStatus: vi.fn(),
  delete: vi.fn(),
}));

vi.mock('@/features/projects/estimates/repository/estimates.actions', () => ({
  estimatesActionRepo: repoMocks,
}));

vi.mock('@/components/providers/use-app-toast', () => ({
  useAppToast: () => ({ toast: toastMock }),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: vi.fn(),
    push: vi.fn(),
    replace: vi.fn(),
  }),
}));

const makeRows = (): EstimateMeta[] => [
  {
    id: 'est-1',
    projectId: 'proj-1',
    name: 'Смета 1',
    slug: 'smeta-1',
    status: 'draft',
    total: 100,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

describe('useEstimateMutations', () => {
  beforeEach(() => {
    repoMocks.updateStatus.mockReset();
    repoMocks.delete.mockReset();
    toastMock.mockReset();
  });

  it('updates estimate status', async () => {
    repoMocks.updateStatus.mockResolvedValue({ status: 'approved' });
    const rowsRef = { current: makeRows() };
    const setRows: React.Dispatch<React.SetStateAction<EstimateMeta[]>> = (value) => {
      rowsRef.current = typeof value === 'function' ? value(rowsRef.current) : value;
    };

    const { result } = renderHook(() => useEstimateMutations());

    await act(async () => {
      await result.current.updateEstimateStatus({
        estimateId: 'est-1',
        currentStatus: 'draft',
        nextStatus: 'approved',
        setRows,
      });
    });

    expect(repoMocks.updateStatus).toHaveBeenCalledWith('est-1', 'approved');
    expect(rowsRef.current[0].status).toBe('approved');
  });


  it('skips update when next status equals current status', async () => {
    const rowsRef = { current: makeRows() };
    const setRows: React.Dispatch<React.SetStateAction<EstimateMeta[]>> = (value) => {
      rowsRef.current = typeof value === 'function' ? value(rowsRef.current) : value;
    };

    const { result } = renderHook(() => useEstimateMutations());

    await act(async () => {
      await result.current.updateEstimateStatus({
        estimateId: 'est-1',
        currentStatus: 'draft',
        nextStatus: 'draft',
        setRows,
      });
    });

    expect(repoMocks.updateStatus).not.toHaveBeenCalled();
    expect(rowsRef.current[0].status).toBe('draft');
  });

  it('rolls back estimate status on failure and shows destructive toast', async () => {
    repoMocks.updateStatus.mockRejectedValue(new Error('Ошибка обновления'));
    const rowsRef = { current: makeRows() };
    const setRows: React.Dispatch<React.SetStateAction<EstimateMeta[]>> = (value) => {
      rowsRef.current = typeof value === 'function' ? value(rowsRef.current) : value;
    };

    const { result } = renderHook(() => useEstimateMutations());

    await act(async () => {
      await result.current.updateEstimateStatus({
        estimateId: 'est-1',
        currentStatus: 'draft',
        nextStatus: 'approved',
        setRows,
      });
    });

    expect(rowsRef.current[0].status).toBe('draft');
    expect(toastMock).toHaveBeenCalledWith(
      expect.objectContaining({
        variant: 'destructive',
        title: 'Ошибка',
      }),
    );
  });

  it('deletes estimate and updates rows', async () => {
    repoMocks.delete.mockResolvedValue({ projectId: 'proj-1' });
    const rowsRef = { current: makeRows() };
    const setRows: React.Dispatch<React.SetStateAction<EstimateMeta[]>> = (value) => {
      rowsRef.current = typeof value === 'function' ? value(rowsRef.current) : value;
    };

    const { result } = renderHook(() => useEstimateMutations());

    await act(async () => {
      await result.current.deleteEstimate({
        estimateId: 'est-1',
        estimateName: 'Смета 1',
        setRows,
      });
    });

    expect(repoMocks.delete).toHaveBeenCalledWith('est-1');
    expect(rowsRef.current).toHaveLength(0);
    expect(toastMock).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Смета удалена' }),
    );
  });
});
