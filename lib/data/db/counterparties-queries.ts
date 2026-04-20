import { and, desc, ilike, sql } from 'drizzle-orm';

import { db } from './drizzle';
import { counterparties } from './schema';
import { withActiveTenant } from './tenant';
import { CounterpartyRow } from '@/shared/types/domain/counterparty-row';

export async function getCounterparties(
  teamId: number,
  options: { limit?: number; offset?: number; search?: string } = {}
) {
  const { limit = 50, offset = 0, search } = options;

  const filters = [withActiveTenant(counterparties, teamId)];

  if (search) {
    filters.push(ilike(counterparties.name, `%${search}%`));
  }

  const data = await db
    .select({
      id: counterparties.id,
      tenantId: counterparties.tenantId,
      type: counterparties.type,
      legalStatus: counterparties.legalStatus,
      name: counterparties.name,
      birthDate: counterparties.birthDate,
      passportSeriesNumber: counterparties.passportSeriesNumber,
      passportIssuedBy: counterparties.passportIssuedBy,
      passportIssuedDate: counterparties.passportIssuedDate,
      departmentCode: counterparties.departmentCode,
      ogrn: counterparties.ogrn,
      inn: counterparties.inn,
      kpp: counterparties.kpp,
      address: counterparties.address,
      phone: counterparties.phone,
      email: counterparties.email,
      bankName: counterparties.bankName,
      bankAccount: counterparties.bankAccount,
      corrAccount: counterparties.corrAccount,
      bankInn: counterparties.bankInn,
      bankKpp: counterparties.bankKpp,
      createdAt: counterparties.createdAt,
      updatedAt: counterparties.updatedAt,
      deletedAt: counterparties.deletedAt,
    })
    .from(counterparties)
    .where(and(...filters))
    .orderBy(desc(counterparties.updatedAt))
    .limit(limit)
    .offset(offset);

  const countQuery = await db.select({ count: sql<number>`count(*)` }).from(counterparties).where(and(...filters));

  return {
    data: data as unknown as CounterpartyRow[],
    count: Number(countQuery[0].count),
  };
}

export async function getCounterpartiesCount(teamId: number, search?: string) {
  const filters = [withActiveTenant(counterparties, teamId)];

  if (search) {
    filters.push(ilike(counterparties.name, `%${search}%`));
  }

  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(counterparties)
    .where(and(...filters));

  return Number(result[0].count);
}
