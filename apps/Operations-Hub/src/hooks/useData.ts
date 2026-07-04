import { useState, useEffect, useCallback } from 'react';
import type { Employee, EmployeeSkill, Skill, CoachingOpportunity, Contact, Equipment } from '../types';
import {
  fetchEmployees, fetchRatings, fetchJobRoles, fetchSkills, fetchCoaching, fetchContacts, fetchSkillsByRole, fetchEquipments,
  createEmployee, updateEmployee,
  createRating, updateRating,
  createSkill, deleteSkill,
  createCoaching, updateCoachingStatus, deleteCoaching,
  createContact, updateContact, deleteContact,
  createEquipment, updateEquipment, deleteEquipment,
} from '../data/service';

export function useData() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [ratings, setRatings] = useState<EmployeeSkill[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [coaching, setCoaching] = useState<CoachingOpportunity[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [jobRoles, setJobRoles] = useState<string[]>([]);
  const [skillsByRole, setSkillsByRole] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAll = useCallback(async () => {
    try {
      setLoading(true);
      const [emp, rat, roles, skl, coach, cont, sbr, equip] = await Promise.all([
        fetchEmployees(), fetchRatings(), fetchJobRoles(),
        fetchSkills(), fetchCoaching(), fetchContacts(), fetchSkillsByRole(), fetchEquipments(),
      ]);
      setEmployees(emp);
      setRatings(rat);
      setJobRoles(roles);
      setSkills(skl);
      setCoaching(coach);
      setContacts(cont);
      setSkillsByRole(sbr);
      setEquipments(equip);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const saveEmployee = useCallback(async (data: Omit<Employee, 'id'>, editingId?: number) => {
    if (editingId) {
      await updateEmployee(editingId, data);
    } else {
      await createEmployee(data);
    }
    await loadAll();
  }, [loadAll]);

  const toggleActive = useCallback(async (id: number) => {
    const emp = employees.find(e => e.id === id);
    if (!emp) return;
    await updateEmployee(id, { ...emp, active: !emp.active });
    await loadAll();
  }, [employees, loadAll]);

  const saveRating = useCallback(async (data: { employeeId: number; skill: string; rating: 1 | 2 | 3 | 4; notes: string }) => {
    await createRating(data);
    await loadAll();
  }, [loadAll]);

  const updateRatingValue = useCallback(async (id: number, rating: 1 | 2 | 3 | 4) => {
    await updateRating(id, rating);
    await loadAll();
  }, [loadAll]);

  const saveSkill = useCallback(async (data: { name: string; jobRoles: string[]; process?: string; action?: string }) => {
    await createSkill(data);
    await loadAll();
  }, [loadAll]);

  const removeSkill = useCallback(async (id: number) => {
    await deleteSkill(id);
    await loadAll();
  }, [loadAll]);

  const saveCoaching = useCallback(async (data: { title: string; employeeId: number; notes: string }) => {
    await createCoaching(data);
    await loadAll();
  }, [loadAll]);

  const closeCoaching = useCallback(async (id: number) => {
    await updateCoachingStatus(id, 'Closed');
    await loadAll();
  }, [loadAll]);

  const reopenCoaching = useCallback(async (id: number) => {
    await updateCoachingStatus(id, 'Open');
    await loadAll();
  }, [loadAll]);

  const removeCoaching = useCallback(async (id: number) => {
    await deleteCoaching(id);
    await loadAll();
  }, [loadAll]);

  const saveContact = useCallback(async (data: Omit<Contact, 'id'>, editingId?: number) => {
    if (editingId) {
      await updateContact(editingId, data);
    } else {
      await createContact(data);
    }
    await loadAll();
  }, [loadAll]);

  const removeContact = useCallback(async (id: number) => {
    await deleteContact(id);
    await loadAll();
  }, [loadAll]);

  const saveEquipment = useCallback(async (data: Omit<Equipment, 'id'>, editingId?: number) => {
    if (editingId) {
      await updateEquipment(editingId, data);
    } else {
      await createEquipment(data);
    }
    await loadAll();
  }, [loadAll]);

  const removeEquipment = useCallback(async (id: number) => {
    await deleteEquipment(id);
    await loadAll();
  }, [loadAll]);

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
