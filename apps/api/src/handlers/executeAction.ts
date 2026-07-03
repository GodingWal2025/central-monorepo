import { actionRegistry } from '../actions';

export async function executeActionHandler(reqBody: any) {
    const { actionType, params } = reqBody;

    const matchedAction = actionRegistry[actionType];
    if (!matchedAction) {
        throw new Error(`Action type '${actionType}' is not supported by the local backend.`);
    }

    // Pass the parameters directly into your isolated action file
    return await matchedAction(params);
}
