import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MaterialsCatalogService } from '@/lib/services/materials-catalog.service';
import { MaterialsService } from '@/lib/domain/materials/materials.service';
import {
  createMaterialUseCase,
  deleteAllMaterialsUseCase,
  deleteMaterialUseCase,
  updateMaterialUseCase,
} from '@/lib/domain/materials/use-cases';

vi.mock('@/lib/domain/materials/materials.service', () => ({
  MaterialsService: {
    getMany: vi.fn(),
    search: vi.fn(),
    generateMissingEmbeddings: vi.fn(),
  },
}));

vi.mock('@/lib/domain/materials/use-cases', () => ({
  createMaterialUseCase: vi.fn(),
  updateMaterialUseCase: vi.fn(),
  deleteMaterialUseCase: vi.fn(),
  deleteAllMaterialsUseCase: vi.fn(),
}));

describe('MaterialsCatalogService', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('delegates CRUD operations to use-cases', async () => {
    vi.mocked(createMaterialUseCase).mockResolvedValue({ success: true, data: undefined });
    vi.mocked(updateMaterialUseCase).mockResolvedValue({ success: true, data: undefined });
    vi.mocked(deleteMaterialUseCase).mockResolvedValue({ success: true, data: undefined });
    vi.mocked(deleteAllMaterialsUseCase).mockResolvedValue({ success: true, data: undefined });

    await MaterialsCatalogService.create(1, { tenantId: 1, code: 'm-1', name: 'Материал', status: 'active' });
    await MaterialsCatalogService.update(1, 'id', { name: 'Обновлено' });
    await MaterialsCatalogService.delete(1, 'id');
    await MaterialsCatalogService.deleteAll(1);

    expect(createMaterialUseCase).toHaveBeenCalled();
    expect(updateMaterialUseCase).toHaveBeenCalled();
    expect(deleteMaterialUseCase).toHaveBeenCalled();
    expect(deleteAllMaterialsUseCase).toHaveBeenCalled();
  });

  it('delegates read/search operations to domain service', async () => {
    vi.mocked(MaterialsService.getMany).mockResolvedValue({ success: true, data: [] });
    vi.mocked(MaterialsService.search).mockResolvedValue({ success: true, data: [] });
    vi.mocked(MaterialsService.generateMissingEmbeddings).mockResolvedValue({ success: true, data: { processed: 0, remaining: 0 } });

    await MaterialsCatalogService.fetchMore(1, {
      query: 'q',
      offset: 10,
      limit: 20,
      cursor: { lastCode: '001', lastId: '00000000-0000-0000-0000-000000000001' },
    });
    await MaterialsCatalogService.search(1, 'q');
    await MaterialsCatalogService.generateMissingEmbeddings(1);

    expect(MaterialsService.getMany).toHaveBeenCalledWith(
      1,
      20,
      'q',
      10,
      '001',
      '00000000-0000-0000-0000-000000000001'
    );
    expect(MaterialsService.search).toHaveBeenCalledWith(1, 'q');
    expect(MaterialsService.generateMissingEmbeddings).toHaveBeenCalledWith(1);
  });
});
