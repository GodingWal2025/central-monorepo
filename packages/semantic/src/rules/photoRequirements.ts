import type { PalletType } from '../types/inspection';

// Define the specific angles/shots you need to capture
export type PhotoRequirement = 
    | 'FRONT_FULL_VIEW' 
    | 'BACK_FULL_VIEW' 
    | 'LOT_LABEL_CLOSEUP' 
    | 'SEAL_INTACT_VIEW' 
    | 'BASE_WOOD_CONDITION' 
    | 'ALL_MIXED_SKUS_VISIBLE';

// Map the pallet types to their exact required shots
export const PALLET_PHOTO_REQUIREMENTS: Record<PalletType, PhotoRequirement[]> = {
    // Group 1: Bags
    'Full Bag Pallet': ['FRONT_FULL_VIEW', 'BACK_FULL_VIEW', 'LOT_LABEL_CLOSEUP'],
    'Partial Bag Pallet': ['FRONT_FULL_VIEW', 'BACK_FULL_VIEW', 'LOT_LABEL_CLOSEUP'],
    'Paper Bag': ['FRONT_FULL_VIEW', 'BACK_FULL_VIEW', 'LOT_LABEL_CLOSEUP'],
    
    // Group 2: Bulk
    'Seedpak': ['SEAL_INTACT_VIEW', 'BASE_WOOD_CONDITION'],
    'Minibulk': ['SEAL_INTACT_VIEW', 'BASE_WOOD_CONDITION'],
    
    // Group 3: Mixed
    'Mixed Bag Pallet': ['FRONT_FULL_VIEW', 'ALL_MIXED_SKUS_VISIBLE']
};

// Helper function to get readable labels for the UI
export const getPhotoLabel = (req: PhotoRequirement): string => {
    const labels: Record<PhotoRequirement, string> = {
        'FRONT_FULL_VIEW': "Front View (Entire Pallet)",
        'BACK_FULL_VIEW': "Back View (Stretch Wrap)",
        'LOT_LABEL_CLOSEUP': "Lot / Batch Label",
        'SEAL_INTACT_VIEW': "Top Seal / Cap Intact",
        'BASE_WOOD_CONDITION': "Bottom Wood Pallet Condition",
        'ALL_MIXED_SKUS_VISIBLE': "All Mixed SKUs Clearly Visible"
    };
    return labels[req];
};
