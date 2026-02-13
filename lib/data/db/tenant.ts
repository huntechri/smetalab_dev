import { and, eq, isNull, or, type AnyColumn } from 'drizzle-orm';

export const SYSTEM_TENANT_ID = 1;

/**
 * Центр управления безопасностью данных (Multi-tenancy).
 * Гарантирует, что запрос всегда ограничен текущим арендатором и не включает удаленные записи.
 * Также включает глобальные записи (tenantId = 1).
 */
export function withActiveTenant(
  table: { tenantId: AnyColumn; deletedAt: AnyColumn },
  teamId: number | null | undefined
) {
  const filters = [isNull(table.deletedAt)];

  if (typeof teamId === 'number') {
    filters.push(or(eq(table.tenantId, SYSTEM_TENANT_ID), eq(table.tenantId, teamId))!);
  } else {
    filters.push(eq(table.tenantId, SYSTEM_TENANT_ID));
  }

  return and(...filters);
}
