export interface SiteObject {
    id: string;
    objectType: 'Site';
    properties: {
        name: string;
        timezone: string;
        address: string | null;
    };
}

export interface StagingLaneObject {
    id: string;
    objectType: 'StagingLane';
    properties: {
        name: string;
        zoneCode: string;
        status: 'EMPTY' | 'STAGED' | 'RESERVED' | 'BLOCKED';
        coordinates: { x: number; y: number; width: number; length: number };
        currentLoadId: string | null;
        siteId: string | null;
    };
}

export interface LoadObject {
    id: string;
    objectType: 'Load';
    properties: {
        carrier: string;
        destination: string | null;
        expectedPalletCount: number;
        status: 'PENDING' | 'STAGED' | 'LOADING' | 'DISPATCHED';
        siteId: string | null;
    };
}

export interface PalletObject {
    id: string;
    objectType: 'Pallet';
    properties: {
        barcode: string;
        productType: string | null;
        packagingType: string | null;
        isFlagged: boolean;
        loadId: string | null;
        stagingLaneId: string | null;
    };
}

export interface InspectionObject {
    id: string;
    objectType: 'Inspection';
    properties: {
        inspectorName: string;
        timestamp: string;
        photos: string[];
        notes: string | null;
        result: string;
        loadId: string;
    };
}
