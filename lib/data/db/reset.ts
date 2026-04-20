import 'dotenv/config';
import postgres from 'postgres';

async function main() {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
        throw new Error('DATABASE_URL is not defined');
    }

    // Safety check to prevent accidental production resets
    if (process.env.NODE_ENV === 'production' && !process.env.FORCE_RESET) {
        console.error('Cannot reset database in production without FORCE_RESET=true');
        process.exit(1);
    }

    const sql = postgres(connectionString, {
        max: 1,
        ssl: connectionString.includes('localhost') ? false : 'require',
    });

    try {
        console.log('🗑️  Resetting database...');

        // Drop all tables in public schema and recreate it
        await sql`DROP SCHEMA IF EXISTS public CASCADE`;
        await sql`CREATE SCHEMA public`;
        await sql`GRANT ALL ON SCHEMA public TO public`;
        await sql`COMMENT ON SCHEMA public IS 'standard public schema'`;

        // Drop drizzle schema to reset migrations history
        await sql`DROP SCHEMA IF EXISTS drizzle CASCADE`;

        console.log('✅ Database reset complete');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error resetting database:', error);
        process.exit(1);
    } finally {
        await sql.end();
    }
}

main();
