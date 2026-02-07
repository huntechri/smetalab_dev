CREATE INDEX IF NOT EXISTS "activity_logs_user_timestamp_idx" ON "activity_logs" USING btree ("user_id","timestamp" DESC NULLS LAST);
