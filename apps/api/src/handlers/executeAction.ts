import { actionRegistry } from '../actions';
import { InvocationContext } from '@azure/functions';

export async function executeActionHandler(payload: any, context?: InvocationContext) {
    const { actionType, params } = payload;

    const matchedAction = actionRegistry[actionType];
    if (!matchedAction) {
        throw new Error(`Action type '${actionType}' is not supported by the local backend.`);
    }

    // Pass the parameters directly into your isolated action file
    return await matchedAction(params);
}
