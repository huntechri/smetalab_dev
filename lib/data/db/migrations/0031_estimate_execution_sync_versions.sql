ALTER TABLE "estimates"
  ADD COLUMN IF NOT EXISTS "execution_sync_version" integer DEFAULT 0 NOT NULL,
  ADD COLUMN IF NOT EXISTS "execution_synced_version" integer DEFAULT 0 NOT NULL;
