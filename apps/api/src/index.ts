import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();
const PORT = 8000;

app.use(cors());
app.use(express.json());

import dockxRouter from './dockx';
app.use('/api/dockx', dockxRouter);

// Generic Read Endpoint
app.get('/api/ontology/:objectType', async (req, res) => {
  const { objectType } = req.params;

  try {
    if (objectType === 'staging-lanes') {
      const lanes = await prisma.stagingLane.findMany();
      // Map tabular database rows into standardized SDK objects
      const mappedObjects = lanes.map(lane => ({
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
      return res.json({ objects: mappedObjects });
    }

    return res.status(404).json({ error: 'Object type not supported' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Strict Action Write Endpoint
app.post('/api/ontology/actions', async (req, res) => {
  const { actionType, params } = req.body;

  try {
    if (actionType === 'AssignLoadToLane') {
      const { laneId, loadId } = params;

      // Use a strict transaction
      await prisma.$transaction(async (tx) => {
        const lane = await tx.stagingLane.findUnique({ where: { id: laneId } });
        if (!lane) throw new Error('Lane not found');
        if (lane.status !== 'EMPTY' && lane.status !== 'RESERVED') {
          throw new Error('Lane is not available');
        }

        await tx.stagingLane.update({
          where: { id: laneId },
          data: {
            currentLoadId: loadId,
            status: 'STAGED'
          }
        });
      });

      return res.json({ success: true, message: 'Lane assigned successfully' });
    }

    return res.status(400).json({ error: 'Unknown action type' });
  } catch (error: any) {
    console.error(error);
    return res.status(400).json({ error: error.message || 'Action failed' });
  }
});

app.listen(PORT, () => {
  console.log(`Ontology API running on http://localhost:${PORT}`);
});
