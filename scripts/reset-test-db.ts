import * as dotenv from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import path from 'path';

// Force load .env.test
dotenv.config({ path: path.resolve(process.cwd(), '.env.test') });

const dbUrl = process.env.TEST_DATABASE_URL;
if (!dbUrl) {
    throw new Error('TEST_DATABASE_URL not found');
}

if (!dbUrl.includes('neondb')) {
    console.warn('⚠️  Warning: This script is intended for Neon DB test branch.');
}

const client = postgres(dbUrl, { max: 1 });
const db = drizzle(client);

async function reset() {
    console.log('Resetting database...');
    console.log('🔥 Dropping public schema...');

    // Drop all objects in public schema
    await client`DROP SCHEMA public CASCADE`;
    await client`CREATE SCHEMA public`;
    await client`GRANT ALL ON SCHEMA public TO public`;
    await client`COMMENT ON SCHEMA public IS 'standard public schema'`;

    // Restore necessary extensions
    // Ideally these should be part of migration or DB setup, but for reset we do it here
    console.log('Restoring extensions...');
    try {
        await client`CREATE EXTENSION IF NOT EXISTS vector`;
        await client`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
        await client`CREATE EXTENSION IF NOT EXISTS pgcrypto`;
    } catch (e) {
        console.warn('Failed to restore extensions:', e);
    }

    console.log('✅ Database schema wiped and reset. Ready for migration.');
    process.exit(0);
}

reset().catch(e => {
    console.error('Failed to reset:', e);
    process.exit(1);
});
