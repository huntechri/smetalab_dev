import { sql } from 'drizzle-orm';

import { db } from './drizzle';

let ensureWorksCodeSortKeyColumnPromise: Promise<void> | null = null;
let ensureMaterialsSortOrderColumnPromise: Promise<void> | null = null;

const hasColumn = async (tableName: string, columnName: string): Promise<boolean> => {
  const result = await db.execute(sql<{ exists: boolean }>`
    SELECT EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = ${tableName}
        AND column_name = ${columnName}
    ) AS exists
  `);
  const rows = result as unknown as Array<{ exists: boolean }>;
  return rows[0]?.exists === true;
};

async function assertWorksCodeSortKeyColumn(): Promise<void> {
  // IMPORTANT: runtime request paths must never execute DDL (ALTER/CREATE/migrate).
  const exists = await hasColumn('works', 'code_sort_key');
  if (!exists) {
    throw new Error('MIGRATION_REQUIRED: works.code_sort_key is missing');
  }
}

async function assertMaterialsSortOrderColumn(): Promise<void> {
  // IMPORTANT: runtime request paths must never execute DDL (ALTER/CREATE/migrate).
  const exists = await hasColumn('materials', 'sort_order');
  if (!exists) {
    throw new Error('MIGRATION_REQUIRED: materials.sort_order is missing');
  }
}

export async function ensureWorksCodeSortKeyColumn(): Promise<void> {
  if (!ensureWorksCodeSortKeyColumnPromise) {
    ensureWorksCodeSortKeyColumnPromise = assertWorksCodeSortKeyColumn().catch((error: unknown) => {
      ensureWorksCodeSortKeyColumnPromise = null;
      throw error;
    });
  }

  await ensureWorksCodeSortKeyColumnPromise;
}

export async function ensureMaterialsSortOrderColumn(): Promise<void> {
  if (!ensureMaterialsSortOrderColumnPromise) {
    ensureMaterialsSortOrderColumnPromise = assertMaterialsSortOrderColumn().catch((error: unknown) => {
      ensureMaterialsSortOrderColumnPromise = null;
      throw error;
    });
  }

  await ensureMaterialsSortOrderColumnPromise;
}

export function resetSchemaCompatibilityStateForTests() {
  ensureWorksCodeSortKeyColumnPromise = null;
  ensureMaterialsSortOrderColumnPromise = null;
}
