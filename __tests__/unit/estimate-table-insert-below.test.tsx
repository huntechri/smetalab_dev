import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EstimateTable } from '@/features/projects/estimates/components/table/EstimateTable.client';
import type { EstimateRow } from '@/features/projects/estimates/types/dto';

const addWorkMock = vi.fn();
const listRowsMock = vi.fn();
const toastMock = vi.fn();
let capturedOnInsertWorkAfter: ((workId: string, workName: string) => void) | null = null;

vi.mock('@/features/projects/estimates/repository/estimates.actions', () => ({
  estimatesActionRepo: {
    list: (...args: unknown[]) => listRowsMock(...args),
    addWork: (...args: unknown[]) => addWorkMock(...args),
    addMaterial: vi.fn(),
    patchRow: vi.fn(),
    removeRow: vi.fn(),
    updateStatus: vi.fn(),
    updateCoefficient: vi.fn(),
    resetCoefficient: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock('@/features/projects/estimates/repository/patterns.actions', () => ({
  estimatePatternsActionRepo: {
    list: vi.fn().mockResolvedValue([]),
    save: vi.fn(),
    apply: vi.fn(),
    preview: vi.fn(),
    remove: vi.fn(),
  },
}));

vi.mock('@/features/projects/estimates/components/table/columns', () => ({
  getEstimateColumns: (options: { onInsertWorkAfter: (workId: string, workName: string) => void }) => {
    capturedOnInsertWorkAfter = options.onInsertWorkAfter;
    return [];
  },
}));

vi.mock('@/components/providers/use-app-toast', () => ({
  useAppToast: () => ({ toast: toastMock }),
}));

vi.mock('@/shared/ui/data-table', () => ({
  DataTable: ({ actions }: { actions?: React.ReactNode }) => <div>{actions}</div>,
}));

vi.mock('@/shared/ui/button', () => ({
  Button: ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => <button {...props}>{children}</button>,
}));

vi.mock('@/shared/ui/badge', () => ({ Badge: ({ children }: { children: React.ReactNode }) => <div>{children}</div> }));
vi.mock('@/shared/ui/sheet', () => ({
  Sheet: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SheetContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SheetDescription: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SheetTitle: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
vi.mock('@/shared/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuItem: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuTrigger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
vi.mock('@/shared/ui/dialog', () => ({
  Dialog: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogDescription: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogFooter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogTitle: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
vi.mock('@/shared/ui/input', () => ({ Input: (props: React.InputHTMLAttributes<HTMLInputElement>) => <input {...props} /> }));
vi.mock('@/shared/ui/label', () => ({ Label: ({ children }: { children: React.ReactNode }) => <label>{children}</label> }));

vi.mock('@/features/catalog/components/MaterialCatalogDialog.client', () => ({
  MaterialCatalogDialog: () => null,
}));

vi.mock('@/features/catalog/components/WorkCatalogPicker.client', () => ({
  WorkCatalogPicker: ({ onAddWork }: { onAddWork: (work: { name: string; price: number; unit: string }) => Promise<void> }) => (
    <button onClick={() => void onAddWork({ name: 'Каталожная работа', price: 100, unit: 'шт' })}>
      add-work
    </button>
  ),
}));

describe('EstimateTable insert-below flow', () => {
  beforeEach(() => {
    addWorkMock.mockReset();
    listRowsMock.mockReset();
    toastMock.mockReset();
    capturedOnInsertWorkAfter = null;
  });

  it('chains insertAfterWorkId for multi-add from catalog in insert-below mode', async () => {
    const initialRows: EstimateRow[] = [
      {
        id: 'work-1',
        kind: 'work',
        code: '1',
        name: 'Работа 1',
        unit: 'шт',
        qty: 1,
        price: 100,
        basePrice: 100,
        sum: 100,
        expense: 0,
        order: 100,
      },
    ];

    listRowsMock.mockResolvedValue(initialRows);
    addWorkMock
      .mockResolvedValueOnce({ ...initialRows[0], id: 'work-2', code: '2', order: 200, name: 'Каталожная работа' })
      .mockResolvedValueOnce({ ...initialRows[0], id: 'work-3', code: '3', order: 300, name: 'Каталожная работа 2' });

    render(<EstimateTable estimateId="estimate-1" initialRows={initialRows} initialCoefPercent={0} />);

    await waitFor(() => {
      expect(capturedOnInsertWorkAfter).not.toBeNull();
    });

    capturedOnInsertWorkAfter?.('work-1', 'Работа 1');

    const addButtons = await screen.findAllByRole('button', { name: 'add-work' });
    fireEvent.click(addButtons[0]);

    await waitFor(() => {
      expect(addWorkMock).toHaveBeenCalledTimes(1);
    });

    fireEvent.click(addButtons[0]);

    await waitFor(() => {
      expect(addWorkMock).toHaveBeenCalledTimes(2);
    });

    expect(addWorkMock).toHaveBeenNthCalledWith(
      1,
      'estimate-1',
      expect.objectContaining({ insertAfterWorkId: 'work-1' }),
    );
    expect(addWorkMock).toHaveBeenNthCalledWith(
      2,
      'estimate-1',
      expect.objectContaining({ insertAfterWorkId: 'work-2' }),
    );
  });
});
