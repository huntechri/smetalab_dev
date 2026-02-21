import { sql, ExtractTablesWithRelations } from 'drizzle-orm';
import { PgTransaction } from 'drizzle-orm/pg-core';
import { drizzle, PostgresJsDatabase, PostgresJsQueryResultHKT } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL ?? process.env.TEST_DATABASE_URL ?? 'postgres://dummy:dummy@localhost:5432/dummy';

/**
 * Singleton pattern for the database client to prevent connection leaks during hot-reloads in development.
 */
const globalForDb = globalThis as unknown as {
  client: ReturnType<typeof postgres> | undefined;
  db: PostgresJsDatabase<typeof schema> | undefined;
};

const isLocalConnection =
  connectionString.includes('localhost') || connectionString.includes('127.0.0.1');
const sslRequired = !isLocalConnection && !connectionString.includes('dummy');

export const client = globalForDb.client ?? postgres(connectionString, {
      prepare: false,
      ssl: sslRequired ? 'require' : false,
      max: process.env.NODE_ENV === 'production' ? 5 : 10,
      idle_timeout: 20,
      connect_timeout: 10,
    });

export const db = globalForDb.db ?? drizzle(client, { schema });

if (process.env.NODE_ENV !== 'production') {
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
