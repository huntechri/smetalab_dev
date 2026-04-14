import { resolveDbSyncOptions, runDbSync } from '../lib/data/db/db-sync';

async function main() {
  const options = resolveDbSyncOptions(process.argv.slice(2));

  if (options.skipGenerate) {
    console.log('Skipping migration generation (--skip-generate).');
  }

  if (options.allowProduction) {
    console.log('Production safety guard disabled (--allow-production).');
  }

  console.log('Synchronizing database schema...');
  await runDbSync(options);
  console.log('Database schema is synchronized.');
}

main().catch((error) => {
  console.error('Database synchronization failed.');
  console.error(error);
  process.exit(1);
});
