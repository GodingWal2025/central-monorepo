import { ChevronLeft } from "lucide-react";
import { Avatar } from "../components/UI";
import type { Employee, EmployeeSkill, Navigation, Skill } from "../types";
import { ratingMeta, getRoleColor } from "../types";
import { relativeTime } from "../lib/utils";

interface Props {
  skill: Skill;
  employees: Employee[];
  ratings: EmployeeSkill[];
  onBack: () => void;
  onNavigate: (v: Navigation) => void;
  onAddRating: (emp: Employee, skill: string) => void;
}

export const SkillDetailPage = ({ skill, employees, ratings, onBack, onNavigate, onAddRating }: Props) => {
  const skillRatings = ratings.filter(r => r.skill === skill.name);
  const byRating: Record<number, Array<EmployeeSkill & { employee: Employee }>> = { 4: [], 3: [], 2: [], 1: [] };

  skillRatings.forEach(r => {
    const emp = employees.find(e => e.id === r.employeeId);
    if (emp) byRating[r.rating].push({ ...r, employee: emp });
  });

  // Employees who SHOULD have this skill (their role is in skill.jobRoles) but don't yet
  const empsWithoutSkill = employees.filter(e =>
    e.active &&
    skill.jobRoles.includes(e.jobRole) &&
    !skillRatings.some(r => r.employeeId === e.id)
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-10 py-6 md:py-10">
      <button onClick={onBack}
        className="inline-flex items-center gap-2 text-sm text-stone-500 hover:text-stone-900 mb-6 md:mb-8 transition py-2 -ml-2 px-2 rounded-full">
        <ChevronLeft size={16} /> Back to library
      </button>

      <div className="mb-8 md:mb-10 pb-6 md:pb-8 border-b border-stone-200">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          {skill.jobRoles.map(role => (
            <span key={role}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-stone-100 text-[10px] uppercase tracking-[0.2em] font-medium">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: getRoleColor(role).hex }} />
              <span className="text-stone-600">{role}</span>
            </span>
          ))}
          {skill.process && (
            <span className="text-[10px] uppercase tracking-[0.2em] text-stone-500 font-medium">· {skill.process}</span>
          )}
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif text-stone-900 tracking-tight mb-3 leading-tight">{skill.name}</h1>

        {skill.action && (
          <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 md:p-5 my-5 md:my-6">
            <p className="text-[10px] uppercase tracking-[0.2em] text-stone-500 font-medium mb-2">Action / Description</p>
            <p className="text-sm text-stone-700 leading-relaxed whitespace-pre-wrap">{skill.action}</p>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
          <div>
            <span className="text-stone-500">Assessed:</span>{' '}
            <span className="font-medium text-stone-900">{skillRatings.length}</span>
          </div>
          <div>
            <span className="text-stone-500">Experts:</span>{' '}
            <span className="font-medium" style={{ color: ratingMeta[4].color }}>{byRating[4].length}</span>
          </div>
          <div>
            <span className="text-stone-500">In training:</span>{' '}
            <span className="font-medium" style={{ color: ratingMeta[1].color }}>{byRating[1].length}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-8 md:mb-10">
        {[4, 3, 2, 1].map(level => {
          const meta = ratingMeta[level];
          const people = byRating[level];
          return (
            <div key={level} className="bg-white border border-stone-200 rounded-2xl overflow-hidden">
              <div className="px-4 md:px-5 py-3 md:py-4 border-b border-stone-100 flex items-center justify-between" style={{ backgroundColor: meta.light }}>
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: meta.color }} />
                  <span className="text-sm font-medium" style={{ color: meta.color }}>{meta.label}</span>
                  <span className="hidden sm:inline text-xs text-stone-500 truncate">· {meta.desc}</span>
                </div>
                <span className="font-serif text-xl text-stone-900 flex-shrink-0">{people.length}</span>
              </div>
              <div className="divide-y divide-stone-100">
                {people.map(p => (
                  <button key={p.id} onClick={() => onNavigate({ name: 'employee', emp: p.employee })}
                    className="w-full px-4 md:px-5 py-3 flex items-center gap-3 hover:bg-stone-50 active:bg-stone-100 transition text-left">
                    <Avatar firstName={p.employee.firstName} lastName={p.employee.lastName} jobRole={p.employee.jobRole} size="sm" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-stone-900 truncate">{p.employee.fullName}</div>
                      <div className="text-xs text-stone-500">{p.employee.shift} Shift</div>
                    </div>
                    <span className="text-xs text-stone-400 flex-shrink-0">{relativeTime(p.dateAssessed)}</span>
                  </button>
                ))}
                {people.length === 0 && <div className="px-5 py-6 text-xs text-stone-400 text-center">None at this level</div>}
              </div>
            </div>
          );
        })}
      </div>

      {empsWithoutSkill.length > 0 && (
        <div>
          <h2 className="text-xs uppercase tracking-[0.2em] text-stone-500 font-medium mb-4">Not Yet Assessed · {empsWithoutSkill.length}</h2>
          <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 md:p-5">
            <div className="flex flex-wrap gap-2">
              {empsWithoutSkill.map(emp => (
                <button key={emp.id} onClick={() => onAddRating(emp, skill.name)}
                  className="inline-flex items-center gap-2 bg-white border border-stone-200 text-stone-700 text-xs px-3 py-2 rounded-full hover:border-stone-900 active:bg-stone-50 transition">
                  <Avatar firstName={emp.firstName} lastName={emp.lastName} jobRole={emp.jobRole} size="xs" />
                  {emp.fullName}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
