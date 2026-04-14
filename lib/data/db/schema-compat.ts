import { sql } from 'drizzle-orm';

import { db } from './drizzle';

let ensureWorksCodeSortKeyColumnPromise: Promise<void> | null = null;
let ensureMaterialsSortOrderColumnPromise: Promise<void> | null = null;

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

async function addMissingMaterialsSortOrderColumn(): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "materials"
    ADD COLUMN IF NOT EXISTS "sort_order" double precision NOT NULL DEFAULT 0
  `);

  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "materials_sort_order_idx"
    ON "materials" USING btree ("sort_order")
  `);

  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "materials_tenant_sort_order_idx"
    ON "materials" USING btree ("tenant_id", "sort_order")
    WHERE "deleted_at" IS NULL
  `);

  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "materials_tenant_deleted_sort_order_idx"
    ON "materials" USING btree ("tenant_id", "deleted_at", "sort_order")
  `);

  await db.execute(sql`
    WITH ordered AS (
      SELECT
        "id",
        ROW_NUMBER() OVER (
          PARTITION BY "tenant_id"
          ORDER BY "sort_order" ASC, "code" ASC, "id" ASC
        ) * 100 AS "new_sort_order"
      FROM "materials"
      WHERE "deleted_at" IS NULL
    )
    UPDATE "materials" AS m
    SET "sort_order" = ordered."new_sort_order"
    FROM ordered
    WHERE m."id" = ordered."id"
      AND COALESCE(m."sort_order", 0) = 0
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

export async function ensureMaterialsSortOrderColumn(): Promise<void> {
  if (!ensureMaterialsSortOrderColumnPromise) {
    ensureMaterialsSortOrderColumnPromise = addMissingMaterialsSortOrderColumn().catch((error: unknown) => {
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
