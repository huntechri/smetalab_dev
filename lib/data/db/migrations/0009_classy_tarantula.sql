DROP INDEX "counterparties_tenant_idx";--> statement-breakpoint
DROP INDEX "counterparties_name_idx";--> statement-breakpoint
DROP INDEX "counterparties_inn_idx";--> statement-breakpoint
DROP INDEX "counterparties_phone_idx";--> statement-breakpoint
DROP INDEX "counterparties_email_idx";--> statement-breakpoint
DROP INDEX "counterparties_updated_at_idx";--> statement-breakpoint
DROP INDEX "counterparties_active_tenant_idx";--> statement-breakpoint
CREATE INDEX "counterparties_tenant_updated_idx" ON "counterparties" USING btree ("tenant_id","updated_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "counterparties_name_trgm_idx" ON "counterparties" USING gin ("name" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX "counterparties_address_trgm_idx" ON "counterparties" USING gin ("address" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX "counterparties_inn_tenant_idx" ON "counterparties" USING btree ("tenant_id","inn");--> statement-breakpoint
CREATE INDEX "counterparties_ogrn_tenant_idx" ON "counterparties" USING btree ("tenant_id","ogrn");--> statement-breakpoint
CREATE INDEX "counterparties_phone_trgm_idx" ON "counterparties" USING gin ("phone" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX "counterparties_email_trgm_idx" ON "counterparties" USING gin ("email" gin_trgm_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "counterparties_company_inn_kpp_tenant_idx" ON "counterparties" USING btree ("tenant_id","inn","kpp") WHERE deleted_at IS NULL AND legal_status = 'company';--> statement-breakpoint
CREATE UNIQUE INDEX "counterparties_individual_inn_tenant_idx" ON "counterparties" USING btree ("tenant_id","inn") WHERE deleted_at IS NULL AND legal_status = 'individual';