// Mock CSS imports for Node environment before loading any packages
declare var require: any;
if (typeof require !== 'undefined' && require.extensions) {
  require.extensions['.css'] = () => {};
}

import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { executeActionHandler } from "./handlers/executeAction";
import { getOntologyHandler } from "./handlers/getOntology";

// 1. The Kinetic Route (Handling Writes/Updates)
app.http('executeAction', {
    methods: ['POST'],
    authLevel: 'anonymous', 
    route: 'ontology/actions',
    handler: async (req: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
        try {
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
