import * as dotenv from 'dotenv';
import { execSync } from 'child_process';
import path from 'path';

// Load .env.test explicitly
const envTestPath = path.resolve(process.cwd(), '.env.test');
const result = dotenv.config({ path: envTestPath });

if (result.error) {
    console.error('Error loading .env.test:', result.error);
    process.exit(1);
}

const testDbUrl = process.env.TEST_DATABASE_URL;

if (!testDbUrl) {
    console.error('TEST_DATABASE_URL not found in .env.test');
    console.error('Loaded vars:', result.parsed);
    process.exit(1);
}

// Set DATABASE_URL for drizzle-kit to pick up
process.env.DATABASE_URL = testDbUrl;

console.log('🚀 Running migrations on TEST database...');
console.log('Target DB:', testDbUrl.split('@')[1]); // Log host only for safety

try {
    // Use npx to ensure we use local binaries
    execSync('npx drizzle-kit migrate --config=drizzle.config.mts', { stdio: 'inherit', env: process.env });
    console.log('✅ Migrations complete.');
} catch (_error) {
    console.error('❌ Migration failed.', _error);
    process.exit(1);
}
