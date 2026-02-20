import { beforeEach, describe, expect, it, vi } from 'vitest';
import { WorksCatalogService } from '@/lib/services/works-catalog.service';
import { WorksService } from '@/lib/domain/works/works.service';
import {
  createWorkUseCase,
  deleteAllWorksUseCase,
  deleteWorkUseCase,
  insertWorkAfterUseCase,
  updateWorkUseCase,
} from '@/lib/domain/works/use-cases';

vi.mock('@/lib/domain/works/works.service', () => ({
  WorksService: {
    getMany: vi.fn(),
    search: vi.fn(),
    reorder: vi.fn(),
    getUniqueUnits: vi.fn(),
  },
}));

vi.mock('@/lib/domain/works/use-cases', () => ({
  createWorkUseCase: vi.fn(),
  updateWorkUseCase: vi.fn(),
  deleteWorkUseCase: vi.fn(),
  deleteAllWorksUseCase: vi.fn(),
  insertWorkAfterUseCase: vi.fn(),
}));

describe('WorksCatalogService', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('delegates CRUD/insert operations to use-cases', async () => {
    vi.mocked(createWorkUseCase).mockResolvedValue({ success: true, data: undefined });
    vi.mocked(updateWorkUseCase).mockResolvedValue({ success: true, data: undefined });
    vi.mocked(deleteWorkUseCase).mockResolvedValue({ success: true, data: undefined });
    vi.mocked(deleteAllWorksUseCase).mockResolvedValue({ success: true, data: undefined });
    vi.mocked(insertWorkAfterUseCase).mockResolvedValue({ success: true, data: undefined });

    await WorksCatalogService.create(1, { tenantId: 1, code: 'w-1', name: 'Работа', status: 'active' });
    await WorksCatalogService.update(1, 'id', { name: 'Обновлено' });
    await WorksCatalogService.delete(1, 'id');
    await WorksCatalogService.deleteAll(1);
    await WorksCatalogService.insertAfter(1, null, { tenantId: 1, code: 'w-2', name: 'Работа 2', status: 'active' });

    expect(createWorkUseCase).toHaveBeenCalled();
    expect(updateWorkUseCase).toHaveBeenCalled();
    expect(deleteWorkUseCase).toHaveBeenCalled();
    expect(deleteAllWorksUseCase).toHaveBeenCalled();
    expect(insertWorkAfterUseCase).toHaveBeenCalled();
  });

  it('delegates read/search/maintenance operations to domain service', async () => {
    vi.mocked(WorksService.getMany).mockResolvedValue({ success: true, data: [] });
    vi.mocked(WorksService.search).mockResolvedValue({ success: true, data: [] });
    vi.mocked(WorksService.reorder).mockResolvedValue({ success: true, data: { updatedCount: 0 } });
    vi.mocked(WorksService.getUniqueUnits).mockResolvedValue({ success: true, data: [] });

    await WorksCatalogService.fetchMore(1, { query: 'q', lastSortOrder: 100, limit: 20, category: 'A' });
    await WorksCatalogService.search(1, 'q');
    await WorksCatalogService.reorder(1);
    await WorksCatalogService.getUniqueUnits(1);

    expect(WorksService.getMany).toHaveBeenCalledWith(1, 20, 'q', 100, 'A');
    expect(WorksService.search).toHaveBeenCalledWith(1, 'q');
    expect(WorksService.reorder).toHaveBeenCalledWith(1);
    expect(WorksService.getUniqueUnits).toHaveBeenCalledWith(1);
  });
});
