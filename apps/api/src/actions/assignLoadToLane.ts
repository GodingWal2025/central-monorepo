import { db } from '../database';

export async function assignLoadToLaneAction(params: any) {
    const { laneId, loadId } = params;

    // Use a strict transaction
    return await db.$transaction(async (tx) => {
        const lane = await tx.stagingLane.findUnique({ where: { id: laneId } });
        if (!lane) throw new Error('Lane not found');
        if (lane.status !== 'EMPTY' && lane.status !== 'RESERVED') {
            throw new Error('Lane is not available');
        }

        const updatedLane = await tx.stagingLane.update({
            where: { id: laneId },
            data: {
                currentLoadId: loadId,
                status: 'STAGED'
            }
        });
        
        return { message: 'Lane assigned successfully', laneId: updatedLane.id };
    });
}
