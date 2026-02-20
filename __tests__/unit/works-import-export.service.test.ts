import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WorksImportExportService } from '@/lib/services/works-import-export.service';
import { ExcelService } from '@/lib/services/excel.service';
import { WorksService } from '@/lib/domain/works/works.service';

vi.mock('@/lib/services/excel.service', () => ({
  ExcelService: {
    parseBuffer: vi.fn(),
  },
}));

vi.mock('@/lib/domain/works/works.service', () => ({
  WorksService: {
    upsertMany: vi.fn(),
  },
}));

describe('WorksImportExportService', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('returns parse error when parse fails', async () => {
    vi.mocked(ExcelService.parseBuffer).mockResolvedValue({ success: false, error: { message: 'parse' }, message: 'parse' });

    const file = new File([new Uint8Array([1])], 'works.xlsx');
    const result = await WorksImportExportService.importFromFile(20, file);

    expect(result.success).toBe(false);
  });

  it('upserts parsed works and returns summary message', async () => {
    vi.mocked(ExcelService.parseBuffer).mockResolvedValue({
      success: true,
      data: {
        data: [{ code: 'W-1', name: 'Работа', unit: 'м2', price: 100 }],
        summary: { success: 1, skipped: 0 },
      },
    });
    vi.mocked(WorksService.upsertMany).mockResolvedValue({ success: true, data: undefined });

    const file = new File([new Uint8Array([1])], 'works.xlsx');
    const result = await WorksImportExportService.importFromFile(20, file);

    expect(WorksService.upsertMany).toHaveBeenCalledTimes(1);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.summaryMessage).toContain('Успешно: 1');
    }
  });
});
