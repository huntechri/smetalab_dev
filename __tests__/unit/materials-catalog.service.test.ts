import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MaterialsCatalogService } from '@/lib/services/materials-catalog.service';
import { MaterialsService } from '@/lib/domain/materials/materials.service';

vi.mock('@/lib/domain/materials/materials.service', () => ({
  MaterialsService: {
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    deleteAll: vi.fn(),
    getMany: vi.fn(),
    search: vi.fn(),
    generateMissingEmbeddings: vi.fn(),
  },
}));

describe('MaterialsCatalogService', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('delegates CRUD operations to domain service', async () => {
    vi.mocked(MaterialsService.create).mockResolvedValue({ success: true, data: undefined });
    vi.mocked(MaterialsService.update).mockResolvedValue({ success: true, data: undefined });
    vi.mocked(MaterialsService.delete).mockResolvedValue({ success: true, data: undefined });
    vi.mocked(MaterialsService.deleteAll).mockResolvedValue({ success: true, data: undefined });

    await MaterialsCatalogService.create(1, { tenantId: 1, code: 'm-1', name: 'Материал', status: 'active' });
    await MaterialsCatalogService.update(1, 'id', { name: 'Обновлено' });
    await MaterialsCatalogService.delete(1, 'id');
    await MaterialsCatalogService.deleteAll(1);

    expect(MaterialsService.create).toHaveBeenCalled();
    expect(MaterialsService.update).toHaveBeenCalled();
    expect(MaterialsService.delete).toHaveBeenCalled();
    expect(MaterialsService.deleteAll).toHaveBeenCalled();
  });

  it('delegates read/search operations to domain service', async () => {
    vi.mocked(MaterialsService.getMany).mockResolvedValue({ success: true, data: [] });
    vi.mocked(MaterialsService.search).mockResolvedValue({ success: true, data: [] });
    vi.mocked(MaterialsService.generateMissingEmbeddings).mockResolvedValue({ success: true, data: { processed: 0, remaining: 0 } });

    await MaterialsCatalogService.fetchMore(1, {
      query: 'q',
      offset: 10,
      limit: 20,
      cursor: { lastSortOrder: 100, lastId: '00000000-0000-0000-0000-000000000001' },
      categoryLv1: 'c1',
      categoryLv2: 'c2',
      categoryLv3: 'c3',
      categoryLv4: 'c4'
    });
    await MaterialsCatalogService.search(1, 'q', 'c1', 'c2', 'c3', 'c4');
    await MaterialsCatalogService.generateMissingEmbeddings(1);

    expect(MaterialsService.getMany).toHaveBeenCalledWith(
      1,
      20,
      'q',
      10,
      100,
      '00000000-0000-0000-0000-000000000001',
      'c1',
      'c2',
      'c3',
      'c4'
    );
    expect(MaterialsService.search).toHaveBeenCalledWith(1, 'q', 'c1', 'c2', 'c3', 'c4');
    expect(MaterialsService.generateMissingEmbeddings).toHaveBeenCalledWith(1);
  });
});
