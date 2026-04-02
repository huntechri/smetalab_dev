import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useMaterialsActions } from '@/features/materials/hooks/useMaterialsActions';

const toastMock = vi.fn();

const actionsMocks = vi.hoisted(() => ({
  exportMaterials: vi.fn(),
  deleteAllMaterials: vi.fn(),
  createMaterial: vi.fn(),
  importMaterials: vi.fn(),
}));

vi.mock('@/components/providers/use-app-toast', () => ({
  useAppToast: () => ({ toast: toastMock }),
}));

vi.mock('@/app/actions/materials', () => actionsMocks);
vi.mock('xlsx', () => ({
  utils: {
    json_to_sheet: vi.fn(() => ({})),
    book_new: vi.fn(() => ({})),
    book_append_sheet: vi.fn(),
  },
  writeFile: vi.fn(),
}));

describe('useMaterialsActions import', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('exports materials and hides technical db code column', async () => {
    actionsMocks.exportMaterials.mockResolvedValue({
      success: true,
      data: [{ 'КОД': 'm-1', 'Код': 'M-1', 'Наименование': 'Материал' }],
    });

    const worksheet = {};
    const xlsx = vi.mocked(await import('xlsx'));
    vi.mocked(xlsx.utils.json_to_sheet).mockReturnValue(worksheet);

    const { result } = renderHook(() => useMaterialsActions([], vi.fn(), 10));

    act(() => {
      result.current.handleExport();
    });

    await waitFor(() => {
      expect(actionsMocks.exportMaterials).toHaveBeenCalledTimes(1);
      expect(xlsx.writeFile).toHaveBeenCalledTimes(1);
    });

    expect(xlsx.utils.json_to_sheet).toHaveBeenCalledWith([
      { 'КОД': 'm-1', 'Код': 'M-1', 'Наименование': 'Материал' },
    ]);
    expect((worksheet as { '!cols'?: Array<{ hidden?: boolean }> })['!cols']?.[0]?.hidden).toBe(true);
  });

  it('sends file via FormData to server action and shows success toast', async () => {
    actionsMocks.importMaterials.mockResolvedValue({ success: true, message: 'Импорт завершен. Успешно: 1' });

    const { result } = renderHook(() => useMaterialsActions([], vi.fn(), 10));
    const fileInput = { files: [new File(['test'], 'materials.xlsx')] } as HTMLInputElement;
    const event = { target: fileInput } as React.ChangeEvent<HTMLInputElement>;

    act(() => {
      result.current.handleFileChange(event);
    });

    await waitFor(() => {
      expect(actionsMocks.importMaterials).toHaveBeenCalledTimes(1);
    });

    const formData = actionsMocks.importMaterials.mock.calls[0][0] as FormData;
    const uploaded = formData.get('file');
    expect(uploaded).toBeInstanceOf(File);
    expect((uploaded as File).name).toBe('materials.xlsx');

    expect(toastMock).toHaveBeenCalledWith({
      title: 'Импорт завершен',
      description: 'Импорт завершен. Успешно: 1',
    });
  });

  it('shows destructive toast when import action fails', async () => {
    actionsMocks.importMaterials.mockResolvedValue({ success: false, message: 'Ошибка передачи файла' });

    const { result } = renderHook(() => useMaterialsActions([], vi.fn(), 10));
    const fileInput = { files: [new File(['test'], 'materials.xlsx')] } as HTMLInputElement;
    const event = { target: fileInput } as React.ChangeEvent<HTMLInputElement>;

    act(() => {
      result.current.handleFileChange(event);
    });

    await waitFor(() => {
      expect(toastMock).toHaveBeenCalledWith({
        variant: 'destructive',
        title: 'Ошибка импорта',
        description: 'Ошибка передачи файла',
      });
    });
  });
});
