'use server';

import {
  createMaterialSupplierUseCase,
  deleteMaterialSupplierUseCase,
  updateMaterialSupplierUseCase,
} from '@/lib/domain/material-suppliers/use-cases';
import { z } from 'zod';
import { safeAction } from '@/lib/actions/safe-action';
import { success, error } from '@/lib/utils/result';
import { MaterialSupplierRow } from '@/shared/types/domain/material-supplier-row';

const materialSupplierSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  legalStatus: z.enum(['individual', 'company']),

  birthDate: z.string().optional().nullable().or(z.literal('')),
  passportSeriesNumber: z.string().optional().nullable().or(z.literal('')),
  passportIssuedBy: z.string().optional().nullable().or(z.literal('')),
  passportIssuedDate: z.string().optional().nullable().or(z.literal('')),
  departmentCode: z.string().optional().nullable().or(z.literal('')),

  ogrn: z.string().optional().nullable().or(z.literal('')),
  inn: z.string().optional().nullable().or(z.literal('')),
  kpp: z.string().optional().nullable().or(z.literal('')),

  address: z.string().optional().nullable().or(z.literal('')),
  phone: z.string().optional().nullable().or(z.literal('')),
  email: z.string().email().optional().or(z.literal('')).nullable(),

  bankName: z.string().optional().nullable().or(z.literal('')),
  bankAccount: z.string().optional().nullable().or(z.literal('')),
  corrAccount: z.string().optional().nullable().or(z.literal('')),
  bankInn: z.string().optional().nullable().or(z.literal('')),
  bankKpp: z.string().optional().nullable().or(z.literal('')),
});

export const createMaterialSupplier = safeAction<MaterialSupplierRow, [z.infer<typeof materialSupplierSchema>]>(
  async ({ team, user }, data) => {
    const validatedData = materialSupplierSchema.parse(data);

    try {
      const created = await createMaterialSupplierUseCase(team.id, user.id, validatedData);
      return success(created as MaterialSupplierRow);
    } catch (e: unknown) {
      const pgCode = (e as { code?: string; cause?: { code?: string } }).code
        || (e as { cause?: { code?: string } }).cause?.code;
      if (pgCode === '23505') {
        return error('Поставщик материалов с такими ИНН/КПП уже существует в вашей организации', 'DUPLICATE_RECORD');
      }
      throw e;
    }
  },
  { name: 'createMaterialSupplier' }
);

export const updateMaterialSupplier = safeAction<MaterialSupplierRow, [{ id: string; data: z.infer<typeof materialSupplierSchema> }]>(
  async ({ team, user }, { id, data }) => {
    const validatedData = materialSupplierSchema.parse(data);
    const updated = await updateMaterialSupplierUseCase(team.id, user.id, id, validatedData);
    return success(updated as MaterialSupplierRow);
  },
  { name: 'updateMaterialSupplier' }
);

export const deleteMaterialSupplier = safeAction<boolean, [string]>(
  async ({ team, user }, id) => {
    await deleteMaterialSupplierUseCase(team.id, user.id, id);
    return success(true);
  },
  { name: 'deleteMaterialSupplier' }
);
