import { ChevronLeft, Plus, Calendar, Phone, IdCard, Cake, Shirt, FileText, MessageSquare, CheckCircle2, RotateCcw, Trash2 } from "lucide-react";
import { Avatar, RatingDots, RatingBadge } from "../components/UI";
import type { Employee, EmployeeSkill, CoachingOpportunity } from "../types";
import { ratingMeta } from "../types";
import { formatHireDate } from "../lib/utils";

interface Props {
  employee: Employee;
  ratings: EmployeeSkill[];
  coaching: CoachingOpportunity[];
  skillsByRole: Record<string, string[]>;
  onBack: () => void;
  onAddSkill: (emp: Employee, skill?: string) => void;
  onUpdateRating: (id: number, rating: 1 | 2 | 3 | 4) => void;
  onAddCoaching: (emp: Employee) => void;
  onCloseCoaching: (id: number) => void;
  onReopenCoaching: (id: number) => void;
  onDeleteCoaching: (id: number, title: string) => void;
}

const formatDate = (iso: string): string => {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return iso;
  }
};

export const EmployeeDetailPage = ({
  employee, ratings, coaching, skillsByRole, onBack, onAddSkill, onUpdateRating,
  onAddCoaching, onCloseCoaching, onReopenCoaching, onDeleteCoaching
}: Props) => {
  const empRatings = ratings.filter(r => r.employeeId === employee.id);
  const allRoleSkills = skillsByRole[employee.jobRole] || [];
  const trackedSkills = new Set(empRatings.map(r => r.skill));
  const untracked = allRoleSkills.filter(s => !trackedSkills.has(s));

  const empCoaching = coaching.filter(c => c.employeeId === employee.id);
  const openCoaching = empCoaching.filter(c => c.status === 'Open');
  const closedCoaching = empCoaching.filter(c => c.status === 'Closed');
  const coachingAtCap = openCoaching.length >= 5;

  const counts: Record<number, number> = {
    1: empRatings.filter(r => r.rating === 1).length,
    2: empRatings.filter(r => r.rating === 2).length,
    3: empRatings.filter(r => r.rating === 3).length,
    4: empRatings.filter(r => r.rating === 4).length,
  };
  const total = empRatings.length;

  const showCwid = employee.cwid && !employee.jobRole.toLowerCase().includes('pit');

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-10 py-6 md:py-10">
      <button onClick={onBack}
        className="inline-flex items-center gap-2 text-sm text-stone-500 hover:text-stone-900 mb-6 md:mb-8 transition py-2 -ml-2 px-2 rounded-full">
        <ChevronLeft size={16} /> Back to roster
      </button>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start gap-4 md:gap-6 mb-8 md:mb-10 pb-8 md:pb-10 border-b border-stone-200">
        <div className="flex items-start gap-4 flex-1 min-w-0">
          <Avatar firstName={employee.firstName} lastName={employee.lastName} jobRole={employee.jobRole} size="xl" />
          <div className="flex-1 min-w-0 pt-1 md:pt-2">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif text-stone-900 tracking-tight mb-1 leading-tight">{employee.fullName}</h1>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm text-stone-600">
              <span>{employee.jobRole}</span>
              <span className="hidden sm:block w-1 h-1 rounded-full bg-stone-300" />
              <span>{employee.shift} Shift</span>
              {employee.cwr && (
                <>
                  <span className="hidden sm:block w-1 h-1 rounded-full bg-stone-300" />
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[10px] uppercase tracking-wider font-medium">CWR</span>
                </>
              )}
            </div>
            <div className="text-xs text-stone-500 mt-1 truncate">{employee.email}</div>
            <div className="flex items-center flex-wrap gap-2 mt-3">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${employee.active ? 'bg-emerald-50 text-emerald-700' : 'bg-stone-100 text-stone-500'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${employee.active ? 'bg-emerald-600' : 'bg-stone-400'}`} />
                {employee.active ? 'Active' : 'Inactive'}
              </span>
              <span className="text-xs text-stone-500">Hired {formatHireDate(employee.hireDate)}</span>
            </div>
          </div>
        </div>
        <button onClick={() => onAddSkill(employee)}
          className="inline-flex items-center justify-center gap-2 bg-stone-900 hover:bg-stone-800 active:bg-stone-700 text-white px-5 py-3 rounded-full text-sm font-medium transition shadow-sm w-full md:w-auto md:self-start">
          <Plus size={14} strokeWidth={2.5} /> Record Skill
        </button>
      </div>

      {/* Personal info card */}
      {(employee.phoneNumber || showCwid || employee.shirtSize || employee.birthday || employee.notes) && (
        <div className="mb-8 md:mb-10">
          <h2 className="text-xs uppercase tracking-[0.2em] text-stone-500 font-medium mb-4">Personal Info</h2>
          <div className="bg-white border border-stone-200 rounded-2xl divide-y divide-stone-100">
            {employee.phoneNumber && (
              <div className="px-5 py-3.5 flex items-center gap-3 text-sm">
                <Phone size={14} className="text-stone-400 flex-shrink-0" />
                <span className="text-stone-500 w-24 flex-shrink-0">Phone</span>
                <span className="text-stone-900">{employee.phoneNumber}</span>
              </div>
            )}
            {showCwid && (
              <div className="px-5 py-3.5 flex items-center gap-3 text-sm">
                <IdCard size={14} className="text-stone-400 flex-shrink-0" />
                <span className="text-stone-500 w-24 flex-shrink-0">CWID</span>
                <span className="text-stone-900 font-mono">{employee.cwid}</span>
              </div>
            )}
            {employee.shirtSize && (
              <div className="px-5 py-3.5 flex items-center gap-3 text-sm">
                <Shirt size={14} className="text-stone-400 flex-shrink-0" />
                <span className="text-stone-500 w-24 flex-shrink-0">Shirt</span>
                <span className="text-stone-900">{employee.shirtSize}</span>
              </div>
            )}
            {employee.birthday && (
              <div className="px-5 py-3.5 flex items-center gap-3 text-sm">
                <Cake size={14} className="text-stone-400 flex-shrink-0" />
                <span className="text-stone-500 w-24 flex-shrink-0">Birthday</span>
                <span className="text-stone-900">{formatDate(employee.birthday)}</span>
              </div>
            )}
            {employee.notes && (
              <div className="px-5 py-3.5 flex items-start gap-3 text-sm">
                <FileText size={14} className="text-stone-400 flex-shrink-0 mt-0.5" />
                <span className="text-stone-500 w-24 flex-shrink-0">Notes</span>
                <span className="text-stone-900 whitespace-pre-wrap leading-relaxed">{employee.notes}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Coaching opportunities */}
      <div className="mb-8 md:mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs uppercase tracking-[0.2em] text-stone-500 font-medium">
            Coaching Opportunities · {openCoaching.length} open
            {coachingAtCap && <span className="ml-2 text-amber-700">(at limit)</span>}
          </h2>
          <button
            onClick={() => onAddCoaching(employee)}
            disabled={coachingAtCap}
            className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full transition bg-stone-100 hover:bg-stone-200 active:bg-stone-300 text-stone-700 disabled:opacity-40 disabled:cursor-not-allowed">
            <Plus size={12} strokeWidth={2.5} /> Open
          </button>
        </div>
        <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden">
          {openCoaching.length === 0 && closedCoaching.length === 0 && (
            <div className="px-5 py-8 text-center text-sm text-stone-500">
              <MessageSquare size={20} className="mx-auto text-stone-300 mb-2" />
              No coaching opportunities recorded yet.
            </div>
          )}
          {openCoaching.length > 0 && (
            <div className="divide-y divide-stone-100">
              {openCoaching.map(c => (
                <div key={c.id} className="px-5 py-4 group hover:bg-stone-50 transition">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[10px] uppercase tracking-wider font-medium">Open</span>
                        <span className="text-xs text-stone-500">{formatDate(c.dateOpened)}</span>
                      </div>
                      <div className="font-medium text-stone-900 text-sm">{c.title}</div>
                      {c.notes && <div className="text-xs text-stone-600 mt-1.5 whitespace-pre-wrap leading-relaxed">{c.notes}</div>}
                    </div>
                    <div className="flex flex-shrink-0 gap-1">
                      <button onClick={() => onCloseCoaching(c.id)}
                        title="Mark closed"
                        className="p-2 hover:bg-emerald-50 active:bg-emerald-100 rounded-full transition text-stone-400 hover:text-emerald-700">
                        <CheckCircle2 size={14} />
                      </button>
                      <button onClick={() => onDeleteCoaching(c.id, c.title)}
                        title="Delete"
                        className="p-2 hover:bg-rose-50 active:bg-rose-100 rounded-full transition text-stone-400 hover:text-rose-700">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {closedCoaching.length > 0 && (
            <details className={openCoaching.length > 0 ? 'border-t border-stone-100' : ''}>
              <summary className="px-5 py-3 cursor-pointer text-xs uppercase tracking-wider text-stone-500 hover:bg-stone-50 transition select-none">
                Closed ({closedCoaching.length})
              </summary>
              <div className="divide-y divide-stone-100 bg-stone-50/40">
                {closedCoaching.map(c => (
                  <div key={c.id} className="px-5 py-4 group">
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 text-[10px] uppercase tracking-wider font-medium">Closed</span>
                          <span className="text-xs text-stone-500">{formatDate(c.dateOpened)} → {formatDate(c.dateClosed ?? '')}</span>
                        </div>
                        <div className="font-medium text-stone-700 text-sm">{c.title}</div>
                        {c.notes && <div className="text-xs text-stone-500 mt-1.5 whitespace-pre-wrap leading-relaxed">{c.notes}</div>}
                      </div>
                      <div className="flex flex-shrink-0 gap-1">
                        <button onClick={() => onReopenCoaching(c.id)}
                          title="Reopen"
                          className="p-2 hover:bg-stone-100 active:bg-stone-200 rounded-full transition text-stone-400 hover:text-stone-700">
                          <RotateCcw size={14} />
                        </button>
                        <button onClick={() => onDeleteCoaching(c.id, c.title)}
                          title="Delete"
                          className="p-2 hover:bg-rose-50 active:bg-rose-100 rounded-full transition text-stone-400 hover:text-rose-700">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </details>
          )}
        </div>
      </div>

      {/* Skill summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8 md:mb-10">
        {[4, 3, 2, 1].map(level => {
          const meta = ratingMeta[level];
          const pct = total > 0 ? (counts[level] / total) * 100 : 0;
          return (
            <div key={level} className="bg-white border border-stone-200 rounded-2xl p-4 md:p-5">
              <div className="flex items-center justify-between mb-2 md:mb-3">
                <span className="text-[10px] md:text-xs uppercase tracking-wider font-medium" style={{ color: meta.color }}>{meta.label}</span>
                <span className="font-serif text-2xl md:text-3xl text-stone-900">{counts[level]}</span>
              </div>
              <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
                <div className="h-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: meta.color }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Tracked skills */}
      <div className="mb-8 md:mb-10">
        <h2 className="text-xs uppercase tracking-[0.2em] text-stone-500 font-medium mb-4">Tracked Skills · {empRatings.length}</h2>
        <div className="bg-white border border-stone-200 rounded-2xl divide-y divide-stone-100 overflow-hidden">
          {empRatings.map(r => (
            <div key={r.id} className="px-4 md:px-6 py-4 hover:bg-stone-50 transition">
              <div className="flex items-start md:items-center gap-3 md:gap-4">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-stone-900 text-sm leading-tight">{r.skill}</div>
                  <div className="text-xs text-stone-500 mt-1 flex items-center flex-wrap gap-x-3 gap-y-0.5">
                    <span className="inline-flex items-center gap-1"><Calendar size={11} /> {r.dateAssessed}</span>
                    <span className="hidden sm:inline">by {r.assessedBy}</span>
                  </div>
                  <div className="md:hidden mt-2 flex items-center gap-2">
                    <RatingDots value={r.rating} size="md" />
                    <RatingBadge value={r.rating} />
                  </div>
                </div>
                <div className="hidden md:flex items-center gap-4">
                  <RatingDots value={r.rating} size="md" />
                  <div className="w-32 text-right">
                    <RatingBadge value={r.rating} />
                  </div>
                </div>
                <select value={r.rating}
                  onChange={(e) => onUpdateRating(r.id, parseInt(e.target.value) as 1 | 2 | 3 | 4)}
                  className="text-xs border border-stone-200 rounded-full px-3 py-2 bg-white hover:border-stone-400 cursor-pointer flex-shrink-0 ml-2 min-w-[5rem]"
                  aria-label="Change rating">
                  <option value={1}>1 — In-Training</option>
                  <option value={2}>2 — Trained</option>
                  <option value={3}>3 — Experienced</option>
                  <option value={4}>4 — Expert</option>
                </select>
              </div>
            </div>
          ))}
          {empRatings.length === 0 && (
            <div className="px-4 md:px-6 py-12 text-center text-sm text-stone-500">No skills recorded yet</div>
          )}
        </div>
      </div>

      {untracked.length > 0 && (
        <div>
          <h2 className="text-xs uppercase tracking-[0.2em] text-stone-500 font-medium mb-4">Skills Not Yet Tracked · {untracked.length}</h2>
          <div className="bg-amber-50/40 border border-amber-200/60 rounded-2xl p-4 md:p-5">
            <div className="flex flex-wrap gap-2">
              {untracked.map(s => (
                <button key={s} onClick={() => onAddSkill(employee, s)}
                  className="inline-flex items-center gap-1.5 bg-white border border-amber-200 text-amber-900 text-xs px-3 py-2 rounded-full hover:border-amber-400 active:bg-amber-50 transition">
                  <Plus size={11} strokeWidth={2.5} /> {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
