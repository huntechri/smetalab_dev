import { db } from '../lib/data/db/drizzle';
import { materials } from '../lib/data/db/schema';
import { sql } from 'drizzle-orm';
import { MaterialsService } from '../lib/domain/materials/materials.service';
import dotenv from 'dotenv';
import { performance } from 'perf_hooks';

dotenv.config();

async function benchmark() {
    console.log('--- Materials Search Benchmark ---');

    // Setup: Get a team with materials
    const team = await db.query.teams.findFirst();
    if (!team) {
        console.error('No team found for benchmark');
        return;
    }

    const materialResult = await db.select({ count: sql<number>`count(*)` }).from(materials);
    console.log(`Dataset size: ${materialResult[0].count} materials (Team: ${team.name})`);

    const queries = [
        'цемент',                // Short query
        'ротбанд штукатурка',   // Multi-token, synonym
        'osb 9мм',              // Multi-token, abbreviation
        'M-001',                // Code-like (assuming existence)
        'Knauf Rotband'         // Brand + Name
    ];

    const iterations = 5;
    const allLatencies: number[] = [];

    console.log(`Running benchmark with ${iterations} iterations per query...\n`);

    for (const q of queries) {
        const queryLatencies: number[] = [];
        for (let i = 0; i < iterations; i++) {
            const start = performance.now();
            await MaterialsService.search(team.id, q);
            const end = performance.now();
            const latency = end - start;
            queryLatencies.push(latency);
            allLatencies.push(latency);
        }

        queryLatencies.sort((a, b) => a - b);
        const p50 = queryLatencies[Math.floor(queryLatencies.length * 0.5)];
        const p95 = queryLatencies[Math.floor(queryLatencies.length * 0.95)];

        console.log(`Query: "${q}"`);
        console.log(`  p50: ${p50.toFixed(2)}ms`);
        console.log(`  p95: ${p95.toFixed(2)}ms`);
    }

    allLatencies.sort((a, b) => a - b);
    const totalP50 = allLatencies[Math.floor(allLatencies.length * 0.5)];
    const totalP95 = allLatencies[Math.floor(allLatencies.length * 0.95)];

    console.log(`\n--- Global Performance ---`);
    console.log(`Global p50: ${totalP50.toFixed(2)}ms`);
    console.log(`Global p95: ${totalP95.toFixed(2)}ms`);
    console.log('--------------------------');

    process.exit(0);
}

benchmark().catch(err => {
    console.error('Benchmark failed:', err);
    process.exit(1);
});
