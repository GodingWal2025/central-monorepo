import { HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { db as prisma } from '../database';

export async function getOntologyHandler(req: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  const objectType = req.params.objectType;

  try {
    if (objectType === 'staging-lanes') {
      const lanes = await prisma.stagingLane.findMany();
      // Map tabular database rows into standardized SDK objects
      const mappedObjects = lanes.map((lane: any) => ({
        id: lane.id,
        objectType: 'StagingLane',
        properties: {
          name: lane.name,
          zoneCode: lane.zoneCode,
          status: lane.status,
          coordinates: { x: lane.x, y: lane.y, width: lane.width, length: lane.length },
          currentLoadId: lane.currentLoadId,
        }
      }));
      return { status: 200, jsonBody: { objects: mappedObjects } };
    }

    return { status: 404, jsonBody: { error: 'Object type not supported' } };
  } catch (error: any) {
    context.error(error);
    return { status: 500, jsonBody: { error: 'Internal server error' } };
  }
}
