import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useGlobalPurchasesImportExport } from '@/features/global-purchases/hooks/useGlobalPurchasesImportExport';

describe('useGlobalPurchasesImportExport', () => {
  it('exports xlsx and shows success toast', async () => {
    const toast = vi.fn();
    const createObjectURLSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:url');
    const revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);

    const { result } = renderHook(() => useGlobalPurchasesImportExport({
      displayedRows: [{
        id: '1',
        projectId: null,
        projectName: 'Проект',
        materialName: 'Цемент',
        materialId: null,
        unit: 'шт',
        qty: 2,
        price: 100,
        amount: 200,
        note: '',
        source: 'manual',
        purchaseDate: '2026-01-10',
        supplierId: null,
        supplierName: null,
        supplierColor: null,
      }],
      range: { from: '2026-01-10', to: '2026-01-10' },
      importRows: vi.fn(),
      toast,
    }));

    await act(async () => {
      await result.current.handleExport();
    });

    expect(createObjectURLSpy).toHaveBeenCalledTimes(1);
    expect(clickSpy).toHaveBeenCalledTimes(1);
    expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:url');
    expect(toast).toHaveBeenCalledWith(expect.objectContaining({ title: 'Экспорт завершен' }));

    createObjectURLSpy.mockRestore();
    revokeObjectURLSpy.mockRestore();
    clickSpy.mockRestore();
  });
});
