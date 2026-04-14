import { db } from '../lib/data/db/drizzle';
import { MaterialsService } from '../lib/domain/materials/materials.service';
import dotenv from 'dotenv';

dotenv.config();

async function main() {
    const teams = await db.query.teams.findMany();
    console.log(`Starting reindexing for ${teams.length} teams...`);

    for (const team of teams) {
        console.log(`Reindexing team: ${team.name} (ID: ${team.id})`);

        // Simple loop to process all materials in batches
        let totalProcessed = 0;
        while (true) {
            const result = await MaterialsService.reindexAllEmbeddings(team.id, totalProcessed);
            if (!result.success) {
                console.error(`Error reindexing team ${team.id}:`, result.error);
                break;
            }
            if (result.data.processed === 0) break;

            totalProcessed += result.data.processed;
            console.log(`  Processed ${totalProcessed} materials...`);
        }
    }

    console.log('Reindexing complete.');
    process.exit(0);
}

main().catch(err => {
    console.error('Reindexing failed:', err);
    process.exit(1);
});
