import { ontologyClient } from '@gxo/semantic';
import { StagingLaneObject, AssignLaneActionParams } from '../types/ontology';

export async function fetchStagingLanes(): Promise<StagingLaneObject[]> {
  return await ontologyClient.getStagingLanes();
}

export async function assignLaneAction(params: AssignLaneActionParams): Promise<void> {
  await ontologyClient.executeAction('AssignLoadToLane', params);
}
