import type {
  Employee, Skill, EmployeeSkill, CoachingOpportunity, Contact, Equipment,
} from '../types';
import {
  SEED_EMPLOYEES, SEED_SKILLS, SEED_RATINGS, SEED_COACHING, SEED_CONTACTS, JOB_ROLES, SEED_EQUIPMENT,
} from '../types';
import { generateId } from '../lib/utils';

const KEYS = {
  employees: 'gxo_employees',
  skills: 'gxo_skills',
  ratings: 'gxo_ratings',
  coaching: 'gxo_coaching',
  contacts: 'gxo_contacts',
  equipments: 'gxo_equipments',
  initialized: 'gxo_initialized',
};

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function save<T>(key: string, data: T): void {
  localStorage.setItem(key, JSON.stringify(data));
}

function initSeedData(): void {
  if (localStorage.getItem(KEYS.initialized)) return;
  save(KEYS.employees, SEED_EMPLOYEES);
  save(KEYS.skills, SEED_SKILLS);
  save(KEYS.ratings, SEED_RATINGS);
  save(KEYS.coaching, SEED_COACHING);
  save(KEYS.contacts, SEED_CONTACTS);
  save(KEYS.equipments, SEED_EQUIPMENT);
  localStorage.setItem(KEYS.initialized, 'true');
}

// Employees
export const fetchEmployees = async (): Promise<Employee[]> => {
  initSeedData();
  return load(KEYS.employees, []);
};

export const createEmployee = async (data: Omit<Employee, 'id'>): Promise<Employee> => {
  const employees = load<Employee[]>(KEYS.employees, []);
  const newEmp: Employee = { ...data, id: generateId() };
  save(KEYS.employees, [...employees, newEmp]);
  return newEmp;
};

export const updateEmployee = async (id: number, data: Omit<Employee, 'id'>): Promise<Employee> => {
  const employees = load<Employee[]>(KEYS.employees, []);
  const updated = employees.map(e => e.id === id ? { ...data, id } : e);
  save(KEYS.employees, updated);
  return { ...data, id };
};

// Skills
export const fetchSkills = async (): Promise<Skill[]> => {
  initSeedData();
  return load(KEYS.skills, []);
};

export const createSkill = async (data: Omit<Skill, 'id'>): Promise<Skill> => {
  const skills = load<Skill[]>(KEYS.skills, []);
  const newSkill: Skill = { ...data, id: generateId() };
  save(KEYS.skills, [...skills, newSkill]);
  return newSkill;
};

export const deleteSkill = async (id: number): Promise<void> => {
  const skills = load<Skill[]>(KEYS.skills, []);
  save(KEYS.skills, skills.filter(s => s.id !== id));
};

// Ratings (EmployeeSkill)
export const fetchRatings = async (): Promise<EmployeeSkill[]> => {
  initSeedData();
  return load(KEYS.ratings, []);
};

export const createRating = async (data: Omit<EmployeeSkill, 'id' | 'dateAssessed' | 'assessedBy'>): Promise<EmployeeSkill> => {
  const ratings = load<EmployeeSkill[]>(KEYS.ratings, []);
  const newRating: EmployeeSkill = {
    ...data,
    id: generateId(),
    dateAssessed: new Date().toISOString().split('T')[0],
    assessedBy: 'Current User',
  };
  save(KEYS.ratings, [...ratings, newRating]);
  return newRating;
};

export const updateRating = async (id: number, rating: 1 | 2 | 3 | 4): Promise<void> => {
  const ratings = load<EmployeeSkill[]>(KEYS.ratings, []);
  const updated = ratings.map(r => r.id === id ? { ...r, rating } : r);
  save(KEYS.ratings, updated);
};

// Coaching
export const fetchCoaching = async (): Promise<CoachingOpportunity[]> => {
  initSeedData();
  return load(KEYS.coaching, []);
};

export const createCoaching = async (data: { title: string; employeeId: number; notes: string }): Promise<CoachingOpportunity> => {
  const coaching = load<CoachingOpportunity[]>(KEYS.coaching, []);
  const newCoaching: CoachingOpportunity = {
    ...data,
    id: generateId(),
    status: 'Open',
    dateOpened: new Date().toISOString(),
  };
  save(KEYS.coaching, [...coaching, newCoaching]);
  return newCoaching;
};

export const updateCoachingStatus = async (id: number, status: 'Open' | 'Closed'): Promise<void> => {
  const coaching = load<CoachingOpportunity[]>(KEYS.coaching, []);
  const updated = coaching.map(c =>
    c.id === id ? { ...c, status, dateClosed: status === 'Closed' ? new Date().toISOString() : undefined } : c
  );
  save(KEYS.coaching, updated);
};

export const deleteCoaching = async (id: number): Promise<void> => {
  const coaching = load<CoachingOpportunity[]>(KEYS.coaching, []);
  save(KEYS.coaching, coaching.filter(c => c.id !== id));
};

// Contacts
export const fetchContacts = async (): Promise<Contact[]> => {
  initSeedData();
  return load(KEYS.contacts, []);
};

export const createContact = async (data: Omit<Contact, 'id'>): Promise<Contact> => {
  const contacts = load<Contact[]>(KEYS.contacts, []);
  const newContact: Contact = { ...data, id: generateId() };
  save(KEYS.contacts, [...contacts, newContact]);
  return newContact;
};

export const updateContact = async (id: number, data: Omit<Contact, 'id'>): Promise<Contact> => {
  const contacts = load<Contact[]>(KEYS.contacts, []);
  const updated = contacts.map(c => c.id === id ? { ...data, id } : c);
  save(KEYS.contacts, updated);
  return { ...data, id };
};

export const deleteContact = async (id: number): Promise<void> => {
  const contacts = load<Contact[]>(KEYS.contacts, []);
  save(KEYS.contacts, contacts.filter(c => c.id !== id));
};

// Derived: job roles from skills + predefined list
export const fetchJobRoles = async (): Promise<string[]> => {
  initSeedData();
  return JOB_ROLES;
};

// Derived: skills grouped by role
export const fetchSkillsByRole = async (): Promise<Record<string, string[]>> => {
  const skills = await fetchSkills();
  const map: Record<string, string[]> = {};
  skills.forEach(s => {
    s.jobRoles.forEach(role => {
      if (!map[role]) map[role] = [];
      map[role].push(s.name);
    });
  });
  return map;
};

// Equipments
export const fetchEquipments = async (): Promise<Equipment[]> => {
  initSeedData();
  return load(KEYS.equipments, []);
};

export const createEquipment = async (data: Omit<Equipment, 'id'>): Promise<Equipment> => {
  const equipments = load<Equipment[]>(KEYS.equipments, []);
  const newEquip: Equipment = { ...data, id: generateId() };
  save(KEYS.equipments, [...equipments, newEquip]);
  return newEquip;
};

export const updateEquipment = async (id: number, data: Omit<Equipment, 'id'>): Promise<Equipment> => {
  const equipments = load<Equipment[]>(KEYS.equipments, []);
  const updated = equipments.map(eq => eq.id === id ? { ...data, id } : eq);
  save(KEYS.equipments, updated);
  return { ...data, id };
};

export const deleteEquipment = async (id: number): Promise<void> => {
  const equipments = load<Equipment[]>(KEYS.equipments, []);
  save(KEYS.equipments, equipments.filter(eq => eq.id !== id));
};

