import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MaterialsImportExportService } from '@/lib/services/materials-import-export.service';
import { ExcelService } from '@/lib/services/excel.service';
import { MaterialsService } from '@/lib/domain/materials/materials.service';

vi.mock('@/lib/services/excel.service', () => ({
  ExcelService: {
    parseBuffer: vi.fn(),
  },
}));

vi.mock('@/lib/domain/materials/materials.service', () => ({
  MaterialsService: {
    upsertMany: vi.fn(),
  },
}));

describe('MaterialsImportExportService', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('returns validation error when parse fails', async () => {
    vi.mocked(ExcelService.parseBuffer).mockResolvedValue({ success: false, error: { message: 'parse' }, message: 'parse' });

    const file = new File([new Uint8Array([1, 2, 3])], 'materials.xlsx');
    const result = await MaterialsImportExportService.importFromFile(10, file);

    expect(result.success).toBe(false);
  });

  it('upserts parsed rows and returns summary message', async () => {
    vi.mocked(ExcelService.parseBuffer).mockResolvedValue({
      success: true,
      data: {
        data: [{ code: 'M-1', name: 'Материал', unit: 'шт', price: 10 }],
        summary: { success: 1, skipped: 0 },
      },
    });
    vi.mocked(MaterialsService.upsertMany).mockResolvedValue({ success: true, data: undefined });

    const file = new File([new Uint8Array([1, 2, 3])], 'materials.xlsx');
    const result = await MaterialsImportExportService.importFromFile(10, file);

    expect(MaterialsService.upsertMany).toHaveBeenCalledTimes(1);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.summaryMessage).toContain('Успешно: 1');
      expect(result.data.materialsToUpsert[0].tenantId).toBe(10);
      expect(result.data.materialsToUpsert[0].nameNorm).toBe('материал');
      expect(result.data.materialsToUpsert[0].sortOrder).toBe(100);
    }
  });
});
