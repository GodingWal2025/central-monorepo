import { useState, useMemo } from "react";
import { Search, ChevronRight, Plus, Trash2, BookOpen } from "lucide-react";
import { Pills, SectionHead } from "../components/UI";
import type { EmployeeSkill, Navigation, Skill } from "../types";
import { getRoleColor } from "../types";

interface Props {
  ratings: EmployeeSkill[];
  skills: Skill[];
  jobRoles: string[];
  onNavigate: (v: Navigation) => void;
  onAddSkill: () => void;
  onDeleteSkill: (id: number, name: string) => void;
}

export const SkillsLibraryPage = ({
  ratings, skills, jobRoles, onNavigate, onAddSkill, onDeleteSkill
}: Props) => {
  const [roleFilter, setRoleFilter] = useState<string>('All');
  const [search, setSearch] = useState('');

  const skillsWithStats = useMemo(() => {
    return skills.map(s => {
      const skillRatings = ratings.filter(r => r.skill === s.name);
      const expert = skillRatings.filter(r => r.rating === 4).length;
      const total = skillRatings.length;
      const avg = total > 0 ? skillRatings.reduce((sum, r) => sum + r.rating, 0) / total : 0;
      return { ...s, expert, total, avg };
    });
  }, [ratings, skills]);

  const filtered = skillsWithStats.filter(s => {
    if (roleFilter !== 'All' && !s.jobRoles.includes(roleFilter)) return false;
    if (search && !s.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  // Group by primary role (first listed); skills with 1 role appear in their role,
  // skills with multiple roles appear under "Multi-role".
  const grouped = useMemo(() => {
    const g: Record<string, typeof filtered> = {};
    const multi: typeof filtered = [];
    filtered.forEach(s => {
      if (s.jobRoles.length === 0) {
        if (!g['Unassigned']) g['Unassigned'] = [];
        g['Unassigned'].push(s);
      } else if (s.jobRoles.length === 1) {
        const role = s.jobRoles[0];
        if (!g[role]) g[role] = [];
        g[role].push(s);
      } else {
        multi.push(s);
      }
    });
    if (multi.length > 0) g['Multi-role'] = multi;
    return g;
  }, [filtered]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-6 md:py-10">
      <SectionHead
        eyebrow={`${skills.length} ${skills.length === 1 ? 'skill' : 'skills'} in catalog`}
        title="Skills Library"
        subtitle="Browse skills by job role and see who's qualified at each level."
        action={
          <button onClick={onAddSkill}
            className="inline-flex items-center justify-center gap-2 bg-stone-900 hover:bg-stone-800 active:bg-stone-700 text-white px-5 py-3 rounded-full text-sm font-medium transition shadow-sm w-full md:w-auto">
            <Plus size={16} strokeWidth={2.5} /> Add Skill
          </button>
        }
      />

      <div className="flex flex-col gap-3 mb-6 md:mb-8">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search skills..."
            className="w-full pl-11 pr-4 py-3 bg-white border border-stone-200 rounded-full text-sm focus:outline-none focus:border-stone-400 transition" />
        </div>
        <div className="overflow-x-auto pb-1 scrollbar-hide">
          <Pills options={['All', ...jobRoles]} value={roleFilter} onChange={setRoleFilter} />
        </div>
      </div>

      {skills.length === 0 ? (
        <div className="bg-white border border-stone-200 rounded-2xl py-16 px-6 text-center">
          <BookOpen size={28} className="mx-auto text-stone-300 mb-3" />
          <h3 className="font-serif text-xl text-stone-900 mb-2">No skills yet</h3>
          <p className="text-sm text-stone-500 mb-5 max-w-sm mx-auto">
            Get started by adding the first skill to your catalog.
          </p>
          <button onClick={onAddSkill}
            className="inline-flex items-center gap-2 bg-stone-900 hover:bg-stone-800 active:bg-stone-700 text-white px-5 py-3 rounded-full text-sm font-medium transition shadow-sm">
            <Plus size={16} strokeWidth={2.5} /> Add your first skill
          </button>
        </div>
      ) : (
        <div className="space-y-8 md:space-y-10">
          {Object.entries(grouped).map(([role, items]) => (
            <div key={role}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: role === 'Multi-role' ? '#78716C' : getRoleColor(role).hex }} />
                <h2 className="font-serif text-xl md:text-2xl text-stone-900">{role}</h2>
                <span className="text-xs text-stone-500">{items.length} skills</span>
              </div>
              <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden divide-y divide-stone-100">
                {items.map(s => (
                  <div key={s.id}
                    className="group flex items-center gap-2 hover:bg-stone-50 active:bg-stone-100 transition">
                    <button
                      onClick={() => onNavigate({ name: 'skill', skill: s })}
                      className="flex-1 px-4 md:px-6 py-4 flex items-center gap-3 md:gap-4 text-left min-w-0">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-stone-900 text-sm leading-tight">{s.name}</div>
                        <div className="text-xs text-stone-500 mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                          {s.jobRoles.length > 1 && (
                            <span className="inline-flex items-center gap-1">
                              {s.jobRoles.slice(0, 3).join(', ')}
                              {s.jobRoles.length > 3 && <span>+{s.jobRoles.length - 3}</span>}
                            </span>
                          )}
                          {s.jobRoles.length > 1 && <span className="text-stone-300">·</span>}
                          <span>{s.total} {s.total === 1 ? 'person' : 'people'} assessed</span>
                          {s.expert > 0 && <span>· {s.expert} expert{s.expert > 1 ? 's' : ''}</span>}
                        </div>
                      </div>
                      <div className="w-12 md:w-16 text-right flex-shrink-0">
                        <div className="font-serif text-lg md:text-xl text-stone-900">{s.avg > 0 ? s.avg.toFixed(1) : '—'}</div>
                        <div className="text-[10px] text-stone-400 uppercase tracking-wider">avg</div>
                      </div>
                      <ChevronRight size={16} className="text-stone-300 flex-shrink-0" />
                    </button>
                    <button
                      onClick={() => onDeleteSkill(s.id, s.name)}
                      className="p-2.5 mr-2 md:mr-4 text-stone-400 hover:text-rose-700 hover:bg-rose-50 active:bg-rose-100 rounded-full transition flex-shrink-0 md:opacity-0 md:group-hover:opacity-100"
                      aria-label={`Delete ${s.name}`}
                      title="Delete skill">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {Object.keys(grouped).length === 0 && skills.length > 0 && (
            <div className="text-center py-12">
              <p className="text-sm text-stone-500">No skills match your filters.</p>
              <button onClick={() => { setSearch(''); setRoleFilter('All'); }}
                className="mt-3 text-xs font-medium text-stone-900 hover:underline py-2 px-4">
                Clear filters
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
