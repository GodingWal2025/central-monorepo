import { db as prisma } from '../database';

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

export async function startPitTaskAction(params: any) {
  const { appointmentId, operatorName, type } = params;
  
  // If task exists, update it to In Progress. Otherwise create it.
  const existing = await prisma.pitTask.findUnique({ where: { appointmentId } });
  if (existing) {
    return await prisma.pitTask.update({
      where: { appointmentId },
      data: { operatorName, status: 'In Progress', startedAt: new Date().toISOString() }
    });
  }

  return await prisma.pitTask.create({
    data: {
      appointmentId, operatorName, type: type || 'Inbound/outbound', status: 'In Progress', startedAt: new Date().toISOString()
    }
  });
}

export async function createPitTaskAction(params: any) {
  const { appointmentId, type } = params;
  return await prisma.pitTask.create({
    data: {
      appointmentId, type: type || 'Inbound/outbound', status: 'Pending'
    }
  });
}

export async function completePitTaskAction(params: any) {
  const { appointmentId } = params;
  return await prisma.pitTask.update({
    where: { appointmentId },
    data: { status: 'Completed', completedAt: new Date().toISOString() }
  });
}

export async function updateAppointmentAction(params: any) {
  const { id, ...data } = params;
  return await prisma.appointment.update({
    where: { id },
    data
  });
}
