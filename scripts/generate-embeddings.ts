import 'dotenv/config';
import { db } from '@/lib/data/db/drizzle.node';
import { materials, works } from '@/lib/data/db/schema';
import { generateEmbeddingsBatch } from '@/lib/ai/embeddings';
import { buildMaterialContext, buildWorkContext, MaterialContextInput, WorkContextInput } from '@/lib/ai/embedding-context';
import { eq, isNull, sql, inArray } from 'drizzle-orm';

async function processTable(
    table: typeof materials | typeof works,
    tableName: 'materials' | 'works'
) {
    console.log(`\n🔍 Checking ${tableName}...`);

    const BATCH_SIZE = 2000;
    let totalProcessed = 0;

    // Determine target columns explicitly to satisfy TypeScript
    const embeddingCol = tableName === 'materials' ? materials.embedding : works.embedding;

    while (true) {
        // Query missing embeddings using the determined column
        const batch = await db.select().from(table)
            .where(isNull(embeddingCol))
            .limit(BATCH_SIZE);

        if (batch.length === 0) {
            console.log(`✅ No more ${tableName} to process.`);
            break;
        }

        console.log(`📦 [${tableName}] Processing batch of ${batch.length} items...`);

        // Prepare context strings based on table type
        const texts = batch.map(item => {
            if (tableName === 'materials') {
                return buildMaterialContext(item as unknown as MaterialContextInput);
            } else {
                return buildWorkContext(item as unknown as WorkContextInput);
            }
        });

        // Generate embeddings via OpenAI
        const embeddings = await generateEmbeddingsBatch(texts);

        if (!embeddings || embeddings.length !== batch.length) {
            console.error(`❌ Error generating embeddings for ${tableName} batch. Skipping batch to avoid infinite loop.`);
            break;
        }

        // Update records in parallel for speed
        await Promise.all(batch.map(async (item, i) => {
            // We cast item to any only for the ID access since we know both tables have 'id'
            // and we use the original table objects to ensure type safety for columns
            const itemId = (item as { id: string }).id;

            if (tableName === 'materials') {
                await db.update(materials)
                    .set({ embedding: embeddings[i], updatedAt: new Date() })
                    .where(eq(materials.id, itemId));
            } else {
                await db.update(works)
                    .set({ embedding: embeddings[i], updatedAt: new Date() })
                    .where(eq(works.id, itemId));
            }
        }));

        totalProcessed += batch.length;
        console.log(`✨ [${tableName}] Processed ${totalProcessed} items so far.`);

        // Delay to respect rate limits (OpenAI TPM/RPM)
        await new Promise(r => setTimeout(r, 1000));
    }
}

async function main() {
    console.log('🚀 Starting AI Embedding Generation...');

    if (!process.env.OPENAI_API_KEY) {
        console.error('❌ CRITICAL: OPENAI_API_KEY is not defined. Exiting.');
        process.exit(1);
    }

    const force = process.argv.includes('--force');
    if (force) {
        console.log('⚠️  FORCE MODE: Regenerating ALL embeddings.');

        for (const table of [materials, works]) {
            const tableName = table === materials ? 'materials' : 'works';
            console.log(`🧹 Clearing ${tableName} embeddings in batches...`);

            let cleared = 0;
            while (true) {
                // Correct PG way for batched update:
                const subquery = db.select({ id: table.id })
                    .from(table)
                    .where(sql`${table}.embedding IS NOT NULL`)
                    .limit(5000);

                await db.update(table)
                    .set({ embedding: null })
                    .where(inArray(table.id, subquery));

                // In Drizzle, we can check how many were affected if returning is used,
                // but select + update is safer for batching.
                const remaining = await db.select({ count: sql<number>`count(*)` })
                    .from(table)
                    .where(sql`${table}.embedding IS NOT NULL`);

                cleared += 5000;
                console.log(`  - Cleared ~${cleared} items...`);

                if (Number(remaining[0].count) === 0) break;
            }
        }
        console.log('✨ All existing embeddings cleared.');
    }

    await processTable(materials, 'materials');
    await processTable(works, 'works');

    console.log('\n🎉 Done! All materials and works processed.');
    process.exit(0);
}

main().catch((err) => {
    console.error('Fatal error:', err);
    process.exit(1);
});
