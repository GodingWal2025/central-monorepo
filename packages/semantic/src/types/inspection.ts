export interface Inspection {
  id: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  inspectorId: string;
  photos: string[];
}
