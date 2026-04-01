import { z } from 'zod';

export const materialsCursorSchema = z.object({
  lastSortOrder: z.number(),
  lastId: z.string().uuid(),
});

export const fetchMoreMaterialsInputSchema = z.object({
  query: z.string().trim().optional(),
  offset: z.number().int().min(0).optional(),
  limit: z.number().int().min(1).max(200).optional(),
  categoryLv1: z.string().optional(),
  categoryLv2: z.string().optional(),
  categoryLv3: z.string().optional(),
  categoryLv4: z.string().optional(),
  cursor: materialsCursorSchema.optional(),
});


export type MaterialsCursor = z.infer<typeof materialsCursorSchema>;
export type FetchMoreMaterialsInput = z.infer<typeof fetchMoreMaterialsInputSchema>;

export type MaterialCategorySelection = {
  categoryLv1: string | null;
  categoryLv2: string | null;
  categoryLv3: string | null;
  categoryLv4: string | null;
};

export type MaterialCategoryNode = {
  name: string;
  children: MaterialCategoryNode[];
};
