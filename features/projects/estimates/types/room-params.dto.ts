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
