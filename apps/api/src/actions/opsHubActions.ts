import { db as prisma } from '../database';
import { pick, requireFields, requireId } from './_validation';

// Allow-lists mirror the writable columns in schema.prisma. Anything not listed
// here is dropped before it reaches Prisma, so clients cannot set arbitrary fields.
const EMPLOYEE_FIELDS = [
  'fullName', 'firstName', 'lastName', 'email', 'shift', 'jobRole', 'hireDate',
  'active', 'photoUrl', 'shirtSize', 'birthday', 'cwr', 'phoneNumber', 'cwid', 'notes',
] as const;
const CONTACT_FIELDS = ['fullName', 'company', 'role', 'phone', 'email', 'category'] as const;
const EQUIPMENT_FIELDS = [
  'name', 'type', 'status', 'assignedToId', 'lastInspected', 'serialNumber', 'notes',
] as const;

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
  const data = pick(params, EMPLOYEE_FIELDS);
  requireFields(data, ['fullName', 'firstName', 'lastName', 'email', 'hireDate']);
  return await prisma.employee.create({ data });
}

export async function updateEmployeeAction(params: any) {
  const id = requireId(params);
  const data = pick(params, EMPLOYEE_FIELDS);
  return await prisma.employee.update({ where: { id }, data });
}

// ─── Skills ──────────────────────────────────────────────────────
export async function createSkillAction(params: any) {
  const { name, jobRoles, process, action } = params;
  requireFields({ name }, ['name']);
  if (!Array.isArray(jobRoles)) throw new Error('"jobRoles" must be an array.');
  return await prisma.skill.create({
    data: { name, jobRoles: JSON.stringify(jobRoles), process, action }
  });
}

export async function deleteSkillAction(params: any) {
  return await prisma.skill.delete({ where: { id: requireId(params) } });
}

// ─── Ratings ─────────────────────────────────────────────────────
export async function createRatingAction(params: any) {
  const { employeeId, skill, rating, notes } = params;
  requireFields({ employeeId, skill, rating }, ['employeeId', 'skill', 'rating']);
  return await prisma.employeeSkillRating.create({
    data: { employeeId, skill, rating, notes, dateAssessed: new Date().toISOString().split('T')[0] }
  });
}

export async function updateRatingAction(params: any) {
  const id = requireId(params);
  return await prisma.employeeSkillRating.update({
    where: { id }, data: { rating: params.rating }
  });
}

// ─── Coaching ────────────────────────────────────────────────────
export async function createCoachingAction(params: any) {
  const { title, employeeId, notes } = params;
  requireFields({ title, employeeId }, ['title', 'employeeId']);
  return await prisma.coaching.create({
    data: { title, employeeId, notes, dateOpened: new Date().toISOString() }
  });
}

export async function updateCoachingStatusAction(params: any) {
  const id = requireId(params);
  const { status } = params;
  return await prisma.coaching.update({
    where: { id }, data: { status, dateClosed: status === 'Closed' ? new Date().toISOString() : null }
  });
}

export async function deleteCoachingAction(params: any) {
  return await prisma.coaching.delete({ where: { id: requireId(params) } });
}

// ─── Contacts ────────────────────────────────────────────────────
export async function createContactAction(params: any) {
  const data = pick(params, CONTACT_FIELDS);
  requireFields(data, ['fullName', 'company', 'role', 'phone']);
  return await prisma.contact.create({ data });
}

export async function updateContactAction(params: any) {
  const id = requireId(params);
  const data = pick(params, CONTACT_FIELDS);
  return await prisma.contact.update({ where: { id }, data });
}

export async function deleteContactAction(params: any) {
  return await prisma.contact.delete({ where: { id: requireId(params) } });
}

// ─── Equipment ───────────────────────────────────────────────────
export async function createEquipmentAction(params: any) {
  const data = pick(params, EQUIPMENT_FIELDS);
  requireFields(data, ['name', 'serialNumber']);
  return await prisma.equipment.create({ data });
}

export async function updateEquipmentAction(params: any) {
  const id = requireId(params);
  const data = pick(params, EQUIPMENT_FIELDS);
  return await prisma.equipment.update({ where: { id }, data });
}

export async function deleteEquipmentAction(params: any) {
  return await prisma.equipment.delete({ where: { id: requireId(params) } });
}
