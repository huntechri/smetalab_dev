'use server';

import { z } from 'zod';
import { safeAction } from '@/lib/actions/safe-action';
import { success } from '@/lib/utils/result';
import { getMaterialSuppliersPage } from '@/lib/data/db/material-suppliers-queries';
import { MaterialSupplierRow } from '@/shared/types/domain/material-supplier-row';

const listMaterialSuppliersSchema = z.object({
  limit: z.number().int().min(1).max(200).optional(),
  offset: z.number().int().min(0).optional(),
  search: z.string().max(200).optional(),
});

type MaterialSuppliersPageResult = {
  data: MaterialSupplierRow[];
  count: number;
  hasMore: boolean;
  nextOffset: number;
};

export const listMaterialSuppliers = safeAction<MaterialSuppliersPageResult, [z.infer<typeof listMaterialSuppliersSchema>]>(
  async ({ team }, params) => {
    const validatedParams = listMaterialSuppliersSchema.parse(params);
    const result = await getMaterialSuppliersPage(team.id, validatedParams);

    return success(result);
  },
  { name: 'listMaterialSuppliers' }
);
