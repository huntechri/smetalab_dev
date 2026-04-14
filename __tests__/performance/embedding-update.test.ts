import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MaterialsService } from '@/lib/domain/materials/materials.service';
import { db } from '@/lib/data/db/drizzle';
import { generateEmbeddingsBatch } from '@/lib/ai/embeddings';

// Mock dependencies
vi.mock('@/lib/data/db/drizzle');
vi.mock('@/lib/ai/embeddings');

// Types for mocks
const mockDb = vi.mocked(db);
const mockGenerateEmbeddingsBatch = vi.mocked(generateEmbeddingsBatch);

describe('MaterialsService.generateMissingEmbeddings Performance', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    it('should use bulk update (1 call) instead of N+1 calls', async () => {
        const BATCH_SIZE = 50;

        // Mock materials data
        const mockMaterials = Array.from({ length: BATCH_SIZE }, (_, i) => ({
            id: `material-${i}`,
            tenantId: 1,
            name: `Material ${i}`,
            code: `CODE-${i}`,
        }));

        // Mock db.select logic
        const firstQueryMock = {
            from: vi.fn().mockReturnThis(),
            where: vi.fn().mockReturnThis(),
            limit: vi.fn().mockResolvedValue(mockMaterials),
        };

        const secondQueryMock = {
            from: vi.fn().mockReturnThis(),
            where: vi.fn().mockReturnThis(),
            then: vi.fn().mockImplementation((resolve) => resolve([{ count: 0 }])),
        };

        mockDb.select
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .mockReturnValueOnce(firstQueryMock as any)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .mockReturnValueOnce(secondQueryMock as any);

        // Mock generateEmbeddingsBatch
        const mockEmbeddings = mockMaterials.map(() => Array(1536).fill(0.1));
        mockGenerateEmbeddingsBatch.mockResolvedValue(mockEmbeddings);

        // Mock transaction
        const mockTxUpdate = vi.fn().mockReturnValue({
             set: vi.fn().mockReturnThis(),
             where: vi.fn().mockReturnThis(),
        });

        const mockTx = {
            update: mockTxUpdate,
        };

        mockDb.transaction.mockImplementation(async (callback) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await callback(mockTx as any);
        });

        // Execute
        await MaterialsService.generateMissingEmbeddings(1);

        // Verify Optimization: Expect 1 update
        expect(mockTxUpdate).toHaveBeenCalledTimes(1);
        console.log(`Optimization verified: ${mockTxUpdate.mock.calls.length} update for ${BATCH_SIZE} items.`);
    });
});
