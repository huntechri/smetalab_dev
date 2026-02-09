ALTER TABLE "counterparties" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
CREATE INDEX "counterparties_phone_idx" ON "counterparties" USING btree ("phone");--> statement-breakpoint
CREATE INDEX "counterparties_email_idx" ON "counterparties" USING btree ("email");--> statement-breakpoint
CREATE INDEX "counterparties_updated_at_idx" ON "counterparties" USING btree ("updated_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "counterparties_active_tenant_idx" ON "counterparties" USING btree ("tenant_id") WHERE deleted_at IS NULL;--> statement-breakpoint
ALTER TABLE "counterparties" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE POLICY superadmin_all_counterparties ON "counterparties" FOR ALL USING (current_setting('app.platform_role', true) = 'superadmin');--> statement-breakpoint
CREATE POLICY tenant_isolation_counterparties ON "counterparties" FOR ALL USING (tenant_id = current_setting('app.tenant_id', true)::integer) WITH CHECK (tenant_id = current_setting('app.tenant_id', true)::integer);