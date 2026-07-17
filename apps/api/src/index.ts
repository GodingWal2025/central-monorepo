// Mock CSS imports for Node environment before loading any packages
declare var require: any;
if (typeof require !== 'undefined' && require.extensions) {
  require.extensions['.css'] = () => {};
}

import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { executeActionHandler } from "./handlers/executeAction";
import { getOntologyHandler } from "./handlers/getOntology";
import { checkAuth } from "./handlers/auth";

// Shared-key gate for mutating actions. Enforced only when API_ACTION_KEY is set,
// so local dev stays open; set it (and VITE_API_ACTION_KEY on the clients) to enforce.
function isAuthorized(req: HttpRequest): boolean {
    const requiredKey = process.env.API_ACTION_KEY;
    if (!requiredKey) return true; // auth disabled (dev)
    return req.headers.get('x-api-key') === requiredKey;
}

// 1. The Kinetic Route (Handling Writes/Updates)
app.http('executeAction', {
    methods: ['POST'],
    authLevel: 'anonymous',
    route: 'ontology/actions',
    handler: async (req: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
        const denied = checkAuth(req);
        if (denied) return denied;
        try {
            if (!isAuthorized(req)) {
                return { status: 401, jsonBody: { error: 'Unauthorized: invalid or missing API key' } };
            }
            const body: any = await req.json();
            const result = await executeActionHandler(body, context);
            return { status: 200, jsonBody: { success: true, data: result } };
        } catch (error: any) {
            context.error("Action Failed:", error.message);
            return { status: 400, jsonBody: { error: error.message } };
        }
    }
});

// 2. The Semantic Route (Handling Reads for the Map)
app.http('getOntology', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'ontology/{objectType}',
    handler: getOntologyHandler
});
