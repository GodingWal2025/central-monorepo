import { useState, useEffect } from "react";
import { X, FileText } from "lucide-react";
import { Field } from "./UI";
import type { Employee } from "../types";

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (data: { title: string; employeeId: number; notes: string }) => void;
  employee: Employee;
}

export const CoachingFormModal = ({ open, onClose, onSave, employee }: Props) => {
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (open) {
      setTitle('');
      setNotes('');
    }
  }, [open]);

  if (!open) return null;
  const canSave = title.trim().length > 0;

  const handleSave = () => {
    if (!canSave) return;
    onSave({ title: title.trim(), employeeId: employee.id, notes: notes.trim() });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center md:p-4 bg-stone-900/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white rounded-t-3xl md:rounded-3xl w-full md:max-w-lg shadow-2xl max-h-[92vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}>
        <div className="px-5 md:px-7 py-5 md:py-6 border-b border-stone-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="min-w-0">
            <p className="text-[10px] md:text-xs uppercase tracking-[0.2em] text-stone-500 font-medium mb-1">
              Coaching · {employee.fullName}
            </p>
            <h2 className="text-xl md:text-2xl font-serif text-stone-900 truncate">Open Opportunity</h2>
          </div>
          <button onClick={onClose}
            className="p-2.5 hover:bg-stone-100 active:bg-stone-200 rounded-full transition flex-shrink-0"
            aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="px-5 md:px-7 py-5 md:py-6 space-y-5">
          <Field label="Topic" required hint="Brief description of the coaching focus">
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Improve attendance, Safety reminder, Sortation accuracy"
              autoFocus
              className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-stone-900 focus:bg-white transition" />
          </Field>

          <Field label="Notes" hint="Context, action items, dates of follow-up, etc.">
            <div className="relative">
              <FileText size={14} className="absolute left-4 top-3 text-stone-400 pointer-events-none" />
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="What was discussed and what's expected next?"
                rows={5}
                className="w-full pl-11 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-stone-900 focus:bg-white transition resize-none" />
            </div>
          </Field>
        </div>

        <div className="px-5 md:px-7 py-4 md:py-5 bg-stone-50 rounded-b-3xl flex flex-col-reverse md:flex-row md:items-center md:justify-end gap-2 sticky bottom-0">
          <button onClick={onClose}
            className="px-5 py-3 text-sm font-medium text-stone-700 hover:bg-stone-100 active:bg-stone-200 rounded-full transition">
            Cancel
          </button>
          <button onClick={handleSave} disabled={!canSave}
            className="px-5 py-3 text-sm font-medium text-white bg-stone-900 hover:bg-stone-800 active:bg-stone-700 rounded-full transition disabled:opacity-40 disabled:cursor-not-allowed shadow-sm">
            Open opportunity
          </button>
        </div>
      </div>
    </div>
  );
};
