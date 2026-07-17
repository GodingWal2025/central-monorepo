import { useState, useEffect, useCallback } from 'react';
import type { Employee, EmployeeSkill, Skill, CoachingOpportunity, Contact, Equipment } from '../types';
import { ontologyClient } from '@gxo/semantic';
import { denull } from '@gxo/shared';

const ALL_JOB_ROLES = [
  'CSR/Clerk',
  'Inventory',
  'PIT',
  'Lab',
  'Lead',
  'Supervisor',
  'Operations Manager',
];

export function useData() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [ratings, setRatings] = useState<EmployeeSkill[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [coaching, setCoaching] = useState<CoachingOpportunity[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [skillsByRole, setSkillsByRole] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // jobRoles is a fixed catalog, not server data.
  const jobRoles = ALL_JOB_ROLES;

  // ─── Per-domain loaders ─────────────────────────────────────────
  // Each mutation refetches only the domain it touched instead of reloading
  // everything, so a single edit no longer re-fetches all six collections.
  const loadEmployees = useCallback(async () => {
    const objs = await ontologyClient.getEmployees();
    setEmployees(objs.map(e => denull({ id: e.id, ...e.properties })));
  }, []);

  const loadRatings = useCallback(async () => {
    const objs = await ontologyClient.getRatings();
    setRatings(objs.map(r => denull({ id: r.id, ...r.properties })));
  }, []);

  const loadSkills = useCallback(async () => {
    const objs = await ontologyClient.getSkills();
    const mapped: Skill[] = objs.map(s => denull({ id: s.id, ...s.properties }));
    setSkills(mapped);

    const sbr: Record<string, string[]> = {};
    ALL_JOB_ROLES.forEach(r => { sbr[r] = []; });
    mapped.forEach(s => {
      if (Array.isArray(s.jobRoles)) {
        s.jobRoles.forEach(role => {
          if (sbr[role]) sbr[role].push(s.name);
        });
      }
    });
    setSkillsByRole(sbr);
  }, []);

  const loadCoaching = useCallback(async () => {
    const objs = await ontologyClient.getCoaching();
    setCoaching(objs.map(c => denull({ id: c.id, ...c.properties })));
  }, []);

  const loadContacts = useCallback(async () => {
    const objs = await ontologyClient.getContacts();
    setContacts(objs.map(c => denull({ id: c.id, ...c.properties })));
  }, []);

  const loadEquipments = useCallback(async () => {
    const objs = await ontologyClient.getEquipments();
    setEquipments(objs.map(e => denull({ id: e.id, ...e.properties })));
  }, []);

  const loadAll = useCallback(async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadEmployees(),
        loadSkills(),
        loadRatings(),
        loadCoaching(),
        loadContacts(),
        loadEquipments(),
      ]);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [loadEmployees, loadSkills, loadRatings, loadCoaching, loadContacts, loadEquipments]);

  useEffect(() => { loadAll(); }, [loadAll]);

  // ─── Employees ──────────────────────────────────────────────────
  const saveEmployee = useCallback(async (data: Omit<Employee, 'id'>, editingId?: number) => {
    if (editingId) {
      await ontologyClient.updateEmployee({ id: editingId, ...data });
    } else {
      await ontologyClient.createEmployee(data);
    }
    await loadEmployees();
  }, [loadEmployees]);

  const toggleActive = useCallback(async (id: number) => {
    const emp = employees.find(e => e.id === id);
    if (!emp) return;
    await ontologyClient.updateEmployee({ id, active: !emp.active });
    await loadEmployees();
  }, [employees, loadEmployees]);

  // ─── Ratings ────────────────────────────────────────────────────
  const saveRating = useCallback(async (data: { employeeId: number; skill: string; rating: 1 | 2 | 3 | 4; notes: string }) => {
    await ontologyClient.createRating(data);
    await loadRatings();
  }, [loadRatings]);

  const updateRatingValue = useCallback(async (id: number, rating: 1 | 2 | 3 | 4) => {
    await ontologyClient.updateRating({ id, rating });
    await loadRatings();
  }, [loadRatings]);

  // ─── Skills ─────────────────────────────────────────────────────
  const saveSkill = useCallback(async (data: { name: string; jobRoles: string[]; process?: string; action?: string }) => {
    await ontologyClient.createSkill(data);
    await loadSkills();
  }, [loadSkills]);

  const removeSkill = useCallback(async (id: number) => {
    await ontologyClient.deleteSkill({ id });
    await loadSkills();
  }, [loadSkills]);

  // ─── Coaching ───────────────────────────────────────────────────
  const saveCoaching = useCallback(async (data: { title: string; employeeId: number; notes: string }) => {
    await ontologyClient.createCoaching(data);
    await loadCoaching();
  }, [loadCoaching]);

  const closeCoaching = useCallback(async (id: number) => {
    await ontologyClient.updateCoachingStatus({ id, status: 'Closed' });
    await loadCoaching();
  }, [loadCoaching]);

  const reopenCoaching = useCallback(async (id: number) => {
    await ontologyClient.updateCoachingStatus({ id, status: 'Open' });
    await loadCoaching();
  }, [loadCoaching]);

  const removeCoaching = useCallback(async (id: number) => {
    await ontologyClient.deleteCoaching({ id });
    await loadCoaching();
  }, [loadCoaching]);

  // ─── Contacts ───────────────────────────────────────────────────
  const saveContact = useCallback(async (data: Omit<Contact, 'id'>, editingId?: number) => {
    if (editingId) {
      await ontologyClient.updateContact({ id: editingId, ...data });
    } else {
      await ontologyClient.createContact(data);
    }
    await loadContacts();
  }, [loadContacts]);

  const removeContact = useCallback(async (id: number) => {
    await ontologyClient.deleteContact({ id });
    await loadContacts();
  }, [loadContacts]);

  // ─── Equipment ──────────────────────────────────────────────────
  const saveEquipment = useCallback(async (data: Omit<Equipment, 'id'>, editingId?: number) => {
    if (editingId) {
      await ontologyClient.updateEquipment({ id: editingId, ...data });
    } else {
      await ontologyClient.createEquipment(data);
    }
    await loadEquipments();
  }, [loadEquipments]);

  const removeEquipment = useCallback(async (id: number) => {
    await ontologyClient.deleteEquipment({ id });
    await loadEquipments();
  }, [loadEquipments]);

  return {
    employees, ratings, jobRoles, skills, coaching, contacts, equipments, skillsByRole,
    loading, error,
    saveEmployee, toggleActive,
    saveRating, updateRatingValue,
    saveSkill, removeSkill,
    saveCoaching, closeCoaching, reopenCoaching, removeCoaching,
    saveContact, removeContact,
    saveEquipment, removeEquipment,
  };
}
