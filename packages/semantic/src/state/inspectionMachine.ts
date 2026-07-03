export type InspectionEvent = 'START' | 'COMPLETE' | 'CANCEL';
export const transitionInspection = (currentState: string, event: InspectionEvent) => {
  if (currentState === 'PENDING' && event === 'START') return 'IN_PROGRESS';
  if (currentState === 'IN_PROGRESS' && event === 'COMPLETE') return 'COMPLETED';
  if (event === 'CANCEL') return 'CANCELLED';
  return currentState;
};
