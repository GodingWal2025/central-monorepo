import { verifyPalletAction } from './verifyPallet';
import { assignLoadToLaneAction } from './assignLoadToLane';
import { 
    createAppointmentAction, checkInAppointmentAction, checkOutAppointmentAction,
    updateAppointmentAction, startPitTaskAction, completePitTaskAction, createPitTaskAction 
} from './dockxActions';
import { 
    createEmployeeAction, updateEmployeeAction,
    createSkillAction, deleteSkillAction,
    createRatingAction, updateRatingAction,
    createCoachingAction, updateCoachingStatusAction, deleteCoachingAction,
    createContactAction, updateContactAction, deleteContactAction,
    createEquipmentAction, updateEquipmentAction, deleteEquipmentAction
} from './opsHubActions';

// Registry tracking all valid backend operations
export const actionRegistry: Record<string, (params: any) => Promise<any>> = {
    "VerifyPallet": verifyPalletAction,
    "AssignLoadToLane": assignLoadToLaneAction,
    
    // DockX Actions
    "CreateAppointment": createAppointmentAction,
    "UpdateAppointment": updateAppointmentAction,
    "CheckInAppointment": checkInAppointmentAction,
    "CheckOutAppointment": checkOutAppointmentAction,
    "StartPitTask": startPitTaskAction,
    "CompletePitTask": completePitTaskAction,
    "CreatePitTask": createPitTaskAction,
    
    // Operations-Hub Actions
    "CreateEmployee": createEmployeeAction,
    "UpdateEmployee": updateEmployeeAction,
    "CreateSkill": createSkillAction,
    "DeleteSkill": deleteSkillAction,
    "CreateRating": createRatingAction,
    "UpdateRating": updateRatingAction,
    "CreateCoaching": createCoachingAction,
    "UpdateCoachingStatus": updateCoachingStatusAction,
    "DeleteCoaching": deleteCoachingAction,
    "CreateContact": createContactAction,
    "UpdateContact": updateContactAction,
    "DeleteContact": deleteContactAction,
    "CreateEquipment": createEquipmentAction,
    "UpdateEquipment": updateEquipmentAction,
    "DeleteEquipment": deleteEquipmentAction,
};

