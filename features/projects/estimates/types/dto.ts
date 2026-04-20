import { z } from 'zod';

export const estimateStatusSchema = z.enum(['draft', 'in_progress', 'approved']);
export type EstimateStatus = z.infer<typeof estimateStatusSchema>;

export const estimateRowKindSchema = z.enum(['section', 'work', 'material']);
export type EstimateRowKind = z.infer<typeof estimateRowKindSchema>;

export const estimateMetaSchema = z.object({
    id: z.string(),
    projectId: z.string(),
    name: z.string(),
    materialId: z.string().uuid().nullable().optional(),
    slug: z.string(),
    status: estimateStatusSchema,
    total: z.number(),
    coefPercent: z.number().optional(),
    createdAt: z.string(),
    updatedAt: z.string(),
});

export type EstimateMeta = z.infer<typeof estimateMetaSchema>;

export const estimateRowSchema = z.object({
    id: z.string(),
    kind: estimateRowKindSchema,
    parentWorkId: z.string().optional(),
    code: z.string(),
    name: z.string(),
    materialId: z.string().uuid().nullable().optional(),
    imageUrl: z.string().nullable().optional(),
    unit: z.string(),
    qty: z.number(),
    basePrice: z.number().optional(),
    price: z.number(),
    sum: z.number(),
    expense: z.number(),
    order: z.number(),
});

export type EstimateRow = z.infer<typeof estimateRowSchema>;

export const rowPatchSchema = z.object({
    name: z.string().min(1).optional(),
    materialId: z.string().uuid().nullable().optional(),
    unit: z.string().min(1).optional(),
    imageUrl: z.string().url().nullable().optional(),
    qty: z.number().nonnegative().optional(),
    price: z.number().nonnegative().optional(),
    expense: z.number().nonnegative().optional(),
});

export type RowPatch = z.infer<typeof rowPatchSchema>;
