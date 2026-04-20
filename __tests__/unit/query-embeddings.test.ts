import { beforeEach, describe, expect, it, vi } from 'vitest';
import { __queryEmbeddingsInternal, getCachedQueryEmbedding } from '@/lib/ai/query-embeddings';
import { generateEmbedding } from '@/lib/ai/embeddings';

vi.mock('@/lib/ai/embeddings', () => ({
    generateEmbedding: vi.fn(),
}));

describe('query embeddings cache', () => {
    beforeEach(() => {
        __queryEmbeddingsInternal.clearCache();
        vi.resetAllMocks();
    });

    it('returns cached embedding for identical team and query', async () => {
        const embedding = new Array(1536).fill(0.25);
        vi.mocked(generateEmbedding).mockResolvedValue(embedding);

        const first = await getCachedQueryEmbedding(1, 'бетон М300');
        const second = await getCachedQueryEmbedding(1, 'бетон м300');

        expect(first.embedding).toEqual(embedding);
        expect(second.embedding).toEqual(embedding);
        expect(vi.mocked(generateEmbedding)).toHaveBeenCalledTimes(1);
    });

    it('returns degraded result when generator returns null', async () => {
        vi.mocked(generateEmbedding).mockResolvedValue(null);

        const result = await getCachedQueryEmbedding(3, 'red brick wall');

        expect(result.embedding).toBeNull();
        expect(result.degradedReason).toBe('generation_failed');
    });
});
