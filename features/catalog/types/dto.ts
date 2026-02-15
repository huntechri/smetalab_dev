import { z } from 'zod';

export const catalogWorkSchema = z.object({
    id: z.string(),
    code: z.string(),
    name: z.string(),
    unit: z.string(),
    price: z.number(),
    category: z.string().optional(),
    subcategory: z.string().optional(),
});

export type CatalogWork = z.infer<typeof catalogWorkSchema>;

export const catalogMaterialSchema = z.object({
    id: z.string(),
    code: z.string(),
    name: z.string(),
    unit: z.string(),
    price: z.number(),
    categoryLv1: z.string().optional(),
    categoryLv2: z.string().optional(),
    imageUrl: z.string().nullable().optional(),
});

export type CatalogMaterial = z.infer<typeof catalogMaterialSchema>;
