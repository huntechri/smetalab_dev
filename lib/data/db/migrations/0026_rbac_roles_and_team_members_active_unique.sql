ALTER TYPE "public"."tenant_role" ADD VALUE IF NOT EXISTS 'owner';
ALTER TYPE "public"."tenant_role" ADD VALUE IF NOT EXISTS 'member';

DROP INDEX IF EXISTS "team_members_active_unique";
CREATE UNIQUE INDEX "team_members_active_unique" ON "team_members" USING btree ("team_id", "user_id") WHERE "left_at" IS NULL;
