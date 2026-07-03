import { StagingLaneObject } from './types';

// In a real app, this base URL might come from an environment variable.
const API_BASE_URL = 'http://localhost:8000/api/ontology';

export const ontologyClient = {
    getStagingLanes: async (): Promise<StagingLaneObject[]> => {
        const response = await fetch(`${API_BASE_URL}/staging-lanes`);
        if (!response.ok) throw new Error('Failed to fetch staging lanes');
        const data = await response.json();
        return data.objects;
    },

    executeAction: async (actionType: string, params: object): Promise<void> => {
        const response = await fetch(`${API_BASE_URL}/actions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ actionType, params })
        });
        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.error || 'Failed to execute action');
        }
    }
};
