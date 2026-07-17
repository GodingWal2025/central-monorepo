import { db as prisma } from '../database';

// ─── Sites ───────────────────────────────────────────────────────
export async function createSiteAction(params: any) {
  const { name, address, timezone } = params;
  return await prisma.site.create({
    data: { name, address: address || null, timezone: timezone || 'UTC' }
  });
}

export async function updateSiteAction(params: any) {
  const { id, ...data } = params;
  return await prisma.site.update({ where: { id }, data });
}

export async function deleteSiteAction(params: any) {
  const { id } = params;
  return await prisma.site.delete({ where: { id } });
}

// ─── Employees ───────────────────────────────────────────────────
export async function createEmployeeAction(params: any) {
  return await prisma.employee.create({ data: params });
}

export async function updateEmployeeAction(params: any) {
  const { id, ...data } = params;
  return await prisma.employee.update({ where: { id }, data });
}

// ─── Skills ──────────────────────────────────────────────────────
export async function createSkillAction(params: any) {
  const { name, jobRoles, process, action } = params;
  return await prisma.skill.create({
    data: { name, jobRoles: JSON.stringify(jobRoles), process, action }
  });
}

export async function deleteSkillAction(params: any) {
  return await prisma.skill.delete({ where: { id: params.id } });
}

// ─── Ratings ─────────────────────────────────────────────────────
export async function createRatingAction(params: any) {
  const { employeeId, skill, rating, notes } = params;
  return await prisma.employeeSkillRating.create({
    data: { employeeId, skill, rating, notes, dateAssessed: new Date().toISOString().split('T')[0] }
  });
}

export async function updateRatingAction(params: any) {
  return await prisma.employeeSkillRating.update({
    where: { id: params.id }, data: { rating: params.rating }
  });
}

// ─── Coaching ────────────────────────────────────────────────────
export async function createCoachingAction(params: any) {
  const { title, employeeId, notes } = params;
  return await prisma.coaching.create({
    data: { title, employeeId, notes, dateOpened: new Date().toISOString() }
  });
}

export async function updateCoachingStatusAction(params: any) {
  const { id, status } = params;
  return await prisma.coaching.update({
    where: { id }, data: { status, dateClosed: status === 'Closed' ? new Date().toISOString() : null }
  });
}

export async function deleteCoachingAction(params: any) {
  return await prisma.coaching.delete({ where: { id: params.id } });
}

// ─── Contacts ────────────────────────────────────────────────────
export async function createContactAction(params: any) {
  return await prisma.contact.create({ data: params });
}

export async function updateContactAction(params: any) {
  const { id, ...data } = params;
  return await prisma.contact.update({ where: { id }, data });
}

export async function deleteContactAction(params: any) {
  return await prisma.contact.delete({ where: { id: params.id } });
}

// ─── Equipment ───────────────────────────────────────────────────
export async function createEquipmentAction(params: any) {
  return await prisma.equipment.create({ data: params });
}

export async function updateEquipmentAction(params: any) {
  const { id, ...data } = params;
  return await prisma.equipment.update({ where: { id }, data });
}

export async function deleteEquipmentAction(params: any) {
  return await prisma.equipment.delete({ where: { id: params.id } });
}
