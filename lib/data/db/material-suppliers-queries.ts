import { and, desc, ilike, sql } from 'drizzle-orm';

import { db } from './drizzle';
import { materialSuppliers } from './schema';
import { withActiveTenant } from './tenant';
import { MaterialSupplierRow } from '@/shared/types/domain/material-supplier-row';

export async function getMaterialSuppliers(
  teamId: number,
  options: { limit?: number; offset?: number; search?: string } = {}
) {
  const { limit = 50, offset = 0, search } = options;

  const filters = [withActiveTenant(materialSuppliers, teamId)];

  if (search) {
    filters.push(ilike(materialSuppliers.name, `%${search}%`));
  }

  const data = await db
    .select({
      id: materialSuppliers.id,
      tenantId: materialSuppliers.tenantId,
      name: materialSuppliers.name,
      color: materialSuppliers.color,
      legalStatus: materialSuppliers.legalStatus,
      birthDate: materialSuppliers.birthDate,
      passportSeriesNumber: materialSuppliers.passportSeriesNumber,
      passportIssuedBy: materialSuppliers.passportIssuedBy,
      passportIssuedDate: materialSuppliers.passportIssuedDate,
      departmentCode: materialSuppliers.departmentCode,
      ogrn: materialSuppliers.ogrn,
      inn: materialSuppliers.inn,
      kpp: materialSuppliers.kpp,
      address: materialSuppliers.address,
      phone: materialSuppliers.phone,
      email: materialSuppliers.email,
      bankName: materialSuppliers.bankName,
      bankAccount: materialSuppliers.bankAccount,
      corrAccount: materialSuppliers.corrAccount,
      bankInn: materialSuppliers.bankInn,
      bankKpp: materialSuppliers.bankKpp,
      createdAt: materialSuppliers.createdAt,
      updatedAt: materialSuppliers.updatedAt,
      deletedAt: materialSuppliers.deletedAt,
    })
    .from(materialSuppliers)
    .where(and(...filters))
    .orderBy(desc(materialSuppliers.updatedAt))
    .limit(limit)
    .offset(offset);

  const countQuery = await db.select({ count: sql<number>`count(*)` }).from(materialSuppliers).where(and(...filters));

  return {
    data: data as MaterialSupplierRow[],
    count: Number(countQuery[0]?.count || 0),
  };
}

export async function getMaterialSuppliersPage(
  teamId: number,
  options: { limit?: number; offset?: number; search?: string } = {}
) {
  const { data, count } = await getMaterialSuppliers(teamId, options);
  const currentOffset = options.offset ?? 0;

  return {
    data,
    count,
    hasMore: currentOffset + data.length < count,
    nextOffset: currentOffset + data.length,
  };
}

export async function getMaterialSuppliersCount(teamId: number) {
  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(materialSuppliers)
    .where(withActiveTenant(materialSuppliers, teamId));

  return Number(result[0]?.count || 0);
}
