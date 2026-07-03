export interface StagingLaneObject {
  id: string;
  properties: {
    name: string;
    zoneCode: string;
    layout: {
      x: number;
      y: number;
      width: number;
      length: number;
    };
    currentLoadId: string | null;
    status: 'EMPTY' | 'STAGED' | 'RESERVED' | 'BLOCKED';
  };
}

export interface AssignLaneActionParams {
  laneId: string;
  loadId: string;
  updatedBy: string;
}

export interface ActionPayload<T> {
  actionType: string;
  params: T;
}
