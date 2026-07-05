export type JobRole =
  | 'CSR/Clerk'
  | 'Inventory'
  | 'PIT'
  | 'Lab'
  | 'Lead'
  | 'Supervisor'
  | 'Operations Manager';

export interface Employee {
  id: number;
  fullName: string;
  firstName: string;
  lastName: string;
  email: string;
  shift: '1st' | '2nd';
  jobRole: JobRole;
  hireDate: string;
  active: boolean;
  photoUrl?: string;
  shirtSize?: string;
  birthday?: string;
  cwr?: boolean;
  phoneNumber?: string;
  cwid?: string;
  notes?: string;
}

export interface EmployeeSkill {
  id: number;
  employeeId: number;
  skill: string;
  rating: 1 | 2 | 3 | 4;
  dateAssessed: string;
  assessedBy: string;
  notes?: string;
}

export interface Skill {
  id: number;
  name: string;
  jobRoles: string[];
  process?: string;
  action?: string;
}

export interface CoachingOpportunity {
  id: number;
  employeeId: number;
  title: string;
  notes?: string;
  status: 'Open' | 'Closed';
  dateOpened: string;
  dateClosed?: string;
}

export interface Contact {
  id: number;
  fullName: string;
  company: string;
  role: string;
  phone: string;
  email: string;
  category: string;
}

export type Navigation =
  | { name: 'home' }
  | { name: 'roster' }
  | { name: 'employee'; emp: Employee }
  | { name: 'library' }
  | { name: 'skill'; skill: Skill }
  | { name: 'record'; defaultEmp?: Employee; defaultSkill?: string }
  | { name: 'contacts' }
  | { name: 'equipments' }
  | { name: 'inspections' }
  | { name: 'inventory' };

export const RATING_META: Record<number, { label: string; desc: string; color: string; bg: string; light: string }> = {
  1: { label: 'In-Training', desc: 'Learning, needs supervision', color: '#B91C1C', bg: '#FEF2F2', light: '#FEF2F2' },
  2: { label: 'Trained', desc: 'Can work independently', color: '#B45309', bg: '#FFFBEB', light: '#FFFBEB' },
  3: { label: 'Experienced', desc: 'Consistently meets standards', color: '#15803D', bg: '#F0FDF4', light: '#F0FDF4' },
  4: { label: 'Expert', desc: 'Can train others', color: '#1D4ED8', bg: '#EFF6FF', light: '#EFF6FF' },
};

export const ratingMeta = RATING_META;

const ROLE_COLORS: Record<string, { hex: string; bg: string }> = {
  'CSR/Clerk': { hex: '#44403C', bg: 'bg-stone-700' },
  'Inventory': { hex: '#065F46', bg: 'bg-emerald-800' },
  'PIT': { hex: '#B45309', bg: 'bg-amber-700' },
  'Lab': { hex: '#6B21A8', bg: 'bg-purple-800' },
  'Lead': { hex: '#1E40AF', bg: 'bg-blue-800' },
  'Supervisor': { hex: '#9F1239', bg: 'bg-rose-800' },
  'Operations Manager': { hex: '#0F172A', bg: 'bg-slate-900' },
};

export const getRoleColor = (role: string): { hex: string; bg: string } => {
  return ROLE_COLORS[role] || { hex: '#78716C', bg: 'bg-stone-500' };
};

export const isPitRole = (role: string): boolean => {
  return role.toLowerCase().includes('pit');
};

export const JOB_ROLES: JobRole[] = [
  'CSR/Clerk',
  'Inventory',
  'PIT',
  'Lab',
  'Lead',
  'Supervisor',
  'Operations Manager',
];

export const SEED_EMPLOYEES: Employee[] = [
  { id: 1, fullName: 'Alice Johnson', firstName: 'Alice', lastName: 'Johnson', email: 'ajohnson@gxo.com', shift: '1st', jobRole: 'CSR/Clerk', hireDate: '2023-01-15', active: true, phoneNumber: '(507) 555-0101', shirtSize: 'M' },
  { id: 2, fullName: 'Bob Williams', firstName: 'Bob', lastName: 'Williams', email: 'bwilliams@gxo.com', shift: '2nd', jobRole: 'Inventory', hireDate: '2022-08-20', active: true, phoneNumber: '(507) 555-0102', cwid: 'CW-1002' },
  { id: 3, fullName: 'Carol Martinez', firstName: 'Carol', lastName: 'Martinez', email: 'cmartinez@gxo.com', shift: '1st', jobRole: 'Lead', hireDate: '2021-03-10', active: true, shirtSize: 'L', cwid: 'CW-1003' },
  { id: 4, fullName: 'David Brown', firstName: 'David', lastName: 'Brown', email: 'dbrown@gxo.com', shift: '2nd', jobRole: 'PIT', hireDate: '2023-06-01', active: true, cwr: true },
  { id: 5, fullName: 'Emma Davis', firstName: 'Emma', lastName: 'Davis', email: 'edavis@gxo.com', shift: '1st', jobRole: 'Lab', hireDate: '2022-11-14', active: true, phoneNumber: '(507) 555-0105', cwid: 'CW-1005' },
  { id: 6, fullName: 'Frank Miller', firstName: 'Frank', lastName: 'Miller', email: 'fmiller@gxo.com', shift: '2nd', jobRole: 'Supervisor', hireDate: '2020-05-22', active: true, shirtSize: 'XL', cwid: 'CW-1006' },
  { id: 7, fullName: 'Grace Wilson', firstName: 'Grace', lastName: 'Wilson', email: 'gwilson@gxo.com', shift: '1st', jobRole: 'CSR/Clerk', hireDate: '2024-01-08', active: true, cwid: 'CW-1007' },
  { id: 8, fullName: 'Henry Taylor', firstName: 'Henry', lastName: 'Taylor', email: 'htaylor@gxo.com', shift: '2nd', jobRole: 'Inventory', hireDate: '2023-09-15', active: false, phoneNumber: '(507) 555-0108', cwid: 'CW-1008' },
];

export const SEED_SKILLS: Skill[] = [
  { id: 1, name: 'Inbound - Verification', jobRoles: ['CSR/Clerk', 'Lead'], process: 'Inbound', action: 'Verify incoming shipments against manifests and system records' },
  { id: 2, name: 'Inbound - Putaway', jobRoles: ['Inventory', 'PIT', 'Lead'], process: 'Inbound', action: 'Move received goods to assigned storage locations' },
  { id: 3, name: 'Outbound - Picking', jobRoles: ['CSR/Clerk', 'Inventory', 'PIT', 'Lead'], process: 'Outbound', action: 'Accurately pick items from warehouse locations for orders' },
  { id: 4, name: 'Outbound - Packing', jobRoles: ['CSR/Clerk', 'Inventory', 'Lead'], process: 'Outbound', action: 'Pack orders according to customer and product requirements' },
  { id: 5, name: 'Quality - Inspection', jobRoles: ['Lab', 'Lead', 'Supervisor'], process: 'Quality', action: 'Inspect products for damage, expiration, and conformance' },
  { id: 6, name: 'Inventory - Cycle Count', jobRoles: ['Inventory', 'Lead', 'Supervisor'], process: 'Inventory', action: 'Perform periodic cycle counts to maintain inventory accuracy' },
  { id: 7, name: 'Equipment - Forklift', jobRoles: ['PIT', 'Inventory'], process: 'Equipment', action: 'Safely operate forklift equipment for material movement' },
  { id: 8, name: 'Returns Processing', jobRoles: ['CSR/Clerk', 'Lab', 'Lead'], process: 'Returns', action: 'Process returned goods including inspection and disposition' },
  { id: 9, name: 'Hazardous Materials', jobRoles: ['Lab', 'Supervisor'], process: 'Compliance', action: 'Handle and store hazardous materials per regulatory requirements' },
  { id: 10, name: 'WMS - System Navigation', jobRoles: ['CSR/Clerk', 'Inventory', 'PIT', 'Lab', 'Lead', 'Supervisor', 'Operations Manager'], process: 'Systems', action: 'Navigate and operate the Warehouse Management System' },
];

export const SEED_RATINGS: EmployeeSkill[] = [
  { id: 1, employeeId: 1, skill: 'Inbound - Verification', rating: 4, dateAssessed: '2024-02-15', assessedBy: 'System' },
  { id: 2, employeeId: 1, skill: 'Outbound - Picking', rating: 3, dateAssessed: '2024-01-10', assessedBy: 'System' },
  { id: 3, employeeId: 1, skill: 'Outbound - Packing', rating: 3, dateAssessed: '2024-01-10', assessedBy: 'System' },
  { id: 4, employeeId: 1, skill: 'Returns Processing', rating: 2, dateAssessed: '2024-03-01', assessedBy: 'System' },
  { id: 5, employeeId: 2, skill: 'Inbound - Putaway', rating: 4, dateAssessed: '2023-10-05', assessedBy: 'System' },
  { id: 6, employeeId: 2, skill: 'Inventory - Cycle Count', rating: 3, dateAssessed: '2023-11-20', assessedBy: 'System' },
  { id: 7, employeeId: 2, skill: 'Equipment - Forklift', rating: 3, dateAssessed: '2023-09-15', assessedBy: 'System' },
  { id: 8, employeeId: 3, skill: 'Inbound - Verification', rating: 4, dateAssessed: '2023-05-10', assessedBy: 'System' },
  { id: 9, employeeId: 3, skill: 'Outbound - Picking', rating: 4, dateAssessed: '2023-05-10', assessedBy: 'System' },
  { id: 10, employeeId: 3, skill: 'Quality - Inspection', rating: 3, dateAssessed: '2023-08-12', assessedBy: 'System' },
  { id: 11, employeeId: 3, skill: 'Inventory - Cycle Count', rating: 4, dateAssessed: '2023-06-01', assessedBy: 'System' },
  { id: 12, employeeId: 4, skill: 'Inbound - Putaway', rating: 2, dateAssessed: '2024-04-01', assessedBy: 'System' },
  { id: 13, employeeId: 4, skill: 'Equipment - Forklift', rating: 3, dateAssessed: '2024-04-01', assessedBy: 'System' },
  { id: 14, employeeId: 5, skill: 'Quality - Inspection', rating: 4, dateAssessed: '2023-12-10', assessedBy: 'System' },
  { id: 15, employeeId: 5, skill: 'Hazardous Materials', rating: 3, dateAssessed: '2024-01-15', assessedBy: 'System' },
  { id: 16, employeeId: 6, skill: 'Quality - Inspection', rating: 4, dateAssessed: '2022-06-15', assessedBy: 'System' },
  { id: 17, employeeId: 6, skill: 'Inventory - Cycle Count', rating: 4, dateAssessed: '2022-07-01', assessedBy: 'System' },
  { id: 18, employeeId: 6, skill: 'Hazardous Materials', rating: 4, dateAssessed: '2022-09-10', assessedBy: 'System' },
  { id: 19, employeeId: 6, skill: 'WMS - System Navigation', rating: 4, dateAssessed: '2022-05-22', assessedBy: 'System' },
  { id: 20, employeeId: 7, skill: 'Inbound - Verification', rating: 1, dateAssessed: '2024-03-20', assessedBy: 'System' },
  { id: 21, employeeId: 7, skill: 'Outbound - Packing', rating: 1, dateAssessed: '2024-03-20', assessedBy: 'System' },
];

export const SEED_COACHING: CoachingOpportunity[] = [
  { id: 1, employeeId: 7, title: 'Attendance improvement', notes: 'Multiple late arrivals in March. Discussed importance of punctuality.', status: 'Open', dateOpened: '2024-03-15' },
  { id: 2, employeeId: 4, title: 'Putaway accuracy', notes: 'Several misplacements noted. Extra training scheduled.', status: 'Open', dateOpened: '2024-04-05' },
  { id: 3, employeeId: 1, title: 'Safety protocol reminder', notes: 'Forgot safety vest on warehouse floor twice.', status: 'Closed', dateOpened: '2024-01-20', dateClosed: '2024-02-01' },
];

export const SEED_CONTACTS: Contact[] = [
  { id: 1, fullName: 'Sarah Chen', company: 'Bayer', role: 'Site Operations Manager', phone: '(507) 555-0201', email: 'sarah.chen@bayer.com', category: 'Bayer' },
  { id: 2, fullName: "Mike's Forklift Services", company: "Mike's Equipment", role: 'Service Technician', phone: '(507) 555-0202', email: 'service@mikesforklift.com', category: 'Vendor' },
  { id: 3, fullName: 'Albert Lea Fire Dept', company: 'City of Albert Lea', role: 'Emergency Response', phone: '911', email: '', category: 'Emergency' },
  { id: 4, fullName: 'James Rodriguez', company: 'Packaging Solutions Inc', role: 'Sales Rep', phone: '(507) 555-0204', email: 'j.rodriguez@packsol.com', category: 'Vendor' },
];

export interface Equipment {
  id: number;
  name: string;
  type: 'Forklift' | 'Reach Truck' | 'Pallet Jack' | 'RF Scanner' | 'Printer' | 'Other';
  status: 'Available' | 'In Use' | 'Under Maintenance' | 'Out of Service';
  assignedToId?: number;
  lastInspected?: string;
  serialNumber: string;
  notes?: string;
}

export const SEED_EQUIPMENT: Equipment[] = [
  { id: 1, name: 'Forklift #3', type: 'Forklift', status: 'Available', serialNumber: 'FL-2024-03', lastInspected: '2026-06-01' },
  { id: 2, name: 'Reach Truck #12', type: 'Reach Truck', status: 'In Use', assignedToId: 4, serialNumber: 'RT-2023-12', lastInspected: '2026-06-10' },
  { id: 3, name: 'Pallet Jack #7', type: 'Pallet Jack', status: 'Under Maintenance', serialNumber: 'PJ-2022-07', lastInspected: '2026-05-15' },
  { id: 4, name: 'RF Scanner #4', type: 'RF Scanner', status: 'Available', serialNumber: 'RF-2025-04', lastInspected: '2026-06-12' },
  { id: 5, name: 'RF Scanner #9', type: 'RF Scanner', status: 'Out of Service', serialNumber: 'RF-2025-09', lastInspected: '2026-04-10' },
];

