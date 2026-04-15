import { sql, ExtractTablesWithRelations } from 'drizzle-orm';
import { PgTransaction } from 'drizzle-orm/pg-core';
import { drizzle, PostgresJsDatabase, PostgresJsQueryResultHKT } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString =
  process.env.DATABASE_URL ??
  process.env.TEST_DATABASE_URL ??
  process.env.POSTGRES_URL;

if (!connectionString) {
  if (process.env.NODE_ENV === 'production') {
    console.warn('⚠️  DATABASE_URL/TEST_DATABASE_URL/POSTGRES_URL are not set. Using mock DB client for build.');
  } else {
    throw new Error('DATABASE_URL/TEST_DATABASE_URL/POSTGRES_URL environment variables are not set');
  }
}

/**
 * Singleton pattern for the database client to prevent connection leaks during hot-reloads in development.
 */
const globalForDb = globalThis as unknown as {
  client: ReturnType<typeof postgres> | undefined;
  db: PostgresJsDatabase<typeof schema> | undefined;
};

const isLocalConnection =
  connectionString?.includes('localhost') || connectionString?.includes('127.0.0.1');
const sslRequired = !isLocalConnection;

// Helper to create a proxy that throws on access
const createThrowingProxy = (name: string) => new Proxy({}, {
  get: () => {
    throw new Error(`${name} is not initialized because DATABASE_URL/TEST_DATABASE_URL/POSTGRES_URL are missing.`);
  }
});

export const client = connectionString
  ? (globalForDb.client ?? postgres(connectionString, {
    prepare: false,
    ssl: sslRequired ? 'require' : false,
    max: process.env.NODE_ENV === 'production' ? 10 : 20,
    idle_timeout: 10, // Reduce idle timeout to close inactive connections faster than the server
    connect_timeout: 15, // Increase connect timeout for cold starts
    onnotice: () => { }, // Quiet notice logs
  }))
  : (createThrowingProxy('Database client') as ReturnType<typeof postgres>);

export const db = connectionString
  ? (globalForDb.db ?? drizzle(client, { schema }))
  : (createThrowingProxy('Drizzle ORM') as PostgresJsDatabase<typeof schema>);

if (process.env.NODE_ENV !== 'production' && connectionString) {
  globalForDb.client = client;
  globalForDb.db = db;
}

type TransactionInstance = PgTransaction<
  PostgresJsQueryResultHKT,
  typeof schema,
  ExtractTablesWithRelations<typeof schema>
>;

/**
 * Executes a callback within a transaction that sets the session tenant context for RLS.
 */
export async function withTenantContext<T>(
  tenantId: number,
  platformRole: string | null,
  callback: (tx: TransactionInstance) => Promise<T>
): Promise<T> {
  return await db.transaction(async (tx) => {
    await tx.execute(sql`SELECT set_config('app.tenant_id', ${tenantId.toString()}, true)`);
    if (platformRole) {
      await tx.execute(sql`SELECT set_config('app.platform_role', ${platformRole}, true)`);
    }
    return await callback(tx);
  });
}
