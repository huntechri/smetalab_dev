import { sql } from 'drizzle-orm';

import { db } from './drizzle';

let ensureWorksCodeSortKeyColumnPromise: Promise<void> | null = null;

async function addMissingWorksCodeSortKeyColumn(): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "works"
    ADD COLUMN IF NOT EXISTS "code_sort_key" text NOT NULL DEFAULT '~'
  `);

  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "works_tenant_deleted_code_sort_order_idx"
    ON "works" USING btree ("tenant_id", "deleted_at", "code_sort_key", "sort_order")
  `);
}

export async function ensureWorksCodeSortKeyColumn(): Promise<void> {
  if (!ensureWorksCodeSortKeyColumnPromise) {
    ensureWorksCodeSortKeyColumnPromise = addMissingWorksCodeSortKeyColumn().catch((error: unknown) => {
      ensureWorksCodeSortKeyColumnPromise = null;
      throw error;
    });
  }

  await ensureWorksCodeSortKeyColumnPromise;
}

export function resetSchemaCompatibilityStateForTests() {
  ensureWorksCodeSortKeyColumnPromise = null;
}
