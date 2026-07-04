import { getRequiredPhotoSlots, type PalletType } from '@gxo/semantic';

interface VerifyPalletPayload {
    palletType: PalletType;
    batchCount?: number;
    // Map of photoRequirement string -> photo URL or ID
    uploadedPhotos: Record<string, string>; 
}

export async function verifyPalletAction(payload: VerifyPalletPayload) {
    const expectedPhotos = getRequiredPhotoSlots(payload.palletType, payload.batchCount || 1).map(slot => slot.key);
    
    if (!expectedPhotos || expectedPhotos.length === 0) {
        throw new Error(`Unknown pallet type: ${payload.palletType}`);
    }

    const uploadedPhotoKeys = Object.keys(payload.uploadedPhotos);

    // Ensure every required shot is present
    for (const required of expectedPhotos) {
        if (!uploadedPhotoKeys.includes(required)) {
            throw new Error(`Missing required photo: ${required}. Verification rejected.`);
        }
    }

    return { success: true, message: 'Pallet successfully verified.' };
}
