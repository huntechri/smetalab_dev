import { z } from 'zod';
import type { CatalogMaterial } from '@/features/catalog/types/dto';
import { getTodayIsoLocal } from './date';
import type { PurchaseRow, PurchaseRowPatch } from '../types/dto';

const nonNegativeNumber = z.coerce.number().finite().min(0);

export const purchaseRowSchema = z.object({
  id: z.string().min(1),
  projectId: z.string().uuid().nullable(),
  projectName: z.string().trim().max(160),
  materialName: z.string().trim().max(240),
  unit: z.string().trim().max(20),
  qty: nonNegativeNumber,
  price: nonNegativeNumber,
  amount: nonNegativeNumber,
  note: z.string().trim().max(500),
  source: z.enum(['manual', 'catalog']),
  purchaseDate: z.string().date(),
  supplierId: z.string().uuid().nullable(),
  supplierName: z.string().nullable(),
  supplierColor: z.string().nullable(),
});

export const purchaseRowPatchSchema = z.object({
  projectId: z.string().uuid().nullable().optional(),
  materialName: z.string().trim().max(240).optional(),
  unit: z.string().trim().max(20).optional(),
  qty: nonNegativeNumber.optional(),
  price: nonNegativeNumber.optional(),
  note: z.string().trim().max(500).optional(),
  purchaseDate: z.string().date().optional(),
  supplierId: z.string().uuid().nullable().optional(),
});

export function calculatePurchaseAmount(qty: number, price: number): number {
  return Math.round((qty * price + Number.EPSILON) * 100) / 100;
}

export function createManualPurchaseRow(defaults?: Partial<Pick<PurchaseRow, 'projectName'>>): PurchaseRow {
  const row: PurchaseRow = {
    id: crypto.randomUUID(),
    projectId: null,
    projectName: defaults?.projectName ?? '',
    materialName: '',
    unit: 'шт',
    qty: 1,
    price: 0,
    amount: 0,
    note: '',
    source: 'manual',
    purchaseDate: getTodayIsoLocal(),
    supplierId: null,
    supplierName: null,
    supplierColor: null,
  };

  return purchaseRowSchema.parse(row);
}

export function createCatalogPurchaseRow(material: CatalogMaterial, projectName: string): PurchaseRow {
  const safePrice = Number(material.price);
  const price = Number.isFinite(safePrice) ? safePrice : 0;

  const row: PurchaseRow = {
    id: crypto.randomUUID(),
    projectId: null,
    projectName,
    materialName: material.name,
    unit: material.unit || 'шт',
    qty: 1,
    price,
    amount: calculatePurchaseAmount(1, price),
    note: '',
    source: 'catalog',
    purchaseDate: getTodayIsoLocal(),
    supplierId: null,
    supplierName: null,
    supplierColor: null,
  };

  return purchaseRowSchema.parse(row);
}

export function patchPurchaseRow(row: PurchaseRow, patch: PurchaseRowPatch): PurchaseRow {
  const normalizedPatch = purchaseRowPatchSchema.parse(patch);
  const next: PurchaseRow = {
    ...row,
    ...normalizedPatch,
  };

  if (normalizedPatch.supplierId !== undefined && normalizedPatch.supplierId === null) {
    next.supplierName = null;
    next.supplierColor = null;
  }

  next.amount = calculatePurchaseAmount(next.qty, next.price);

  return purchaseRowSchema.parse(next);
}
