import { beforeEach, describe, expect, it, vi } from 'vitest';
import { db } from '@/lib/data/db/drizzle';
import { generateEmbeddingsBatch } from '@/lib/ai/embeddings';
import { MaterialsService } from '@/lib/domain/materials/materials.service';

vi.mock('@/lib/data/db/drizzle');
vi.mock('@/lib/ai/embeddings');

const mockDb = vi.mocked(db);
const mockGenerateEmbeddingsBatch = vi.mocked(generateEmbeddingsBatch);

describe('MaterialsService.reindexAllEmbeddings performance', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    it('uses one bulk UPDATE for one batch of materials', async () => {
        const batchSize = 50;
        const mockMaterials = Array.from({ length: batchSize }, (_, i) => ({
            id: `material-${i}`,
            tenantId: 1,
            name: `Material ${i}`,
            code: `CODE-${i}`,
        }));

        const selectMock = {
            from: vi.fn().mockReturnThis(),
            where: vi.fn().mockReturnThis(),
            orderBy: vi.fn().mockReturnThis(),
            limit: vi.fn().mockReturnThis(),
            offset: vi.fn().mockResolvedValue(mockMaterials),
        };

        mockDb.select.mockReturnValue(selectMock as never);
        mockGenerateEmbeddingsBatch.mockResolvedValue(mockMaterials.map(() => Array(1536).fill(0.1)));

        const updateSpy = vi.fn().mockReturnValue({
            set: vi.fn().mockReturnThis(),
            where: vi.fn().mockReturnThis(),
        });

        mockDb.transaction.mockImplementation(async (callback) => {
            await callback({ update: updateSpy } as never);
        });

        await MaterialsService.reindexAllEmbeddings(1);

        expect(updateSpy).toHaveBeenCalledTimes(1);
    });
});
