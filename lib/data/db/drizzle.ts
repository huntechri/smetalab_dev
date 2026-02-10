import 'server-only';
import { drizzle, PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import { sql, ExtractTablesWithRelations } from 'drizzle-orm';
import { PgTransaction } from 'drizzle-orm/pg-core';
import { PostgresJsQueryResultHKT } from 'drizzle-orm/postgres-js';

// Используется Neon DB для разработки и продакшена
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set');
}

/**
 * Singleton pattern for the database client to prevent connection leaks during hot-reloads in development.
 */
const globalForDb = globalThis as unknown as {
  client: ReturnType<typeof postgres> | undefined;
  db: PostgresJsDatabase<typeof schema> | undefined;
};

const isLocalConnection = connectionString.includes('localhost') || connectionString.includes('127.0.0.1');
const sslRequired = !isLocalConnection;

export const client =
  globalForDb.client ??
  postgres(connectionString, {
    prepare: false,
    ssl: sslRequired ? 'require' : false,
    max: process.env.NODE_ENV === 'production' ? 5 : 10, // Разрешаем небольшую вложенность для предотвращения дедлоков
    idle_timeout: 20, // Закрывать неактивные соединения быстрее
    connect_timeout: 10, // Быстрее выдавать ошибку при проблемах связи
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
