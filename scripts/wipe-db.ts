import postgres from 'postgres';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    console.error('DATABASE_URL is not defined');
    process.exit(1);
}

const sql = postgres(connectionString);

async function main() {
    console.log('Wiping public schema and all types to clear db completely...');
    await sql`DROP SCHEMA IF EXISTS public CASCADE`;
    await sql`CREATE SCHEMA public`;
    await sql`GRANT ALL ON SCHEMA public TO public`;

    // Neon specific role
    try {
        await sql`GRANT ALL ON SCHEMA public TO neondb_owner`;
    } catch (_error) { /* ignore if not exist */ }

    console.log('Database schema dropped and recreated successfully!');
    await sql.end();
}

main().catch((err) => {
    console.error('Wipe failed!');
    console.error(err);
    process.exit(1);
});
