import { verifyPalletAction } from './verifyPallet';
import { assignLoadToLaneAction } from './assignLoadToLane';

// Registry tracking all valid backend operations
export const actionRegistry: Record<string, (params: any) => Promise<any>> = {
    "VerifyPallet": verifyPalletAction,
    "AssignLoadToLane": assignLoadToLaneAction
};
