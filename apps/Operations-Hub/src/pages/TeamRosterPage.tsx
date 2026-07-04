import { useState, useMemo } from "react";
import { Search, Plus, Pencil, Users, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { Avatar, Pills, SectionHead, Stat } from "../components/UI";
import type { Employee, EmployeeSkill, Navigation } from "../types";

interface Props {
  employees: Employee[];
  ratings: EmployeeSkill[];
  jobRoles: string[];
  onNavigate: (v: Navigation) => void;
  onEdit: (emp: Employee) => void;
  onAdd: () => void;
  onToggleActive: (id: number) => void;
  onBack: () => void;
}

export const TeamRosterPage = ({
  employees, ratings, jobRoles, onNavigate, onEdit, onAdd, onToggleActive, onBack
}: Props) => {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('All');
  const [shiftFilter, setShiftFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('Active');

  const filtered = useMemo(() => {
    return employees.filter(e => {
      if (search) {
        const q = search.toLowerCase();
        if (!e.fullName.toLowerCase().includes(q) && !(e.email || '').toLowerCase().includes(q)) return false;
      }
      if (roleFilter !== 'All' && e.jobRole !== roleFilter) return false;
      if (shiftFilter !== 'All' && e.shift !== shiftFilter) return false;
      if (statusFilter === 'Active' && !e.active) return false;
      if (statusFilter === 'Inactive' && e.active) return false;
      return true;
    }).sort((a, b) => a.lastName.localeCompare(b.lastName));
  }, [employees, search, roleFilter, shiftFilter, statusFilter]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-6 md:py-10">
      <button onClick={onBack}
        className="inline-flex items-center gap-2 text-sm text-stone-500 hover:text-stone-900 mb-4 md:mb-6 transition py-2 -ml-2 px-2 rounded-full">
        <ChevronLeft size={16} /> Back to home
      </button>

      <SectionHead
        eyebrow={`${filtered.length} of ${employees.length} employees`}
        title="Team Roster"
        action={
          <button onClick={onAdd}
            className="inline-flex items-center justify-center gap-2 bg-stone-900 hover:bg-stone-800 active:bg-stone-700 text-white px-5 py-3 rounded-full text-sm font-medium transition shadow-sm w-full md:w-auto">
            <Plus size={16} strokeWidth={2.5} /> Add Employee
          </button>
        }
      />

      <div className="flex flex-col gap-3 mb-5">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full pl-11 pr-4 py-3 bg-white border border-stone-200 rounded-full text-sm focus:outline-none focus:border-stone-400 transition" />
        </div>
        <div className="flex flex-wrap gap-2">
          <Pills options={['All', 'Active', 'Inactive']} value={statusFilter} onChange={setStatusFilter} />
          <Pills options={['All', '1st', '2nd']} value={shiftFilter} onChange={setShiftFilter} />
        </div>
      </div>

      <div className="flex items-center gap-2 mb-5 md:mb-6 overflow-x-auto pb-1 scrollbar-hide">
        <span className="text-xs text-stone-500 font-medium uppercase tracking-wider mr-1 whitespace-nowrap flex-shrink-0">Role</span>
        <Pills options={['All', ...jobRoles]} value={roleFilter} onChange={setRoleFilter} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        {filtered.map(emp => {
          const empRatings = ratings.filter(r => r.employeeId === emp.id);
          const expert = empRatings.filter(r => r.rating === 4).length;
          const training = empRatings.filter(r => r.rating === 1).length;
          const avg = empRatings.length > 0
            ? (empRatings.reduce((s, r) => s + r.rating, 0) / empRatings.length).toFixed(1)
            : '—';

          return (
            <div key={emp.id}
              className="group bg-white border border-stone-200 rounded-2xl p-5 md:p-6 hover:border-stone-900 hover:shadow-lg active:bg-stone-50 transition-all">
              <button onClick={() => onNavigate({ name: 'employee', emp })} className="w-full text-left">
                <div className="flex items-start justify-between mb-4 md:mb-5">
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar firstName={emp.firstName} lastName={emp.lastName} jobRole={emp.jobRole} />
                    <div className="min-w-0">
                      <div className="font-medium text-stone-900 leading-tight truncate">{emp.fullName}</div>
                      <div className="text-xs text-stone-500 mt-0.5 truncate">{emp.jobRole} · {emp.shift} Shift</div>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-stone-300 group-hover:text-stone-900 transition mt-1 flex-shrink-0" />
                </div>

                <div className="grid grid-cols-3 gap-2 pt-4 border-t border-stone-100">
                  <Stat label="Skills" value={empRatings.length} />
                  <Stat label="Expert" value={expert} accent={expert > 0 ? "emerald" : null} />
                  <Stat label="Avg" value={avg} />
                </div>

                {training > 0 && (
                  <div className="mt-3 flex items-center gap-1.5 text-xs text-amber-700">
                    <AlertCircle size={12} /> {training} in training
                  </div>
                )}
              </button>

              <div className="flex items-center justify-end gap-1 mt-3 pt-3 border-t border-stone-100 md:opacity-0 md:group-hover:opacity-100 transition">
                <button onClick={(e) => { e.stopPropagation(); onEdit(emp); }}
                  className="p-2.5 hover:bg-stone-100 active:bg-stone-200 rounded-full transition" title="Edit" aria-label="Edit">
                  <Pencil size={14} className="text-stone-600" />
                </button>
                <button onClick={(e) => { e.stopPropagation(); onToggleActive(emp.id); }}
                  className="px-3 py-2 text-xs text-stone-600 hover:bg-stone-100 active:bg-stone-200 rounded-full transition">
                  {emp.active ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <Users size={28} className="mx-auto text-stone-300 mb-3" />
          <p className="text-sm text-stone-500">No employees match your filters.</p>
          <button onClick={() => {
            setSearch(''); setRoleFilter('All'); setShiftFilter('All'); setStatusFilter('All');
          }}
            className="mt-3 text-xs font-medium text-stone-900 hover:underline py-2 px-4">
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
};
