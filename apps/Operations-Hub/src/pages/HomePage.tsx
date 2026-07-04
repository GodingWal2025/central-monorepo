import { useMemo } from "react";
import type { LucideIcon } from "lucide-react";
import { Users, Plus, BookOpen, ArrowUpRight } from "lucide-react";
import { SectionHead } from "../components/UI";
import type { Employee, Navigation } from "../types";

interface Props {
  employees: Employee[];
  onNavigate: (v: Navigation) => void;
  onAdd: () => void;
}

export const HomePage = ({ employees, onNavigate, onAdd }: Props) => {
  const stats = useMemo(() => ({
    total: employees.length,
    active: employees.filter(e => e.active).length,
    firstShift: employees.filter(e => e.shift === '1st' && e.active).length,
    secondShift: employees.filter(e => e.shift === '2nd' && e.active).length,
  }), [employees]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-10 py-6 md:py-12">
      <SectionHead
        eyebrow="Bayer · Albert Lea"
        title="Operations Hub"
        subtitle="A directory of your team and Equipment. The source of truth for every other employee management activity."
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8 md:mb-12">
        <StatCard label="Total" value={stats.total} hint="On the roster" />
        <StatCard label="Active" value={stats.active} hint="Currently working" accent="emerald" />
        <StatCard label="1st Shift" value={stats.firstShift} hint="Day shift" />
        <StatCard label="2nd Shift" value={stats.secondShift} hint="Night shift" />
      </div>

      <div className="mb-3 md:mb-4">
        <h2 className="text-xs uppercase tracking-[0.2em] text-stone-500 font-medium">Get Started</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
        <ActionCard icon={Users} eyebrow="People" title="View Team Roster"
          desc="Browse, search, and edit your team members."
          onClick={() => onNavigate({ name: 'roster' })} />
        <ActionCard icon={Plus} eyebrow="Add" title="New Employee"
          desc="Add a new hire to the system." onClick={onAdd} accent="dark" />
        <ActionCard icon={BookOpen} eyebrow="Skills" title="Skills Library"
          desc="Browse competencies by role and see who's qualified."
          onClick={() => onNavigate({ name: 'library' })} />
      </div>
    </div>
  );
};

const StatCard = ({ label, value, hint, accent }: { label: string; value: number; hint: string; accent?: 'emerald' }) => {
  const valueColor = accent === 'emerald' ? 'text-emerald-700' : 'text-stone-900';
  return (
    <div className="bg-white border border-stone-200 rounded-2xl p-4 md:p-6">
      <div className="text-[10px] md:text-xs uppercase tracking-wider text-stone-500 font-medium mb-2 md:mb-3">{label}</div>
      <div className={`font-serif text-3xl md:text-5xl ${valueColor} leading-none mb-1 md:mb-2`}>{value}</div>
      <div className="text-[10px] md:text-xs text-stone-500">{hint}</div>
    </div>
  );
};

const ActionCard = ({
  icon: Icon, eyebrow, title, desc, onClick, accent
}: {
  icon: LucideIcon; eyebrow: string; title: string; desc: string;
  onClick: () => void; accent?: 'dark';
}) => {
  const isDark = accent === 'dark';
  return (
    <button onClick={onClick}
      className={`group text-left rounded-2xl p-5 md:p-7 border transition-all min-h-[44px] ${isDark
          ? 'bg-stone-900 text-white border-stone-900 hover:bg-stone-800 active:bg-stone-700'
          : 'bg-white border-stone-200 hover:border-stone-900 hover:shadow-lg active:bg-stone-50'}`}>
      <div className="flex items-start justify-between mb-5 md:mb-8">
        <div className={`p-2.5 rounded-xl ${isDark ? 'bg-stone-800' : 'bg-stone-100'}`}>
          <Icon size={18} className={isDark ? 'text-white' : 'text-stone-700'} />
        </div>
        <ArrowUpRight size={18} className={`${isDark ? 'text-stone-400 group-hover:text-white' : 'text-stone-300 group-hover:text-stone-900'} transition`} />
      </div>
      <p className={`text-[10px] uppercase tracking-[0.2em] font-medium mb-2 ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>{eyebrow}</p>
      <h3 className={`font-serif text-xl md:text-2xl mb-2 ${isDark ? 'text-white' : 'text-stone-900'}`}>{title}</h3>
      <p className={`text-sm ${isDark ? 'text-stone-400' : 'text-stone-600'}`}>{desc}</p>
    </button>
  );
};
