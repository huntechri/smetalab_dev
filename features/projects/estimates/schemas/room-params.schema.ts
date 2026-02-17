import { z } from 'zod';

export const openingSchema = z.object({
    height: z.number().finite().nonnegative(),
    width: z.number().finite().nonnegative(),
});

export const roomParamSaveSchema = z.object({
    id: z.string().uuid().optional(),
    order: z.number().int().nonnegative(),
    name: z.string().trim().min(1).default('Помещение'),
    perimeter: z.number().finite().nonnegative(),
    height: z.number().finite().nonnegative(),
    floorArea: z.number().finite().nonnegative(),
    ceilingArea: z.number().finite().nonnegative(),
    ceilingSlopes: z.number().finite().nonnegative(),
    doorsCount: z.number().finite().nonnegative(),
    wallSegments: z.number().finite().nonnegative(),
    windows: z.tuple([openingSchema, openingSchema, openingSchema]),
    portals: z.tuple([openingSchema, openingSchema, openingSchema]),
});

export const roomParamSaveArraySchema = z.array(roomParamSaveSchema);

export type RoomParamSaveInput = z.infer<typeof roomParamSaveSchema>;
