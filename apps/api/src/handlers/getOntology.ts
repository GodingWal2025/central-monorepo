import { HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { db as prisma } from '../database';

export async function getOntologyHandler(req: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  const objectType = req.params.objectType;

  try {
    if (objectType === 'sites') {
      const sites = await prisma.site.findMany({ orderBy: { name: 'asc' } });
      const mappedObjects = sites.map((s: any) => ({
        id: s.id,
        objectType: 'Site',
        properties: {
          name: s.name,
          timezone: s.timezone,
          address: s.address,
          active: s.active,
          createdAt: s.createdAt instanceof Date ? s.createdAt.toISOString() : s.createdAt,
        }
      }));
      return { status: 200, jsonBody: { objects: mappedObjects } };
    }

    if (objectType === 'staging-lanes') {
      const lanes = await prisma.stagingLane.findMany();
      // Map tabular database rows into standardized SDK objects
      const mappedObjects = lanes.map((lane: any) => ({
        id: lane.id,
        objectType: 'StagingLane',
        properties: {
          name: lane.name,
          zoneCode: lane.zoneCode,
          status: lane.status,
          coordinates: { x: lane.x, y: lane.y, width: lane.width, length: lane.length },
          currentLoadId: lane.currentLoadId,
        }
      }));
      return { status: 200, jsonBody: { objects: mappedObjects } };
    }

    if (objectType === 'appointments') {
      const statusFilter = req.query.get('status');
      const appointments = await prisma.appointment.findMany(
        statusFilter ? { where: { status: statusFilter } } : undefined
      );
      const mappedObjects = appointments.map((a: any) => ({
        id: a.id,
        objectType: 'Appointment',
        properties: {
          date: a.date, time: a.time, type: a.type, carrier: a.carrier,
          bolShipmentNo: a.bolShipmentNo, customer: a.customer, productType: a.productType,
          status: a.status, doorId: a.doorId, doorName: a.doorName, operatorId: a.operatorId,
          operatorName: a.operatorName, checkInTime: a.checkInTime, checkOutTime: a.checkOutTime,
          dwellTime: a.dwellTime,
        }
      }));
      return { status: 200, jsonBody: { objects: mappedObjects } };
    }

    if (objectType === 'doors') {
      const doors = await prisma.door.findMany();
      return { status: 200, jsonBody: { objects: doors.map((d: any) => ({ id: d.id, objectType: 'Door', properties: { name: d.name, direction: d.direction, status: d.status } })) } };
    }

    if (objectType === 'operators') {
      const operators = await prisma.operator.findMany();
      return { status: 200, jsonBody: { objects: operators.map((o: any) => ({ id: o.id, objectType: 'Operator', properties: { name: o.name } })) } };
    }

    if (objectType === 'pit-tasks') {
      const tasks = await prisma.pitTask.findMany();
      return { status: 200, jsonBody: { objects: tasks.map((t: any) => ({ id: t.id, objectType: 'PitTask', properties: { appointmentId: t.appointmentId, stage: t.stage, operatorName: t.operatorName, status: t.status, type: t.type, startedAt: t.startedAt, completedAt: t.completedAt } })) } };
    }

    if (objectType === 'employees') {
      const employees = await prisma.employee.findMany();
      return { status: 200, jsonBody: { objects: employees.map((e: any) => ({ id: e.id, objectType: 'Employee', properties: { fullName: e.fullName, firstName: e.firstName, lastName: e.lastName, email: e.email, shift: e.shift, jobRole: e.jobRole, hireDate: e.hireDate, active: e.active, photoUrl: e.photoUrl, shirtSize: e.shirtSize, birthday: e.birthday, cwr: e.cwr, phoneNumber: e.phoneNumber, cwid: e.cwid, notes: e.notes, siteId: e.siteId } })) } };
    }

    if (objectType === 'skills') {
      const skills = await prisma.skill.findMany();
      return { status: 200, jsonBody: { objects: skills.map((s: any) => ({ id: s.id, objectType: 'Skill', properties: { name: s.name, jobRoles: JSON.parse(s.jobRoles), process: s.process, action: s.action } })) } };
    }

    if (objectType === 'ratings') {
      const ratings = await prisma.employeeSkillRating.findMany();
      return { status: 200, jsonBody: { objects: ratings.map((r: any) => ({ id: r.id, objectType: 'EmployeeSkill', properties: { employeeId: r.employeeId, skill: r.skill, rating: r.rating, dateAssessed: r.dateAssessed, assessedBy: r.assessedBy, notes: r.notes } })) } };
    }

    if (objectType === 'coaching') {
      const coaching = await prisma.coaching.findMany();
      return { status: 200, jsonBody: { objects: coaching.map((c: any) => ({ id: c.id, objectType: 'Coaching', properties: { employeeId: c.employeeId, title: c.title, notes: c.notes, status: c.status, dateOpened: c.dateOpened, dateClosed: c.dateClosed } })) } };
    }

    if (objectType === 'contacts') {
      const contacts = await prisma.contact.findMany();
      return { status: 200, jsonBody: { objects: contacts.map((c: any) => ({ id: c.id, objectType: 'Contact', properties: { fullName: c.fullName, company: c.company, role: c.role, phone: c.phone, email: c.email, category: c.category } })) } };
    }

    if (objectType === 'equipments') {
      const equipments = await prisma.equipment.findMany();
      return { status: 200, jsonBody: { objects: equipments.map((e: any) => ({ id: e.id, objectType: 'Equipment', properties: { name: e.name, type: e.type, status: e.status, assignedToId: e.assignedToId, lastInspected: e.lastInspected, serialNumber: e.serialNumber, notes: e.notes } })) } };
    }

    return { status: 404, jsonBody: { error: 'Object type not supported' } };
  } catch (error: any) {
    context.error(error);
    return { status: 500, jsonBody: { error: 'Internal server error' } };
  }
}
