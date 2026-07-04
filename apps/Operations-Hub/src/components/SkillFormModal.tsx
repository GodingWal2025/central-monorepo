import { useState, useEffect } from "react";
import { X, Check } from "lucide-react";
import { Field } from "./UI";

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (data: { name: string; jobRoles: string[]; process?: string; action?: string }) => void;
  jobRoles: string[];
  defaultRoles?: string[];
}

export const SkillFormModal = ({ open, onClose, onSave, jobRoles, defaultRoles }: Props) => {
  const [name, setName] = useState('');
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [process, setProcess] = useState('');
  const [action, setAction] = useState('');

  useEffect(() => {
    if (open) {
      setName('');
      setSelectedRoles(defaultRoles ?? []);
      setProcess('');
      setAction('');
    }
  }, [open, defaultRoles]);

  if (!open) return null;
  const canSave = name.trim() && selectedRoles.length > 0;

  const toggleRole = (role: string) => {
    setSelectedRoles(prev =>
      prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]
    );
  };

  const selectAll = () => setSelectedRoles([...jobRoles]);
  const clearAll = () => setSelectedRoles([]);

  const handleSave = () => {
    if (!canSave) return;
    onSave({
      name: name.trim(),
      jobRoles: selectedRoles,
      process: process.trim(),
      action: action.trim(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center md:p-4 bg-stone-900/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white rounded-t-3xl md:rounded-3xl w-full md:max-w-lg shadow-2xl max-h-[92vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}>
        <div className="px-5 md:px-7 py-5 md:py-6 border-b border-stone-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="min-w-0">
            <p className="text-[10px] md:text-xs uppercase tracking-[0.2em] text-stone-500 font-medium mb-1">New Record</p>
            <h2 className="text-xl md:text-2xl font-serif text-stone-900 truncate">Add Skill</h2>
          </div>
          <button onClick={onClose}
            className="p-2.5 hover:bg-stone-100 active:bg-stone-200 rounded-full transition flex-shrink-0"
            aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="px-5 md:px-7 py-5 md:py-6 space-y-5">
          <Field label="Skill name" required hint="e.g. Inbound - Verification">
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Enter skill name..."
              autoFocus
              className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-stone-900 focus:bg-white transition" />
          </Field>

          <Field label="Job roles" required hint="Select all roles that perform this skill">
            <div className="flex items-center gap-2 mb-2">
              <button type="button" onClick={selectAll}
                className="text-[10px] uppercase tracking-wider font-medium text-stone-700 hover:text-stone-900 px-3 py-1 rounded-full bg-stone-100 hover:bg-stone-200 transition">
                All positions
              </button>
              {selectedRoles.length > 0 && (
                <button type="button" onClick={clearAll}
                  className="text-[10px] uppercase tracking-wider font-medium text-stone-500 hover:text-stone-900 px-3 py-1 rounded-full hover:bg-stone-100 transition">
                  Clear
                </button>
              )}
              {selectedRoles.length > 0 && (
                <span className="text-xs text-stone-400 ml-auto">{selectedRoles.length} selected</span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {jobRoles.map(r => {
                const selected = selectedRoles.includes(r);
                return (
                  <button key={r} type="button" onClick={() => toggleRole(r)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium border-2 transition text-left ${
                      selected
                        ? 'border-stone-900 bg-stone-900 text-white'
                        : 'border-stone-200 bg-stone-50 text-stone-700 hover:border-stone-400'
                    }`}>
                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                      selected ? 'bg-white border-white' : 'border-stone-300'
                    }`}>
                      {selected && <Check size={12} className="text-stone-900" strokeWidth={3} />}
                    </div>
                    <span className="truncate">{r}</span>
                  </button>
                );
              })}
            </div>
            {jobRoles.length === 0 && (
              <p className="text-xs text-amber-700 mt-2">
                No job roles available yet. Add roles to your JobRoles SharePoint list first.
              </p>
            )}
          </Field>

          <Field label="Process" hint="e.g. Inbound, Outbound, Quality">
            <input
              value={process}
              onChange={e => setProcess(e.target.value)}
              placeholder="e.g. Inbound"
              className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-stone-900 focus:bg-white transition" />
          </Field>

          <Field label="Action / Description" hint="What does this skill involve?">
            <textarea
              value={action}
              onChange={e => setAction(e.target.value)}
              placeholder="Describe the task..."
              rows={4}
              className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-stone-900 focus:bg-white transition resize-none" />
          </Field>
        </div>

        <div className="px-5 md:px-7 py-4 md:py-5 bg-stone-50 rounded-b-3xl flex flex-col-reverse md:flex-row md:items-center md:justify-end gap-2 sticky bottom-0">
          <button onClick={onClose}
            className="px-5 py-3 text-sm font-medium text-stone-700 hover:bg-stone-100 active:bg-stone-200 rounded-full transition">
            Cancel
          </button>
          <button onClick={handleSave} disabled={!canSave}
            className="px-5 py-3 text-sm font-medium text-white bg-stone-900 hover:bg-stone-800 active:bg-stone-700 rounded-full transition disabled:opacity-40 disabled:cursor-not-allowed shadow-sm">
            Add skill
          </button>
        </div>
      </div>
    </div>
  );
};
