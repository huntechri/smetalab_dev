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

  const rows = await db
    .select({
      id: counterparties.id,
      name: counterparties.name,
      type: counterparties.type,
      legalStatus: counterparties.legalStatus,
      inn: counterparties.inn,
      phone: counterparties.phone,
      legalAddress: counterparties.legalAddress,
      bankName: counterparties.bankName,
      bik: counterparties.bik,
      corrAccount: counterparties.corrAccount,
      accountNumber: counterparties.accountNumber,
      passportSeries: counterparties.passportSeries,
      passportNumber: counterparties.passportNumber,
      passportIssuedBy: counterparties.passportIssuedBy,
      passportIssueDate: counterparties.passportIssueDate,
      passportDepartmentCode: counterparties.passportDepartmentCode,
      passportRegistrationAddress: counterparties.passportRegistrationAddress,
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

  const data = rows.map((row) => {
    const result: CounterpartyRow = {
      id: row.id,
      name: row.name,
      type: row.type as CounterpartyRow['type'],
      legalStatus: row.legalStatus as CounterpartyRow['legalStatus'],
      inn: row.inn ?? '',
      phone: row.phone ?? '',
      legalAddress: row.legalAddress ?? undefined,
    };

    if (row.legalStatus === 'juridical' && row.bankName) {
      result.bankDetails = {
        bankName: row.bankName ?? '',
        bik: row.bik ?? '',
        corrAccount: row.corrAccount ?? '',
        accountNumber: row.accountNumber ?? '',
      };
    }

    if (row.legalStatus === 'individual' && row.passportSeries) {
      result.passport = {
        series: row.passportSeries ?? '',
        number: row.passportNumber ?? '',
        issuedBy: row.passportIssuedBy ?? '',
        issueDate: row.passportIssueDate ?? '',
        departmentCode: row.passportDepartmentCode ?? '',
        registrationAddress: row.passportRegistrationAddress ?? '',
      };
    }

    return result;
  });

  return {
    data,
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
