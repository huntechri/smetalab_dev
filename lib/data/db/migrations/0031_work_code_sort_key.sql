ALTER TABLE "works"
ADD COLUMN IF NOT EXISTS "code_sort_key" text NOT NULL DEFAULT '~';--> statement-breakpoint

UPDATE "works"
SET "code_sort_key" = CASE
  WHEN trim("code") ~ '^[0-9]+(\.[0-9]+)*$' THEN (
    SELECT string_agg(lpad(part, 10, '0'), '.' ORDER BY ord)
    FROM unnest(string_to_array(trim("code"), '.')) WITH ORDINALITY AS parts(part, ord)
  )
  ELSE '~'
END;--> statement-breakpoint

CREATE INDEX IF NOT EXISTS "works_tenant_deleted_code_sort_order_idx"
ON "works" USING btree ("tenant_id","deleted_at","code_sort_key","sort_order");
