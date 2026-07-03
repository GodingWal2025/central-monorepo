import { db } from '../database';

interface VerifyPalletParams {
    palletId: string;
    barcode: string;
    inspectorName: string;
    loadId: string;
    result: 'PASSED' | 'FAILED_DAMAGED' | 'FAILED_WRONG_LOCATION';
    notes?: string;
}

export async function verifyPalletAction(params: VerifyPalletParams) {
    const { palletId, barcode, inspectorName, loadId, result, notes } = params;

    // Execute an atomic transaction locally on your SQLite dev.db
    return await db.$transaction(async (tx) => {
        
        // 1. Update the Pallet state in your local database
        const updatedPallet = await tx.pallet.update({
            where: { id: palletId },
            data: {
                isFlagged: result !== 'PASSED' // Flags the pallet if it fails verification
            }
        });

        // 2. Automatically generate the companion Inspection log entry
        const logEntry = await tx.inspection.create({
            data: {
                inspectorName, // Tracks which user did the work
                result,        // PASSED, FAILED_DAMAGED, etc.
                notes: notes || null,
                loadId: loadId // Associates this inspection with the active outbound load
            }
        });

        return {
            message: "Local SQLite transaction complete",
            palletId: updatedPallet.id,
            inspectionId: logEntry.id
        };
    });
}
