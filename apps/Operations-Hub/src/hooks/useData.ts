import { useState, useEffect, useCallback } from 'react';
import type { Employee, EmployeeSkill, Skill, CoachingOpportunity, Contact, Equipment } from '../types';
import { ontologyClient } from '@gxo/semantic';

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

      const [
        ontologyEmployees,
        ontologySkills,
        ontologyRatings,
        ontologyCoaching,
        ontologyContacts,
        ontologyEquipments
      ] = await Promise.all([
        ontologyClient.getEmployees(),
        ontologyClient.getSkills(),
        ontologyClient.getRatings(),
        ontologyClient.getCoaching(),
        ontologyClient.getContacts(),
        ontologyClient.getEquipments()
      ]);

      const mappedEmployees: Employee[] = ontologyEmployees.map(e => ({
        id: e.id,
        ...e.properties
      }));

      const mappedSkills: Skill[] = ontologySkills.map(s => ({
        id: s.id,
        ...s.properties
      }));

      const mappedRatings: EmployeeSkill[] = ontologyRatings.map(r => ({
        id: r.id,
        ...r.properties
      }));

      const mappedCoaching: CoachingOpportunity[] = ontologyCoaching.map(c => ({
        id: c.id,
        ...c.properties
      }));

      const mappedContacts: Contact[] = ontologyContacts.map(c => ({
        id: c.id,
        ...c.properties
      }));

      const mappedEquipments: Equipment[] = ontologyEquipments.map(e => ({
        id: e.id,
        ...e.properties
      }));

      const allJobRoles = [
        'CSR/Clerk',
        'Inventory',
        'PIT',
        'Lab',
        'Lead',
        'Supervisor',
        'Operations Manager'
      ];
      
      const sbr: Record<string, string[]> = {};
      allJobRoles.forEach(r => sbr[r] = []);
      mappedSkills.forEach(s => {
        if (Array.isArray(s.jobRoles)) {
          s.jobRoles.forEach(role => {
            if (sbr[role]) sbr[role].push(s.name);
          });
        }
      });

      setEmployees(mappedEmployees);
      setSkills(mappedSkills);
      setRatings(mappedRatings);
      setCoaching(mappedCoaching);
      setContacts(mappedContacts);
      setEquipments(mappedEquipments);
      
      setJobRoles(allJobRoles);
      setSkillsByRole(sbr);

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
      await ontologyClient.updateEmployee({ id: editingId, ...data });
    } else {
      await ontologyClient.createEmployee(data);
    }
    await loadAll();
  }, [loadAll]);

  const toggleActive = useCallback(async (id: number) => {
    const emp = employees.find(e => e.id === id);
    if (!emp) return;
    await ontologyClient.updateEmployee({ id, active: !emp.active });
    await loadAll();
  }, [employees, loadAll]);

  const saveRating = useCallback(async (data: { employeeId: number; skill: string; rating: 1 | 2 | 3 | 4; notes: string }) => {
    await ontologyClient.createRating(data);
    await loadAll();
  }, [loadAll]);

  const updateRatingValue = useCallback(async (id: number, rating: 1 | 2 | 3 | 4) => {
    await ontologyClient.updateRating({ id, rating });
    await loadAll();
  }, [loadAll]);

  const saveSkill = useCallback(async (data: { name: string; jobRoles: string[]; process?: string; action?: string }) => {
    await ontologyClient.createSkill(data);
    await loadAll();
  }, [loadAll]);

  const removeSkill = useCallback(async (id: number) => {
    await ontologyClient.deleteSkill({ id });
    await loadAll();
  }, [loadAll]);

  const saveCoaching = useCallback(async (data: { title: string; employeeId: number; notes: string }) => {
    await ontologyClient.createCoaching(data);
    await loadAll();
  }, [loadAll]);

  const closeCoaching = useCallback(async (id: number) => {
    await ontologyClient.updateCoachingStatus({ id, status: 'Closed' });
    await loadAll();
  }, [loadAll]);

  const reopenCoaching = useCallback(async (id: number) => {
    await ontologyClient.updateCoachingStatus({ id, status: 'Open' });
    await loadAll();
  }, [loadAll]);

  const removeCoaching = useCallback(async (id: number) => {
    await ontologyClient.deleteCoaching({ id });
    await loadAll();
  }, [loadAll]);

  const saveContact = useCallback(async (data: Omit<Contact, 'id'>, editingId?: number) => {
    if (editingId) {
      await ontologyClient.updateContact({ id: editingId, ...data });
    } else {
      await ontologyClient.createContact(data);
    }
    await loadAll();
  }, [loadAll]);

  const removeContact = useCallback(async (id: number) => {
    await ontologyClient.deleteContact({ id });
    await loadAll();
  }, [loadAll]);

  const saveEquipment = useCallback(async (data: Omit<Equipment, 'id'>, editingId?: number) => {
    if (editingId) {
      await ontologyClient.updateEquipment({ id: editingId, ...data });
    } else {
      await ontologyClient.createEquipment(data);
    }
    await loadAll();
  }, [loadAll]);

  const removeEquipment = useCallback(async (id: number) => {
    await ontologyClient.deleteEquipment({ id });
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
