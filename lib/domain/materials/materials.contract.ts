import { z } from 'zod';

export const materialsCursorSchema = z.object({
  lastSortOrder: z.number(),
  lastId: z.string().uuid(),
});

export const fetchMoreMaterialsInputSchema = z.object({
  query: z.string().trim().optional(),
  offset: z.number().int().min(0).optional(),
  limit: z.number().int().min(1).max(200).optional(),
  cursor: materialsCursorSchema.optional(),
});

export type MaterialsCursor = z.infer<typeof materialsCursorSchema>;
export type FetchMoreMaterialsInput = z.infer<typeof fetchMoreMaterialsInputSchema>;
