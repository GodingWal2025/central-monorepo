import { useState } from "react";
import { ChevronLeft, MessageSquare } from "lucide-react";
import { Field, SectionHead } from "../components/UI";
import type { Employee } from "../types";
import { ratingMeta } from "../types";

interface Props {
  employees: Employee[];
  skillsByRole: Record<string, string[]>;
  onSave: (data: { employeeId: number; skill: string; rating: 1 | 2 | 3 | 4; notes: string }) => void;
  onCancel: () => void;
  defaultEmployee?: Employee;
  defaultSkill?: string;
}

export const RecordAssessmentPage = ({ employees, skillsByRole, onSave, onCancel, defaultEmployee, defaultSkill }: Props) => {
  const [empId, setEmpId] = useState<string>(defaultEmployee?.id?.toString() || '');
  const [skill, setSkill] = useState(defaultSkill || '');
  const [rating, setRating] = useState<1 | 2 | 3 | 4>(2);
  const [notes, setNotes] = useState('');

  const selectedEmp = employees.find(e => e.id === parseInt(empId));
  const availableSkills = selectedEmp ? skillsByRole[selectedEmp.jobRole] || [] : [];
  const canSave = empId && skill;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 md:px-10 py-6 md:py-10">
      <button onClick={onCancel}
        className="inline-flex items-center gap-2 text-sm text-stone-500 hover:text-stone-900 mb-6 md:mb-8 transition py-2 -ml-2 px-2 rounded-full">
        <ChevronLeft size={16} /> Back
      </button>

      <SectionHead eyebrow="New Entry" title="Record an Assessment" />

      <div className="bg-white border border-stone-200 rounded-2xl p-5 md:p-8 space-y-6 md:space-y-7">
        <Field label="Team member" required>
          <select value={empId} onChange={e => { setEmpId(e.target.value); setSkill(''); }}
            className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-stone-900 focus:bg-white transition">
            <option value="">Select an employee...</option>
            {employees.filter(e => e.active).map(e => (
              <option key={e.id} value={e.id}>{e.fullName} — {e.jobRole}</option>
            ))}
          </select>
        </Field>

        <Field label="Skill" required hint={selectedEmp ? `Filtered to ${selectedEmp.jobRole} skills` : null}>
          <select value={skill} onChange={e => setSkill(e.target.value)} disabled={!empId}
            className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-stone-900 focus:bg-white transition disabled:opacity-50">
            <option value="">{empId ? 'Select a skill...' : 'Choose an employee first'}</option>
            {availableSkills.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </Field>

        <Field label="Competency level" required>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
            {([1, 2, 3, 4] as const).map(n => {
              const meta = ratingMeta[n];
              const active = rating === n;
              return (
                <button key={n} onClick={() => setRating(n)} type="button"
                  className={`px-3 md:px-4 py-3 md:py-4 rounded-xl text-left transition border-2 ${active ? 'border-stone-900 bg-white' : 'border-stone-200 bg-stone-50 hover:border-stone-300 active:bg-stone-100'}`}>
                  <div className="font-serif text-2xl md:text-3xl mb-1" style={{ color: active ? meta.color : '#A8A29E' }}>{n}</div>
                  <div className="text-xs font-medium text-stone-900">{meta.label}</div>
                  <div className="text-[10px] text-stone-500 mt-0.5">{meta.desc}</div>
                </button>
              );
            })}
          </div>
        </Field>

        <Field label="Notes" optional>
          <div className="relative">
            <MessageSquare size={14} className="absolute left-3.5 top-3.5 text-stone-400" />
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
              placeholder="Anything to add about this assessment..."
              className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-stone-900 focus:bg-white transition resize-none" />
          </div>
        </Field>

        <div className="flex flex-col-reverse md:flex-row md:items-center md:justify-end gap-2 pt-4 border-t border-stone-100">
          <button onClick={onCancel}
            className="px-5 py-3 text-sm font-medium text-stone-700 hover:bg-stone-100 active:bg-stone-200 rounded-full transition">
            Cancel
          </button>
          <button onClick={() => onSave({ employeeId: parseInt(empId), skill, rating, notes })} disabled={!canSave}
            className="px-5 py-3 text-sm font-medium text-white bg-stone-900 hover:bg-stone-800 active:bg-stone-700 rounded-full transition disabled:opacity-40 disabled:cursor-not-allowed shadow-sm">
            Save Assessment
          </button>
        </div>
      </div>
    </div>
  );
};
