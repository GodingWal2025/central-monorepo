import { db as prisma } from '../database';

// ─── Workflow stage maps (source of truth for stage advancement) ──────────
const WORKFLOW_STAGES: Record<string, string[]> = {
  Outbound: ['Order Creation', 'Picking & Verification', 'Manifest', 'Final BOL', 'Lane Audit', 'Load', 'Ship/GI'],
  Inbound: ['Unload', 'Receive/PGR', 'Verify', 'Putaway'],
  Return: ['Unload', 'Verify', 'PGR', 'Receive', 'Putaway'],
};

// Stages that require a PIT (forklift) operator, mapped to the task's category.
const OPERATOR_STAGES: Record<string, Record<string, string>> = {
  Outbound: { 'Picking & Verification': 'Pick', 'Load': 'Outbound' },
  Inbound: { 'Unload': 'Inbound', 'Putaway': 'Putaway' },
  Return: { 'Unload': 'Return', 'Putaway': 'Putaway' },
};

/** Create the PIT task for an operator stage if the appointment just entered one. Idempotent. */
async function ensureOperatorTask(appointmentId: number, stage: string, type: string) {
  const map = OPERATOR_STAGES[type] || OPERATOR_STAGES.Outbound;
  const taskType = map[stage];
  if (!taskType) return; // not an operator stage — nothing to create
  await prisma.pitTask.upsert({
    where: { appointmentId_stage: { appointmentId, stage } },
    update: {},
    create: { appointmentId, stage, type: taskType, status: 'Pending' },
  });
}

export async function createAppointmentAction(params: any) {
  const { date, time, type, carrier, bolShipmentNo, customer, productType } = params;
  return await prisma.appointment.create({
    data: {
      date, time, type, carrier, bolShipmentNo, customer, productType,
      status: 'Scheduled',
    }
  });
}

export async function checkInAppointmentAction(params: any) {
  const { appointmentId, doorId, operatorId } = params;
  const door = doorId ? await prisma.door.findUnique({ where: { id: doorId } }) : null;
  const operator = operatorId ? await prisma.operator.findUnique({ where: { id: operatorId } }) : null;

  if (door) await prisma.door.update({ where: { id: doorId }, data: { status: 'Occupied' } });

  return await prisma.appointment.update({
    where: { id: appointmentId },
    data: {
      status: 'Checked In',
      doorId, doorName: door?.name,
      operatorId, operatorName: operator?.name,
      checkInTime: new Date().toISOString()
    }
  });
}

export async function checkOutAppointmentAction(params: any) {
  const { appointmentId } = params;
  const appt = await prisma.appointment.findUnique({ where: { id: appointmentId } });
  if (appt?.doorId) await prisma.door.update({ where: { id: appt.doorId }, data: { status: 'Open' } });

  return await prisma.appointment.update({
    where: { id: appointmentId },
    data: { status: 'Completed', checkOutTime: new Date().toISOString() }
  });
}

/** Start a specific PIT task (by task id) — sets it In Progress. */
export async function startPitTaskAction(params: any) {
  const { taskId, operatorName } = params;
  return await prisma.pitTask.update({
    where: { id: taskId },
    data: { operatorName, status: 'In Progress', startedAt: new Date().toISOString() }
  });
}

/** Create/ensure a PIT task for a (load, stage). Idempotent per stage. */
export async function createPitTaskAction(params: any) {
  const { appointmentId, type, stage } = params;
  return await prisma.pitTask.upsert({
    where: { appointmentId_stage: { appointmentId, stage: stage ?? 'General' } },
    update: { type: type || 'Inbound/outbound' },
    create: {
      appointmentId, stage: stage ?? 'General', type: type || 'Inbound/outbound', status: 'Pending'
    }
  });
}

/** Complete a specific PIT task and advance the load to the next workflow stage. */
export async function completePitTaskAction(params: any) {
  const { taskId } = params;
  const task = await prisma.pitTask.update({
    where: { id: taskId },
    data: { status: 'Completed', completedAt: new Date().toISOString() }
  });

  // Advance the appointment when it is currently sitting on this task's stage.
  const appt = await prisma.appointment.findUnique({ where: { id: task.appointmentId } });
  if (appt && task.stage && appt.status === task.stage) {
    const stages = WORKFLOW_STAGES[appt.type] || WORKFLOW_STAGES.Outbound;
    const idx = stages.indexOf(task.stage);
    if (idx !== -1 && idx < stages.length - 1) {
      const next = stages[idx + 1];
      await prisma.appointment.update({ where: { id: appt.id }, data: { status: next } });
      await ensureOperatorTask(appt.id, next, appt.type);
    }
  }
  return task;
}

export async function updateAppointmentAction(params: any) {
  const { id, ...data } = params;
  const appt = await prisma.appointment.update({ where: { id }, data });
  // When a clerk moves a load into an operator stage, surface its PIT task.
  if (data.status) await ensureOperatorTask(id, data.status, appt.type);
  return appt;
}
