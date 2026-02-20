import { and, eq, sql, gt, isNull, inArray } from 'drizzle-orm';
import { db } from '@/lib/data/db/drizzle';
import { works, NewWork } from '@/lib/data/db/schema';
import { generateEmbedding, generateEmbeddingsBatch } from '@/lib/ai/embeddings';
import { buildWorkContext } from '@/lib/ai/embedding-context';
import { WorkRow } from '@/types/work-row';
import { Result, success, error } from '@/lib/utils/result';
import { workSchema } from '@/lib/validations/schemas';
import { withActiveTenant } from '@/lib/data/db/queries';
import { after } from 'next/server';

export class WorksService {
    static async getMany(teamId: number | null, limit?: number, search?: string, lastSortOrder?: number, category?: string): Promise<Result<WorkRow[]>> {
        try {
            const filters = [withActiveTenant(works, teamId)];

            if (search) {
                filters.push(sql`(${works.name} ILIKE ${'%' + search + '%'} OR ${works.code} ILIKE ${'%' + search + '%'})`);
            }

            if (category && category !== 'all') {
                filters.push(eq(works.category, category));
            }

            if (typeof lastSortOrder === 'number') {
                filters.push(gt(works.sortOrder, lastSortOrder));
            }

            const finalLimit = Math.min(limit ?? 200, 500);

            const data = await db
                .select({
                    id: works.id,
                    tenantId: works.tenantId,
                    code: works.code,
                    name: works.name,
                    unit: works.unit,
                    price: works.price,
                    phase: works.phase,
                    category: works.category,
                    subcategory: works.subcategory,
                    shortDescription: works.shortDescription,
                    status: works.status,
                    createdAt: works.createdAt,
                    sortOrder: works.sortOrder,
                })
                .from(works)
                .where(and(...filters))
                .orderBy(
                    sql`CASE WHEN ${works.code} ~ '^[0-9]+(\.[0-9]+)*$' THEN string_to_array(${works.code}, '.')::int[] ELSE ARRAY[2147483647] END`,
                    works.sortOrder,
                    works.code
                )
                .limit(finalLimit);

            return success(data as WorkRow[]);
        } catch (e) {
            console.error('getManyWorks error:', e);
            return error('Ошибка при получении работ');
        }
    }

    static async create(teamId: number, rawData: NewWork): Promise<Result<void>> {
        const validation = workSchema.safeParse(rawData);
        if (!validation.success) return error('Ошибка валидации: ' + validation.error.message);
        const data = validation.data;

        try {
            const [inserted] = await db.insert(works).values({
                ...data,
                tenantId: teamId,
                nameNorm: data.name.toLowerCase(),
                status: 'active',
                code: data.code || `W-${Date.now()}`,
                sortOrder: data.sortOrder || 0,
            }).returning({ id: works.id });

            // Generate embedding in background
            after(async () => {
                try {
                    const embedding = await generateEmbedding(buildWorkContext(data as NewWork));
                    if (embedding) {
                        await db.update(works)
                            .set({ embedding })
                            .where(eq(works.id, inserted.id));
                    }
                } catch (err) {
                    console.error('Background embedding generation failed:', err);
                }
            });
            return success(undefined, 'Запись успешно добавлена');
        } catch (e) {
            console.error('createWork error:', e);
            return error('Ошибка при добавлении записи');
        }
    }

    static async update(teamId: number, id: string, rawData: Partial<NewWork>): Promise<Result<void>> {
        try {
            const updateData = { ...rawData, updatedAt: new Date() };
            if (updateData.name) {
                updateData.nameNorm = updateData.name.toLowerCase();
            }

            await db.update(works).set(updateData)
                .where(and(eq(works.id, id), eq(works.tenantId, teamId), withActiveTenant(works, teamId)));

            // Background embedding update
            if (rawData.name || rawData.category || rawData.subcategory || rawData.unit || rawData.description || rawData.shortDescription || rawData.phase || rawData.code) {
                after(async () => {
                    try {
                        const current = await db.query.works.findFirst({
                            where: and(eq(works.id, id), eq(works.tenantId, teamId), withActiveTenant(works, teamId))
                        });
                        if (current) {
                            const embedding = await generateEmbedding(buildWorkContext(current as NewWork));
                            if (embedding) {
                                await db.update(works)
                                    .set({ embedding })
                                    .where(eq(works.id, id));
                            }
                        }
                    } catch (err) {
                        console.error('Background embedding update failed:', err);
                    }
                });
            }

            return success(undefined, 'Запись успешно обновлена');
        } catch (e) {
            console.error('updateWork error:', e);
            return error('Ошибка при обновлении записи');
        }
    }

    static async delete(teamId: number, id: string): Promise<Result<void>> {
        try {
            const work = await db.query.works.findFirst({
                columns: { phase: true },
                where: and(eq(works.id, id), eq(works.tenantId, teamId), withActiveTenant(works, teamId))
            });

            if (!work) return error('Запись не найдена');

            await db.delete(works).where(and(eq(works.id, id), eq(works.tenantId, teamId), withActiveTenant(works, teamId)));



            return success(undefined, 'Запись успешно удалена');
        } catch (e) {
            console.error('deleteWork error:', e);
            return error('Ошибка при удалении записи');
        }
    }

    static async deleteAll(teamId: number): Promise<Result<void>> {
        try {
            await db.delete(works).where(and(eq(works.tenantId, teamId), withActiveTenant(works, teamId)));
            return success(undefined, 'Справочник успешно очищен');
        } catch (e) {
            console.error('deleteAllWorks error:', e);
            return error('Ошибка при очистке справочника');
        }
    }

    static async insertAfter(teamId: number, afterId: string | null, rawData: NewWork): Promise<Result<void>> {
        const validation = workSchema.safeParse(rawData);
        if (!validation.success) return error('Ошибка валидации: ' + validation.error.message);
        const data = validation.data;

        try {
            let newSortOrder = 0;
            let targetPhase = data.phase || "Этап 1";

            if (afterId) {
                // Вставка ПОСЛЕ существующей записи
                const prevWork = await db.query.works.findFirst({
                    where: and(eq(works.id, afterId), eq(works.tenantId, teamId), withActiveTenant(works, teamId))
                });

                if (!prevWork) return error('Запись для вставки не найдена');

                targetPhase = prevWork.phase || targetPhase;

                // Ищем следующую запись в этом же этапе (чтобы вычислить среднее)
                const nextWork = await db.query.works.findFirst({
                    where: and(
                        eq(works.tenantId, teamId),
                        withActiveTenant(works, teamId),
                        gt(works.sortOrder, prevWork.sortOrder!)
                    ),
                    orderBy: works.sortOrder,
                });

                if (nextWork) {
                    // Midpoint: (prev + next) / 2
                    newSortOrder = (prevWork.sortOrder! + nextWork.sortOrder!) / 2;
                } else {
                    // Если это последняя запись, берем prev + 100
                    newSortOrder = prevWork.sortOrder! + 100;
                }
            } else {
                // Вставка в самое начало или конец (если afterId не передан, считаем что в конец)
                const lastWork = await db.query.works.findFirst({
                    where: withActiveTenant(works, teamId),
                    orderBy: (works, { desc }) => [desc(works.sortOrder)]
                });

                if (lastWork) {
                    newSortOrder = lastWork.sortOrder! + 100;
                    targetPhase = lastWork.phase || targetPhase;
                } else {
                    newSortOrder = 100;
                }
            }

            const embedding = await generateEmbedding(buildWorkContext(data as NewWork));

            await db.insert(works).values({
                ...data,
                tenantId: teamId,
                nameNorm: data.name.toLowerCase(),
                phase: targetPhase,
                // Код теперь генерируем один раз, он не влияет на порядок
                code: data.code || `W-${Date.now()}`,
                status: 'active',
                embedding,
                sortOrder: newSortOrder
            });

            return success(undefined, 'Запись успешно добавлена');
        } catch (e) {
            console.error('insertWorkAfter error:', e);
            return error('Ошибка при вставке записи');
        }
    }

    static async search(teamId: number, query: string, category?: string): Promise<Result<WorkRow[]>> {
        if (!query || query.trim().length < 2) return error('Короткий запрос');

        const normalizedQuery = query.trim().toLowerCase();
        const tokens = normalizedQuery.split(/\s+/).filter(t => t.length > 0);
        const shouldUseVector = tokens.length >= 2;

        const MAX_RESULTS = 200;
        const LEXICAL_CANDIDATES_LIMIT = 350;
        const VECTOR_CANDIDATES_LIMIT = 140;

        try {
            const queryEmbedding = shouldUseVector ? await generateEmbedding(normalizedQuery) : null;
            if (shouldUseVector && !queryEmbedding) return error('Ошибка ИИ');

            const queryLike = `%${normalizedQuery}%`;
            const tsQuery = sql`websearch_to_tsquery('simple', ${normalizedQuery})`;
            const nameSource = sql<string>`COALESCE(${works.nameNorm}, ${works.name})`;
            const lexicalFilter = sql<boolean>`(
                ${works.searchVector} @@ ${tsQuery}
                OR ${works.nameNorm} % ${normalizedQuery}
                OR ${works.name} % ${normalizedQuery}
                OR ${nameSource} ILIKE ${queryLike}
                OR ${works.code} ILIKE ${queryLike}
            )`;
            const lexicalRank = sql<number>`(
                COALESCE(ts_rank(${works.searchVector}, ${tsQuery}), 0)
                + COALESCE(similarity(${nameSource}, ${normalizedQuery}), 0)
                + CASE WHEN ${nameSource} ILIKE ${queryLike} THEN 0.8 ELSE 0 END
                + CASE WHEN ${works.code} ILIKE ${queryLike} THEN 1.0 ELSE 0 END
            )`;

            const baseFilters = [
                withActiveTenant(works, teamId),
                eq(works.status, 'active'),
            ];

            if (category && category !== 'all') {
                baseFilters.push(eq(works.category, category));
            }

            const lexicalCandidates = await db
                .select({ id: works.id })
                .from(works)
                .where(and(...baseFilters, lexicalFilter))
                .orderBy(sql`${lexicalRank} DESC`, works.sortOrder, works.id)
                .limit(LEXICAL_CANDIDATES_LIMIT);

            const vectorCandidates = shouldUseVector
                ? await db
                    .select({ id: works.id })
                    .from(works)
                    .where(and(...baseFilters, sql`${works.embedding} IS NOT NULL`))
                    .orderBy(sql`${works.embedding} <=> ${JSON.stringify(queryEmbedding)}::vector`, works.sortOrder, works.id)
                    .limit(VECTOR_CANDIDATES_LIMIT)
                : [];

            const candidateIds = Array.from(new Set([
                ...lexicalCandidates.map((row) => row.id),
                ...vectorCandidates.map((row) => row.id),
            ]));

            if (candidateIds.length === 0) {
                return success([]);
            }

            const trgmScore = sql<number>`COALESCE(similarity(${nameSource}, ${normalizedQuery}), 0)`;
            const phraseBoost = sql<number>`CASE WHEN ${nameSource} ILIKE ${queryLike} THEN 1.0 ELSE 0.0 END`;
            const codeBoost = sql<number>`CASE WHEN ${works.code} ILIKE ${queryLike} THEN 1.2 ELSE 0.0 END`;

            const vectorScore = queryEmbedding
                ? sql<number>`1 - (${works.embedding} <=> ${JSON.stringify(queryEmbedding)}::vector)`
                : sql<number>`0`;

            const totalScore = sql<number>`
                (${trgmScore} * 0.3)
                + (${phraseBoost} * 0.4)
                + (${codeBoost} * 0.5)
                + (${vectorScore} * 0.8)
            `;

            const results = await db.select({
                id: works.id,
                tenantId: works.tenantId,
                code: works.code,
                name: works.name,
                unit: works.unit,
                price: works.price,
                phase: works.phase,
                category: works.category,
                subcategory: works.subcategory,
                shortDescription: works.shortDescription,
                description: works.description,
                status: works.status,
                createdAt: works.createdAt,
                updatedAt: works.updatedAt,
                deletedAt: works.deletedAt,
                sortOrder: works.sortOrder,
                score: totalScore
            })
                .from(works)
                .where(and(...baseFilters, inArray(works.id, candidateIds)))
                .orderBy(sql`${totalScore} DESC`, works.sortOrder)
                .limit(MAX_RESULTS);

            return success(results as unknown as WorkRow[]);
        } catch (e) {
            console.error('searchWorks error:', e);
            return error('Ошибка поиска');
        }
    }

    static async getCategories(teamId: number | null): Promise<Result<string[]>> {
        try {
            const categories = await db
                .selectDistinct({ category: works.category })
                .from(works)
                .where(and(
                    withActiveTenant(works, teamId),
                    sql`${works.category} IS NOT NULL`,
                    sql`length(trim(${works.category})) > 0`
                ))
                .orderBy(works.category);

            return success(categories.map(({ category }) => category as string));
        } catch (e) {
            console.error('getWorkCategories error:', e);
            return error('Ошибка при получении категорий работ');
        }
    }

    static async upsertMany(teamId: number, data: NewWork[]): Promise<Result<void>> {
        try {
            // Удаляем дубликаты по коду внутри одного батча/запроса,
            // иначе Postgres выдаст ошибку "ON CONFLICT DO UPDATE command cannot affect row a second time"
            const uniqueDataMap = new Map<string, NewWork>();
            for (const item of data) {
                uniqueDataMap.set(item.code, item);
            }
            const uniqueData = Array.from(uniqueDataMap.values());

            await db.transaction(async (tx) => {
                const BATCH_SIZE = 500;

                // Находим максимальный sortOrder чтобы добавлять в конец
                const lastWork = await tx.query.works.findFirst({
                    where: withActiveTenant(works, teamId),
                    orderBy: (works, { desc }) => [desc(works.sortOrder)]
                });

                let currentMaxSortOrder = lastWork?.sortOrder || 0;

                for (let i = 0; i < uniqueData.length; i += BATCH_SIZE) {
                    const batch = uniqueData.slice(i, i + BATCH_SIZE).map((item, idx) => ({
                        ...item,
                        tenantId: teamId, // Принудительно ставим tenantId
                        nameNorm: item.name.toLowerCase(),
                        // Если sortOrder не передан, добавляем в конец
                        sortOrder: item.sortOrder || (currentMaxSortOrder + (idx + 1) * 100)
                    }));

                    // Обновляем счетчик для следующего батча
                    if (batch.length > 0) {
                        const lastInBatch = batch[batch.length - 1];
                        if (typeof lastInBatch.sortOrder === 'number') {
                            currentMaxSortOrder = Math.max(currentMaxSortOrder, lastInBatch.sortOrder);
                        }
                    }

                    await tx.insert(works).values(batch)
                        .onConflictDoUpdate({
                            target: [works.tenantId, works.code],
                            set: {
                                name: sql`excluded.name`,
                                nameNorm: sql`excluded.name_norm`,
                                unit: sql`excluded.unit`,
                                price: sql`excluded.price`,
                                phase: sql`excluded.phase`,
                                category: sql`excluded.category`,
                                subcategory: sql`excluded.subcategory`,
                                shortDescription: sql`excluded.short_description`,
                                description: sql`excluded.description`,
                                updatedAt: new Date(),
                            }
                        });
                }
            });
            return success(undefined);
        } catch (e) {
            console.error('upsertManyWorks error:', e);
            return error('Ошибка при сохранении данных', 'TRANSACTION_FAILED');
        }
    }

    static async getUniqueUnits(teamId: number): Promise<Result<string[]>> {
        try {
            const result = await db
                .selectDistinct({ unit: works.unit })
                .from(works)
                .where(and(withActiveTenant(works, teamId), sql`${works.unit} IS NOT NULL`));

            const units = result.map(r => r.unit!).filter(Boolean).sort();
            return success(units);
        } catch (e) {
            console.error('getUniqueUnits error:', e);
            return error('Ошибка получения единиц измерения');
        }
    }

    // "Санитарная" функция сброса индексов. Вызывать только если insertAfter начинает сбоить из-за точности double
    static async reorder(teamId: number): Promise<Result<{ updatedCount: number }>> {
        try {
            const allWorks = await db
                .select()
                .from(works)
                .where(withActiveTenant(works, teamId))
                .orderBy(works.sortOrder); // Сортируем как есть сейчас

            if (allWorks.length === 0) return error('Нет данных');

            await db.execute(sql`
                WITH numbered AS (
                    SELECT id, ROW_NUMBER() OVER (ORDER BY sort_order ASC) as rn
                    FROM ${works}
                    WHERE ${works.tenantId} = ${teamId}
                )
                UPDATE ${works}
                SET sort_order = numbered.rn * 100
                FROM numbered
                WHERE ${works}.id = numbered.id
            `);

            return success({ updatedCount: allWorks.length }, 'Индексы успешно сброшены');
        } catch (e) {
            console.error('reorderWorks error:', e);
            return error('Ошибка перенумерации');
        }
    }

    static async generateMissingEmbeddings(teamId: number): Promise<Result<{ processed: number; remaining: number }>> {
        try {
            const BATCH_SIZE = 50;
            const recordsWithoutEmbedding = await db
                .select()
                .from(works)
                .where(and(eq(works.tenantId, teamId), withActiveTenant(works, teamId), isNull(works.embedding)))
                .limit(BATCH_SIZE);

            if (recordsWithoutEmbedding.length === 0) {
                return success({ processed: 0, remaining: 0 });
            }

            const contexts = recordsWithoutEmbedding.map(w => buildWorkContext(w as NewWork));
            const embeddings = await generateEmbeddingsBatch(contexts);

            if (embeddings && embeddings.length === recordsWithoutEmbedding.length) {
                const updates: { id: string; embedding: number[] }[] = [];
                for (let i = 0; i < recordsWithoutEmbedding.length; i++) {
                    const embedding = embeddings[i];
                    if (embedding) {
                        updates.push({
                            id: recordsWithoutEmbedding[i].id,
                            embedding: embedding,
                        });
                    }
                }

                if (updates.length > 0) {
                    await db.transaction(async (tx) => {
                        const sqlChunks = [];
                        sqlChunks.push(sql`(CASE`);
                        for (const update of updates) {
                            sqlChunks.push(sql`WHEN ${works.id} = ${update.id} THEN ${JSON.stringify(update.embedding)}::vector`);
                        }
                        sqlChunks.push(sql`END)`);
                        const finalSql = sql.join(sqlChunks, sql` `);

                        await tx.update(works)
                            .set({ embedding: finalSql })
                            .where(inArray(works.id, updates.map(u => u.id)));
                    });
                }
            }

            const [{ count }] = await db
                .select({ count: sql<number>`count(*)` })
                .from(works)
                .where(and(eq(works.tenantId, teamId), withActiveTenant(works, teamId), isNull(works.embedding)));

            return success({ processed: recordsWithoutEmbedding.length, remaining: Number(count) });
        } catch (e) {
            console.error('generateMissingEmbeddings (works) error:', e);
            return error('Сбой процесса генерации эмбеддингов');
        }
    }
}
