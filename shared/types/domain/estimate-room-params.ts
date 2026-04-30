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

export type OpeningPair = {
  height: number;
  width: number;
};

export type EstimateRoomParam = {
  id: string;
  estimateId: string;
  order: number;
  name: string;
  perimeter: number;
  height: number;
  floorArea: number;
  ceilingArea: number;
  ceilingSlopes: number;
  doorsCount: number;
  wallSegments: number;
  windows: [OpeningPair, OpeningPair, OpeningPair];
  portals: [OpeningPair, OpeningPair, OpeningPair];
};

export type EstimateRoomParamDraft = {
  id: string;
  name: string;
  perimeter: string;
  height: string;
  floorArea: string;
  ceilingArea: string;
  ceilingSlopes: string;
  doorsCount: string;
  wallSegments: string;
  windows: [
    { height: string; width: string },
    { height: string; width: string },
    { height: string; width: string },
  ];
  portals: [
    { height: string; width: string },
    { height: string; width: string },
    { height: string; width: string },
  ];
};
