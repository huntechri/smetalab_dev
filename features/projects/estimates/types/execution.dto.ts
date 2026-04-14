import { z } from 'zod';

export const estimateExecutionSourceSchema = z.enum(['from_estimate', 'extra']);
export type EstimateExecutionSource = z.infer<typeof estimateExecutionSourceSchema>;

export const estimateExecutionStatusSchema = z.enum(['not_started', 'in_progress', 'done']);
export type EstimateExecutionStatus = z.infer<typeof estimateExecutionStatusSchema>;

export const estimateExecutionRowSchema = z.object({
    id: z.string().uuid(),
    estimateRowId: z.string().uuid().nullable(),
    source: estimateExecutionSourceSchema,
    status: estimateExecutionStatusSchema,
    code: z.string(),
    name: z.string(),
    unit: z.string(),
    plannedQty: z.number(),
    plannedPrice: z.number(),
    plannedSum: z.number(),
    actualQty: z.number(),
    actualPrice: z.number(),
    actualSum: z.number(),
    isCompleted: z.boolean(),
    order: z.number(),
});

export type EstimateExecutionRow = z.infer<typeof estimateExecutionRowSchema>;

export const estimateExecutionRowPatchSchema = z.object({
    actualQty: z.number().nonnegative().optional(),
    actualPrice: z.number().nonnegative().optional(),
    status: estimateExecutionStatusSchema.optional(),
    isCompleted: z.boolean().optional(),
});

export type EstimateExecutionRowPatch = z.infer<typeof estimateExecutionRowPatchSchema>;

export const addExtraExecutionWorkSchema = z.object({
    name: z.string().trim().min(1),
    code: z.string().trim().min(1).optional(),
    unit: z.string().trim().min(1).default('шт'),
    actualQty: z.number().nonnegative().default(1),
    actualPrice: z.number().nonnegative().default(0),
});

export type AddExtraExecutionWorkInput = z.infer<typeof addExtraExecutionWorkSchema>;
