import { generateEmbedding } from '@/lib/ai/embeddings';

const QUERY_EMBEDDING_CACHE_TTL_MS = 10 * 60 * 1000;
const QUERY_EMBEDDING_TIMEOUT_MS = 1200;

type QueryEmbeddingCacheEntry = {
    embedding: number[];
    createdAt: number;
};

type QueryEmbeddingDegradedReason = 'timeout' | 'generation_failed';

type QueryEmbeddingResult = {
    embedding: number[] | null;
    degradedReason: QueryEmbeddingDegradedReason | null;
};

const queryEmbeddingCache = new Map<string, QueryEmbeddingCacheEntry>();

function getCacheKey(teamId: number, query: string): string {
    return `${teamId}::text-embedding-3-small::${query.trim().toLowerCase()}`;
}

export async function getCachedQueryEmbedding(teamId: number, query: string): Promise<QueryEmbeddingResult> {
    const cacheKey = getCacheKey(teamId, query);
    const cached = queryEmbeddingCache.get(cacheKey);

    if (cached && Date.now() - cached.createdAt < QUERY_EMBEDDING_CACHE_TTL_MS) {
        return { embedding: cached.embedding, degradedReason: null };
    }

    if (cached) {
        queryEmbeddingCache.delete(cacheKey);
    }

    const timeoutMarker = Symbol('query_embedding_timeout');
    const timeoutResult = new Promise<typeof timeoutMarker>((resolve) => {
        setTimeout(() => resolve(timeoutMarker), QUERY_EMBEDDING_TIMEOUT_MS);
    });

    const embeddingResult = await Promise.race([
        generateEmbedding(query),
        timeoutResult,
    ]);

    if (embeddingResult === timeoutMarker) {
        return {
            embedding: null,
            degradedReason: 'timeout',
        };
    }

    if (!embeddingResult) {
        return {
            embedding: null,
            degradedReason: 'generation_failed',
        };
    }

    queryEmbeddingCache.set(cacheKey, {
        embedding: embeddingResult,
        createdAt: Date.now(),
    });

    return { embedding: embeddingResult, degradedReason: null };
}

export const __queryEmbeddingsInternal = {
    clearCache: () => {
        queryEmbeddingCache.clear();
    },
};
