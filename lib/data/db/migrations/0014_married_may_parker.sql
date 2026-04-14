ALTER TABLE "estimates" ADD COLUMN IF NOT EXISTS "slug" varchar(120) NOT NULL;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "slug" varchar(120) NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "estimates_project_slug_idx" ON "estimates" USING btree ("project_id","slug") WHERE deleted_at IS NULL;--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "projects_tenant_slug_idx" ON "projects" USING btree ("tenant_id","slug") WHERE deleted_at IS NULL;
