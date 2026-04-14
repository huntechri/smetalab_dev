import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { PatternsScreen } from '@/features/patterns';

const repoMocks = vi.hoisted(() => ({
  list: vi.fn(),
  preview: vi.fn(),
  remove: vi.fn(),
}));

vi.mock('@/features/projects/estimates/repository/patterns.actions', () => ({
  estimatePatternsActionRepo: {
    list: repoMocks.list,
    preview: repoMocks.preview,
    remove: repoMocks.remove,
  },
}));

vi.mock('@/components/providers/use-app-toast', () => ({
  useAppToast: () => ({ toast: vi.fn() }),
}));

describe('PatternsScreen', () => {
  it('renders patterns and opens preview dialog', async () => {
    repoMocks.list.mockResolvedValue([
      {
        id: 'p-1',
        name: 'Шаблон отделки',
        description: 'Базовый шаблон',
        rowsCount: 2,
        worksCount: 1,
        materialsCount: 1,
        updatedAt: new Date(),
      },
    ]);
    repoMocks.preview.mockResolvedValue({
      id: 'p-1',
      name: 'Шаблон отделки',
      rows: [
        { tempKey: 'm-1', kind: 'material', code: '1.1', name: 'Сетка', unit: 'шт', qty: 10, price: 120, sum: 1200, expense: 0, imageUrl: null, materialId: null, parentWorkTempKey: 'w-1', order: 101 },
        { tempKey: 'w-1', kind: 'work', code: '1', name: 'Штукатурка', unit: 'м2', qty: 10, price: 250, sum: 2500, expense: 0, imageUrl: null, materialId: null, parentWorkTempKey: null, order: 100 },
      ],
    });

    render(<PatternsScreen />);

    await waitFor(() => {
      expect(screen.getByText('Шаблон отделки')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Превью'));

    await waitFor(() => {
      expect(screen.getByText('Превью состава шаблона.')).toBeInTheDocument();
      expect(screen.getByText('1 Штукатурка')).toBeInTheDocument();
      expect(screen.getByText('1.1 Сетка')).toBeInTheDocument();
    });

    const workRow = screen.getByText('1 Штукатурка');
    const materialRow = screen.getByText('1.1 Сетка');
    expect(workRow.compareDocumentPosition(materialRow) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });
});
