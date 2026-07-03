import { verifyPalletAction } from './verifyPallet';

// Registry tracking all valid backend operations
export const actionRegistry: Record<string, (params: any) => Promise<any>> = {
    "VerifyPallet": verifyPalletAction
};
