CREATE TABLE IF NOT EXISTS "estimate_patterns" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "tenant_id" integer NOT NULL,
  "name" varchar(160) NOT NULL,
  "description" text,
  "rows_count" integer DEFAULT 0 NOT NULL,
  "works_count" integer DEFAULT 0 NOT NULL,
  "materials_count" integer DEFAULT 0 NOT NULL,
  "snapshot" jsonb NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  "deleted_at" timestamp
);

DO $$ BEGIN
 ALTER TABLE "estimate_patterns" ADD CONSTRAINT "estimate_patterns_tenant_id_teams_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

CREATE INDEX IF NOT EXISTS "estimate_patterns_tenant_updated_at_idx" ON "estimate_patterns" USING btree ("tenant_id","updated_at" DESC) WHERE "estimate_patterns"."deleted_at" IS NULL;
CREATE INDEX IF NOT EXISTS "estimate_patterns_tenant_name_idx" ON "estimate_patterns" USING btree ("tenant_id","name") WHERE "estimate_patterns"."deleted_at" IS NULL;
