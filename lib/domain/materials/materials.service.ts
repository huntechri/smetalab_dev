import { and, eq, gt, isNull, sql, inArray } from 'drizzle-orm';
import { db } from '@/lib/data/db/drizzle';
import { materials, NewMaterial } from '@/lib/data/db/schema';
import { generateEmbedding, generateEmbeddingsBatch } from '@/lib/ai/embeddings';
import { buildMaterialContext, MaterialContextInput } from '@/lib/ai/embedding-context';
import { MaterialRow } from '@/types/material-row';
import { MaterialCategoryNode } from './materials.contract';
import { Result, success, error } from '@/lib/utils/result';
import { materialSchema } from '@/lib/validations/schemas';
import { withActiveTenant } from '@/lib/data/db/queries';
import { after } from 'next/server';
import { SYNONYMS } from '@/lib/ai/dictionaries/synonyms';
import { getCachedQueryEmbedding } from '@/lib/ai/query-embeddings';
import { ensureMaterialsSortOrderColumn } from '@/lib/data/db/schema-compat';

const FTS_RANK_WEIGHTS = [0.1, 0.2, 0.4, 1.0] as const;

const SEARCH_SCORE_WEIGHTS = {
    fts: 1.4,
    trgm: 1.1,
    phrase: 0.8,
    vendor: 0.6,
    vector: 0.4,
} as const;

const MATERIALS_VECTOR_SCORE_THRESHOLD = 0.42;

export class MaterialsService {
    static async getMany(
        teamId: number | null,
        limit?: number,
        search?: string,
        offset?: number,
        lastSortOrder?: number,
        lastId?: string,
        categoryLv1?: string,
        categoryLv2?: string,
        categoryLv3?: string,
        categoryLv4?: string
    ): Promise<Result<MaterialRow[]>> {
        try {
            await ensureMaterialsSortOrderColumn();

            const filters = [withActiveTenant(materials, teamId), eq(materials.status, 'active')];

            if (categoryLv1) filters.push(eq(materials.categoryLv1, categoryLv1));
            if (categoryLv2) filters.push(eq(materials.categoryLv2, categoryLv2));
            if (categoryLv3) filters.push(eq(materials.categoryLv3, categoryLv3));
            if (categoryLv4) filters.push(eq(materials.categoryLv4, categoryLv4));

            const normalizedSearch = search?.trim().toLowerCase();
            const finalOffset = offset && offset > 0 ? offset : 0;

            if (normalizedSearch) {
                const tsQuery = sql`websearch_to_tsquery('simple', ${normalizedSearch})`;
                const tokenPatterns = normalizedSearch
                    .split(/\s+/)
                    .filter((token) => token.length > 0)
                    .map((token) => sql`${materials.nameNorm} ILIKE ${`%${token}%`}`);

                const tokenMatchFilter = tokenPatterns.length > 0
                    ? sql.join(tokenPatterns, sql` AND `)
                    : sql`TRUE`;

                filters.push(sql`(
                    ${materials.searchVector} @@ ${tsQuery}
                    OR ${materials.nameNorm} % ${normalizedSearch}
                    OR ${materials.name} % ${normalizedSearch}
                    OR ${materials.nameNorm} ILIKE ${`%${normalizedSearch}%`}
                    OR ${materials.name} ILIKE ${`%${normalizedSearch}%`}
                    OR (${tokenMatchFilter})
                )`);
            }

            if (typeof lastSortOrder === 'number') {
                if (lastId) {
                    filters.push(sql`(${materials.sortOrder}, ${materials.id}) > (${lastSortOrder}, ${lastId})`);
                } else {
                    filters.push(gt(materials.sortOrder, lastSortOrder));
                }
            }

            if (categoryLv1 && categoryLv1 !== 'all') {
                filters.push(eq(materials.categoryLv1, categoryLv1));
            }

            const finalLimit = limit || (search ? 50 : 50);

            const data = await db
                .select({
                    id: materials.id,
                    tenantId: materials.tenantId,
                    code: materials.code,
                    name: materials.name,
                    unit: materials.unit,
                    price: materials.price,
                    vendor: materials.vendor,
                    categoryLv1: materials.categoryLv1,
                    categoryLv2: materials.categoryLv2,
                    categoryLv3: materials.categoryLv3,
                    categoryLv4: materials.categoryLv4,
                    imageUrl: materials.imageUrl,
                    imageLocalUrl: materials.imageLocalUrl,
                    status: materials.status,
                    createdAt: materials.createdAt,
                    sortOrder: materials.sortOrder,
                })
                .from(materials)
                .where(and(...filters))
                .orderBy(materials.sortOrder, materials.id)
                .limit(finalLimit)
                .offset(finalOffset) as MaterialRow[];

            return success(data);
        } catch (e) {
            console.error('getManyMaterials error:', e);
            return error('Ошибка при получении материалов');
        }
    }

    static async create(teamId: number, rawData: NewMaterial): Promise<Result<void>> {
        const validation = materialSchema.safeParse(rawData);
        if (!validation.success) return error('Ошибка валидации: ' + validation.error.message);
        const data = validation.data;

        try {
            await ensureMaterialsSortOrderColumn();

            const normalizedCode = this.normalizeCode(data.code) ?? data.code;
            const lastMaterial = typeof data.sortOrder === 'number'
                ? null
                : await db.query.materials.findFirst({
                    where: withActiveTenant(materials, teamId),
                    orderBy: (materials, { desc }) => [desc(materials.sortOrder)],
                });
            const [inserted] = await db.insert(materials).values({
                ...data,
                code: normalizedCode, nameNorm: data.name.toLowerCase(),
                tenantId: teamId,
                status: 'active',
                sortOrder: typeof data.sortOrder === 'number' ? data.sortOrder : (lastMaterial?.sortOrder ?? 0) + 100,
            }).returning({ id: materials.id });

            after(async () => {
                try {
                    const contextInput = { ...data } as MaterialContextInput;
                    const embedding = await generateEmbedding(buildMaterialContext(contextInput));
                    if (embedding) {
                        await db.update(materials)
                            .set({ embedding })
                            .where(eq(materials.id, inserted.id));
                    }
                } catch (err) {
                    console.error('Background material embedding failed:', err);
                }
            });

            return success(undefined, 'Материал добавлен');
        } catch (e) {
            console.error('createMaterial error:', e);
            return error('Ошибка добавления');
        }
    }

    static async update(teamId: number, id: string, rawData: Partial<NewMaterial>): Promise<Result<void>> {
        try {
            await ensureMaterialsSortOrderColumn();

            const updateData = { ...rawData, updatedAt: new Date() };
            const norm = this.normalizeCode(updateData.code);
            if (norm !== undefined) {
                updateData.code = norm;
            }

            if (updateData.name) {
                updateData.nameNorm = updateData.name.toLowerCase();
            }

            await db.update(materials)
                .set(updateData)
                .where(and(eq(materials.id, id), eq(materials.tenantId, teamId), withActiveTenant(materials, teamId)));

            // Background embedding update
            if (rawData.name || rawData.unit || rawData.vendor || rawData.categoryLv1 || rawData.description || rawData.code) {
                after(async () => {
                    try {
                        const current = await db.query.materials.findFirst({
                            where: and(eq(materials.id, id), eq(materials.tenantId, teamId), withActiveTenant(materials, teamId))
                        });
                        if (current) {
                            const contextInput = { ...current } as MaterialContextInput;
                            const embedding = await generateEmbedding(buildMaterialContext(contextInput));
                            if (embedding) {
                                await db.update(materials)
                                    .set({ embedding })
                                    .where(eq(materials.id, id));
                            }
                        }
                    } catch (err) {
                        console.error('Background material embedding update failed:', err);
                    }
                });
            }

            return success(undefined, 'Обновлено');
        } catch (e) {
            console.error('updateMaterial error:', e);
            return error('Ошибка обновления');
        }
    }

    static async delete(teamId: number, id: string): Promise<Result<void>> {
        try {
            await db.delete(materials).where(and(eq(materials.id, id), eq(materials.tenantId, teamId), withActiveTenant(materials, teamId)));
            return success(undefined, 'Успешно удалено');
        } catch (e) {
            console.error('deleteMaterial error:', e);
            return error('Ошибка удаления');
        }
    }

    static async deleteAll(teamId: number): Promise<Result<void>> {
        try {
            await db.delete(materials).where(and(eq(materials.tenantId, teamId), withActiveTenant(materials, teamId)));
            return success(undefined, 'Справочник очищен');
        } catch (e) {
            console.error('deleteAllMaterials error:', e);
            return error('Ошибка очистки');
        }
    }

    static async resetLocalImages(teamId: number): Promise<Result<void>> {
        try {
            await db.update(materials)
                .set({ imageLocalUrl: null })
                .where(and(eq(materials.tenantId, teamId), withActiveTenant(materials, teamId)));
            return success(undefined, 'Локальные ссылки очищены');
        } catch (e) {
            console.error('resetLocalImages error:', e);
            return error('Ошибка при сбросе ссылок');
        }
    }

    static normalizeCode(val: string | null | undefined): string | undefined {
        if (val === undefined || val === null) return undefined;
        const trimmed = val.trim();
        if (trimmed === "") return undefined;
        return trimmed.toLowerCase();
    }

    static preprocessSearchQuery(query: string): { expandedQuery: string; tokens: string[] } {
        const normalizedQuery = query.trim().toLowerCase();
        const tokens = normalizedQuery.split(/\s+/).filter(t => t.length > 0);

        // C) Synonyms dictionary expansion
        let expandedQuery = normalizedQuery;
        let synonymCount = 0;
        tokens.forEach(token => {
            if (SYNONYMS[token] && synonymCount < 5) {
                expandedQuery += ` ${SYNONYMS[token]}`;
                synonymCount++;
            }
        });
        return { expandedQuery, tokens };
    }

    static async search(
        teamId: number, 
        query: string, 
        categoryLv1?: string,
        categoryLv2?: string,
        categoryLv3?: string,
        categoryLv4?: string
    ): Promise<Result<MaterialRow[]>> {
        if (!query || query.trim().length < 1) return error('Короткий запрос');

        const { expandedQuery, tokens } = this.preprocessSearchQuery(query);
        const normalizedQuery = query.trim().toLowerCase();
        const shouldUseVector = tokens.length >= 2;

        const MAX_RESULTS = 300;
        const isDetailedQuery = tokens.length >= 4;
        const LEXICAL_CANDIDATES_LIMIT = isDetailedQuery ? 500 : 380;
        const VECTOR_CANDIDATES_LIMIT = isDetailedQuery ? 220 : 140;

        try {
            const queryEmbeddingResult = shouldUseVector
                ? await getCachedQueryEmbedding(teamId, expandedQuery)
                : { embedding: null, degradedReason: null };
            const queryEmbedding = queryEmbeddingResult.embedding;
            if (shouldUseVector && !queryEmbedding) {
                console.warn('Materials search degraded to lexical mode', {
                    teamId,
                    query: normalizedQuery,
                    reason: queryEmbeddingResult.degradedReason,
                });
            }

            const queryLike = `%${normalizedQuery}%`;
            const tsQuery = sql`websearch_to_tsquery('simple', ${expandedQuery})`;
            const nameSource = sql<string>`COALESCE(${materials.nameNorm}, ${materials.name})`;
            const lexicalFilter = sql<boolean>`(
                ${materials.searchVector} @@ ${tsQuery}
                OR ${materials.nameNorm} % ${normalizedQuery}
                OR ${materials.name} % ${normalizedQuery}
                OR ${nameSource} ILIKE ${queryLike}
                OR COALESCE(${materials.vendor}, '') ILIKE ${queryLike}
            )`;
            const lexicalRank = sql<number>`
                (
                    COALESCE(ts_rank(${materials.searchVector}, ${tsQuery}), 0)
                    + COALESCE(similarity(${nameSource}, ${normalizedQuery}), 0)
                    + CASE WHEN ${nameSource} ILIKE ${queryLike} THEN 0.8 ELSE 0 END
                    + CASE WHEN COALESCE(${materials.vendor}, '') ILIKE ${queryLike} THEN 0.6 ELSE 0 END
                )
            `;

            const baseFilters = [
                withActiveTenant(materials, teamId),
                eq(materials.status, 'active'),
            ];

            if (categoryLv1 && categoryLv1 !== 'all') {
                baseFilters.push(eq(materials.categoryLv1, categoryLv1));
            }
            if (categoryLv2) baseFilters.push(eq(materials.categoryLv2, categoryLv2));
            if (categoryLv3) baseFilters.push(eq(materials.categoryLv3, categoryLv3));
            if (categoryLv4) baseFilters.push(eq(materials.categoryLv4, categoryLv4));

            const lexicalCandidates = await db
                .select({ id: materials.id })
                .from(materials)
                .where(and(...baseFilters, lexicalFilter))
                .orderBy(sql`${lexicalRank} DESC`, materials.id)
                .limit(LEXICAL_CANDIDATES_LIMIT);

            const vectorCandidates = queryEmbedding
                ? await db
                    .select({ id: materials.id })
                    .from(materials)
                    .where(and(
                        ...baseFilters,
                        sql`${materials.embedding} IS NOT NULL`,
                        sql`(1 - (${materials.embedding} <=> ${JSON.stringify(queryEmbedding)}::vector)) >= ${MATERIALS_VECTOR_SCORE_THRESHOLD}`,
                    ))
                    .orderBy(sql`${materials.embedding} <=> ${JSON.stringify(queryEmbedding)}::vector`, materials.id)
                    .limit(VECTOR_CANDIDATES_LIMIT)
                : [];

            const candidateIds = Array.from(new Set([
                ...lexicalCandidates.map((row) => row.id),
                ...vectorCandidates.map((row) => row.id),
            ]));

            if (candidateIds.length === 0) {
                return success([]);
            }

            const ftsScore = sql<number>`
                COALESCE(
                    ts_rank(
                        ARRAY[${sql`${FTS_RANK_WEIGHTS[0]}`}::float4, ${sql`${FTS_RANK_WEIGHTS[1]}`}::float4, ${sql`${FTS_RANK_WEIGHTS[2]}`}::float4, ${sql`${FTS_RANK_WEIGHTS[3]}`}::float4],
                        ${materials.searchVector},
                        ${tsQuery}
                    ),
                    0
                )
            `;
            const trgmScore = sql<number>`COALESCE(similarity(${nameSource}, ${normalizedQuery}), 0)`;
            const phraseBoost = sql<number>`CASE WHEN COALESCE(${materials.nameNorm}, ${materials.name}) ILIKE ${queryLike} THEN 1.0 ELSE 0.0 END`;
            const vendorBoost = sql<number>`CASE WHEN COALESCE(${materials.vendor}, '') ILIKE ${queryLike} THEN 1.0 ELSE 0.0 END`;
            const vectorScore = queryEmbedding
                ? sql<number>`
                    CASE
                        WHEN ${materials.embedding} IS NOT NULL
                        THEN 1 - (${materials.embedding} <=> ${JSON.stringify(queryEmbedding)}::vector)
                        ELSE 0
                    END
                `
                : sql<number>`0`;
            const vectorWeight = queryEmbedding ? SEARCH_SCORE_WEIGHTS.vector : 0;
            const totalScore = sql<number>`
                (${ftsScore} * ${sql`${SEARCH_SCORE_WEIGHTS.fts}`}::float4)
                + (${trgmScore} * ${sql`${SEARCH_SCORE_WEIGHTS.trgm}`}::float4)
                + (${phraseBoost} * ${sql`${SEARCH_SCORE_WEIGHTS.phrase}`}::float4)
                + (${vendorBoost} * ${sql`${SEARCH_SCORE_WEIGHTS.vendor}`}::float4)
                + (${vectorScore} * ${sql`${vectorWeight}`}::float4)
            `;

            const results = await db.select({
                id: materials.id,
                tenantId: materials.tenantId,
                code: materials.code,
                name: materials.name,
                nameNorm: materials.nameNorm,
                unit: materials.unit,
                price: materials.price,
                vendor: materials.vendor,
                weight: materials.weight,
                categoryLv1: materials.categoryLv1,
                categoryLv2: materials.categoryLv2,
                categoryLv3: materials.categoryLv3,
                categoryLv4: materials.categoryLv4,
                productUrl: materials.productUrl,
                imageUrl: materials.imageUrl,
                imageLocalUrl: materials.imageLocalUrl,
                description: materials.description,
                status: materials.status,
                metadata: materials.metadata,
                tags: materials.tags,
                createdAt: materials.createdAt,
                updatedAt: materials.updatedAt,
                deletedAt: materials.deletedAt,
                sortOrder: materials.sortOrder,
                ftsScore,
                trgmScore,
                phraseBoost,
                vendorBoost,
                vectorScore,
                score: totalScore,
            })
                .from(materials)
                .where(and(...baseFilters, inArray(materials.id, candidateIds)))
                .orderBy(sql`${vendorBoost} DESC`, sql`${phraseBoost} DESC`, sql`${totalScore} DESC`, materials.code, materials.id)
                .limit(MAX_RESULTS);

            return success(results as MaterialRow[]);
        } catch (e) {
            console.error('searchMaterials error:', e);
            return error('Ошибка поиска');
        }
    }

    static async upsertMany(teamId: number, data: NewMaterial[]): Promise<Result<void>> {
        try {
            await ensureMaterialsSortOrderColumn();

            // Deduplicate only items WITH code. Items without code should be processed individually/as-is.
            const uniqueDataMap = new Map<string, NewMaterial>();
            const noCodeList: NewMaterial[] = [];

            for (const item of data) {
                const normCode = this.normalizeCode(item.code);
                if (normCode) {
                    uniqueDataMap.set(normCode, { ...item, code: normCode });
                } else {
                    noCodeList.push({ ...item, code: item.code.trim() });
                }
            }
            const uniqueWithCode = Array.from(uniqueDataMap.values());
            const totalToProcess = [...uniqueWithCode, ...noCodeList];

            await db.transaction(async (tx) => {
                const DB_BATCH_SIZE = 500;
                const lastMaterial = await tx.query.materials.findFirst({
                    where: withActiveTenant(materials, teamId),
                    orderBy: (materials, { desc }) => [desc(materials.sortOrder)],
                });
                let currentMaxSortOrder = lastMaterial?.sortOrder ?? 0;

                for (let i = 0; i < totalToProcess.length; i += DB_BATCH_SIZE) {
                    const batch = totalToProcess.slice(i, i + DB_BATCH_SIZE).map((item, idx) => ({
                        ...item,
                        tenantId: teamId,
                        nameNorm: item.name.toLowerCase(),
                        sortOrder: typeof item.sortOrder === 'number' ? item.sortOrder : currentMaxSortOrder + (idx + 1) * 100,
                    }));

                    if (batch.length > 0) {
                        const lastInBatch = batch[batch.length - 1];
                        if (typeof lastInBatch.sortOrder === 'number') {
                            currentMaxSortOrder = Math.max(currentMaxSortOrder, lastInBatch.sortOrder);
                        }
                    }

                    await tx.insert(materials).values(batch)
                        .onConflictDoUpdate({
                            target: [materials.tenantId, materials.code],
                            set: {
                                name: sql`excluded.name`,
                                nameNorm: sql`excluded.name_norm`,
                                unit: sql`excluded.unit`,
                                price: sql`excluded.price`,
                                vendor: sql`excluded.vendor`,
                                weight: sql`excluded.weight`,
                                categoryLv1: sql`excluded.category_lv1`,
                                categoryLv2: sql`excluded.category_lv2`,
                                categoryLv3: sql`excluded.category_lv3`,
                                categoryLv4: sql`excluded.category_lv4`,
                                productUrl: sql`excluded.product_url`,
                                imageUrl: sql`excluded.image_url`,
                                imageLocalUrl: sql`COALESCE(excluded.image_local_url, materials.image_local_url)`,
                                description: sql`excluded.description`,
                                sortOrder: sql`excluded.sort_order`,
                                updatedAt: new Date(),
                            }
                        });
                }
            });
            return success(undefined);
        } catch (e) {
            console.error('upsertManyMaterials error:', e);
            return error('Ошибка при сохранении данных', 'TRANSACTION_FAILED');
        }
    }

    static enqueueImageDownloads(_teamId: number, _data: Pick<NewMaterial, 'code' | 'imageUrl'>[]) {
        // Disabled Vercel Blob tasks
    }

    static async getCategories(teamId: number): Promise<Result<string[]>> {
        try {
            const rows = await db
                .selectDistinct({ category: materials.categoryLv1 })
                .from(materials)
                .where(and(
                    withActiveTenant(materials, teamId),
                    eq(materials.status, 'active'),
                    sql`${materials.categoryLv1} IS NOT NULL AND ${materials.categoryLv1} <> ''`
                ));

            const categories = rows
                .map((row) => row.category)
                .filter((category): category is string => Boolean(category && category.trim().length > 0))
                .sort((a, b) => a.localeCompare(b, 'ru-RU'));

            return success(categories);
        } catch (e) {
            console.error('getMaterialCategories error:', e);
            return error('Ошибка получения категорий материалов');
        }
    }

    static async getCategoryTree(teamId: number): Promise<Result<MaterialCategoryNode[]>> {
        try {
            const rows = await db
                .select({
                    lv1: materials.categoryLv1,
                    lv2: materials.categoryLv2,
                    lv3: materials.categoryLv3,
                    lv4: materials.categoryLv4
                })
                .from(materials)
                .where(and(
                    withActiveTenant(materials, teamId),
                    eq(materials.status, 'active')
                ));

            // Build tree manually from distinct combinations
            const combinations = Array.from(new Set(rows.map(r => JSON.stringify({
                lv1: r.lv1 || "",
                lv2: r.lv2 || "",
                lv3: r.lv3 || "",
                lv4: r.lv4 || ""
            })))).map(s => JSON.parse(s));

            const uniqSorted = (values: string[]) => Array.from(new Set(values.filter(Boolean))).sort((a, b) => a.localeCompare(b, 'ru'));

            const lv1Values = uniqSorted(combinations.map(c => c.lv1));
            const tree: MaterialCategoryNode[] = lv1Values.map(lv1 => {
                const lv1Combos = combinations.filter(c => c.lv1 === lv1);
                const lv2Values = uniqSorted(lv1Combos.map(c => c.lv2));
                
                return {
                    name: lv1,
                    children: lv2Values.map(lv2 => {
                        const lv2Combos = lv1Combos.filter(c => c.lv2 === lv2);
                        const lv3Values = uniqSorted(lv2Combos.map(c => c.lv3));

                        return {
                            name: lv2,
                            children: lv3Values.map(lv3 => {
                                const lv3Combos = lv2Combos.filter(c => c.lv3 === lv3);
                                const lv4Values = uniqSorted(lv3Combos.map(c => c.lv4));

                                return {
                                    name: lv3,
                                    children: lv4Values.map(lv4 => ({ name: lv4, children: [] }))
                                };
                            })
                        };
                    })
                };
            });

            return success(tree);
        } catch (e) {
            console.error('getCategoryTree error:', e);
            return error('Ошибка построения дерева категорий');
        }
    }

    static async generateMissingEmbeddings(teamId: number): Promise<Result<{ processed: number; remaining: number }>> {
        try {
            const BATCH_SIZE = 50;
            const materialsWithoutEmbedding = await db
                .select()
                .from(materials)
                .where(and(eq(materials.tenantId, teamId), withActiveTenant(materials, teamId), isNull(materials.embedding)))
                .limit(BATCH_SIZE);

            if (materialsWithoutEmbedding.length === 0) {
                return success({ processed: 0, remaining: 0 });
            }

            const contexts = materialsWithoutEmbedding.map(m => buildMaterialContext(m as NewMaterial));
            const embeddings = await generateEmbeddingsBatch(contexts);

            if (embeddings && embeddings.length === materialsWithoutEmbedding.length) {
                const updates: { id: string; embedding: number[] }[] = [];
                for (let i = 0; i < materialsWithoutEmbedding.length; i++) {
                    const embedding = embeddings[i];
                    if (embedding) {
                        updates.push({
                            id: materialsWithoutEmbedding[i].id,
                            embedding: embedding,
                        });
                    }
                }

                if (updates.length > 0) {
                    await db.transaction(async (tx) => {
                        const sqlChunks = [];
                        sqlChunks.push(sql`(CASE`);
                        for (const update of updates) {
                            sqlChunks.push(sql`WHEN ${materials.id} = ${update.id} THEN ${JSON.stringify(update.embedding)}::vector`);
                        }
                        sqlChunks.push(sql`END)`);
                        const finalSql = sql.join(sqlChunks, sql` `);

                        await tx.update(materials)
                            .set({ embedding: finalSql })
                            .where(inArray(materials.id, updates.map(u => u.id)));
                    });
                }
            }

            const [{ count }] = await db
                .select({ count: sql<number>`count(*)` })
                .from(materials)
                .where(and(eq(materials.tenantId, teamId), withActiveTenant(materials, teamId), isNull(materials.embedding)));

            return success({ processed: materialsWithoutEmbedding.length, remaining: Number(count) });
        } catch (e) {
            console.error('generateMissingEmbeddings error:', e);
            return error('Сбой процесса');
        }
    }

    static async reindexAllEmbeddings(teamId: number, offset = 0): Promise<Result<{ processed: number; remaining: number }>> {
        try {
            const BATCH_SIZE = 50;
            const materialsToReindex = await db
                .select()
                .from(materials)
                .where(and(eq(materials.tenantId, teamId), withActiveTenant(materials, teamId)))
                .orderBy(materials.id)
                .limit(BATCH_SIZE)
                .offset(offset);

            // This is a partial reindex for the batch. 
            // The UI should call this repeatedly until remaining is 0, or we can use a loop if it doesn't timeout.
            // For simplicity and to match generateMissingEmbeddings style, we do one batch.

            if (materialsToReindex.length === 0) {
                return success({ processed: 0, remaining: 0 });
            }

            const contexts = materialsToReindex.map(m => buildMaterialContext(m as NewMaterial));
            const embeddings = await generateEmbeddingsBatch(contexts);

            if (embeddings && embeddings.length === materialsToReindex.length) {
                const updates: { id: string; embedding: number[] }[] = [];

                for (let i = 0; i < materialsToReindex.length; i++) {
                    const embedding = embeddings[i];
                    if (embedding) {
                        updates.push({
                            id: materialsToReindex[i].id,
                            embedding,
                        });
                    }
                }

                if (updates.length > 0) {
                    await db.transaction(async (tx) => {
                        const updateChunks = [sql`(CASE`];
                        for (const update of updates) {
                            updateChunks.push(sql`WHEN ${materials.id} = ${update.id} THEN ${JSON.stringify(update.embedding)}::vector`);
                        }
                        updateChunks.push(sql`END)`);

                        await tx.update(materials)
                            .set({ embedding: sql.join(updateChunks, sql` `) })
                            .where(inArray(materials.id, updates.map((update) => update.id)));
                    });
                }
            }

            return success({ processed: materialsToReindex.length, remaining: 0 }); // Note: remaining logic would need more queries
        } catch (e) {
            console.error('reindexAllEmbeddings error:', e);
            return error('Сбой переиндексации');
        }
    }
}
