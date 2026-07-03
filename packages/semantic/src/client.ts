import { StagingLaneObject } from './types/ontology';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
    ? '/api' // Azure SWA will handle this routing in production
    : 'http://localhost:7071/api'; // Local Azure Functions Emulator

export const ontologyClient = {
    getStagingLanes: async (): Promise<StagingLaneObject[]> => {
        const response = await fetch(`${API_BASE_URL}/ontology/staging-lanes`);
        if (!response.ok) throw new Error('Failed to fetch staging lanes');
        const data = await response.json();
        return data.objects;
    },

    executeAction: async (actionType: string, params: object): Promise<void> => {
        const response = await fetch(`${API_BASE_URL}/ontology/actions`, {
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
