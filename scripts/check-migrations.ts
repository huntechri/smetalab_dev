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

const client = postgres(dbUrl, { max: 1 });
const db = drizzle(client);

async function check() {
    console.log('Checking migrations...');
    try {
        const rows = await client`SELECT * FROM drizzle_migrations ORDER BY created_at DESC`;
        console.table(rows);
    } catch (e) {
        console.error('Error fetching migrations:', e);
    }
    process.exit(0);
}

check();
