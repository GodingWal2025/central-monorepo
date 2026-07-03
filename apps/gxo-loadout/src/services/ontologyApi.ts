import { StagingLaneObject, ActionPayload, AssignLaneActionParams } from '../types/ontology';

const API_BASE_URL = '/api/ontology';

/**
 * Fetches all staging lane objects from the unified ontology backend.
 */
export async function fetchStagingLanes(): Promise<StagingLaneObject[]> {
  const response = await fetch(`${API_BASE_URL}/staging-lanes`);
  if (!response.ok) {
    throw new Error('Failed to fetch staging lanes from ontology');
  }
  const data = await response.json();
  return data.objects || [];
}

/**
 * Dispatches a strict action to mutate the state of a staging lane.
 */
export async function assignLaneAction(params: AssignLaneActionParams): Promise<void> {
  const payload: ActionPayload<AssignLaneActionParams> = {
    actionType: 'AssignLoadToLane',
    params
  };

  const response = await fetch(`${API_BASE_URL}/actions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to assign lane action');
  }
}
