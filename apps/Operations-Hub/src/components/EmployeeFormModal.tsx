import { useState, useEffect } from "react";
import { X, Mail, Calendar, Phone, IdCard, Cake, Shirt, FileText } from "lucide-react";
import { Field } from "./UI";
import type { Employee } from "../types";
import { isPitRole } from "../types";

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (data: Omit<Employee, 'id'>, editingId?: number) => void;
  employee: Employee | null;
  jobRoles: string[];
}

interface FormState {
  firstName: string;
  lastName: string;
  email: string;
  shift: string;
  jobRole: string;
  hireDate: string;
  active: boolean;
  shirtSize?: string;
  birthday?: string;
  cwr?: boolean;
  phoneNumber?: string;
  cwid?: string;
  notes?: string;
}

const SHIRT_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];

const emptyForm = (): FormState => ({
  firstName: '',
  lastName: '',
  email: '',
  shift: '1st',
  jobRole: '',
  hireDate: new Date().toISOString().split('T')[0],
  active: true,
  shirtSize: '',
  birthday: '',
  cwr: false,
  phoneNumber: '',
  cwid: '',
  notes: '',
});

export const EmployeeFormModal = ({ open, onClose, onSave, employee, jobRoles }: Props) => {
  const isEdit = !!employee;
  const [form, setForm] = useState<FormState>(emptyForm());

  useEffect(() => {
    if (employee) {
      setForm({
        firstName: employee.firstName,
        lastName: employee.lastName,
        email: employee.email,
        shift: employee.shift,
        jobRole: employee.jobRole,
        hireDate: employee.hireDate,
        active: employee.active,
        shirtSize: employee.shirtSize,
        birthday: employee.birthday ? employee.birthday.split('T')[0] : '',
        cwr: employee.cwr,
        phoneNumber: employee.phoneNumber,
        cwid: employee.cwid,
        notes: employee.notes,
      });
    } else {
      setForm(emptyForm());
    }
  }, [employee, open]);

  if (!open) return null;
  const canSave = form.firstName.trim() && form.lastName.trim();
  const showCwid = !isPitRole(form.jobRole);

  const handleSave = () => {
    if (!canSave) return;
    const fullName = `${form.firstName.trim()} ${form.lastName.trim()}`;
    onSave(
      {
        ...form,
        fullName,
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        cwid: showCwid ? (form.cwid ?? '') : '', // clear CWID if PIT
        photoUrl: employee?.photoUrl ?? '', // preserve existing photo on edit
        shift: form.shift as '1st' | '2nd',
        jobRole: form.jobRole as Employee['jobRole'],
      },
      employee?.id
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center md:p-4 bg-stone-900/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white rounded-t-3xl md:rounded-3xl w-full md:max-w-2xl shadow-2xl max-h-[92vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}>
        <div className="px-5 md:px-7 py-5 md:py-6 border-b border-stone-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="min-w-0">
            <p className="text-[10px] md:text-xs uppercase tracking-[0.2em] text-stone-500 font-medium mb-1">
              {isEdit ? 'Edit Record' : 'New Record'}
            </p>
            <h2 className="text-xl md:text-2xl font-serif text-stone-900 truncate">
              {isEdit ? `${form.firstName} ${form.lastName}`.trim() : 'Add Team Member'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 hover:bg-stone-100 active:bg-stone-200 rounded-full transition flex-shrink-0"
            aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="px-5 md:px-7 py-5 md:py-6 space-y-5">
          {/* Identity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="First name" required>
              <input
                value={form.firstName}
                onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))}
                placeholder="Jane"
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-stone-900 focus:bg-white transition" />
            </Field>
            <Field label="Last name" required>
              <input
                value={form.lastName}
                onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))}
                placeholder="Doe"
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-stone-900 focus:bg-white transition" />
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Email">
              <div className="relative">
                <Mail size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  type="email"
                  placeholder="jdoe@gxo.com"
                  className="w-full pl-11 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-stone-900 focus:bg-white transition" />
              </div>
            </Field>
            <Field label="Phone">
              <div className="relative">
                <Phone size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  value={form.phoneNumber}
                  onChange={e => setForm(f => ({ ...f, phoneNumber: e.target.value }))}
                  type="tel"
                  placeholder="(555) 123-4567"
                  className="w-full pl-11 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-stone-900 focus:bg-white transition" />
              </div>
            </Field>
          </div>

          {/* Role and shift */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Job role">
              <select
                value={form.jobRole}
                onChange={e => setForm(f => ({ ...f, jobRole: e.target.value }))}
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-stone-900 focus:bg-white transition">
                <option value="">Select a role...</option>
                {jobRoles.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </Field>
            <Field label="Shift">
              <div className="flex gap-2">
                {(['1st', '2nd'] as const).map(s => (
                  <button
                    key={s}
                    onClick={() => setForm(f => ({ ...f, shift: s }))}
                    type="button"
                    className={`flex-1 py-3 rounded-xl text-sm font-medium transition border-2 ${form.shift === s ? 'border-stone-900 bg-stone-900 text-white' : 'border-stone-200 bg-stone-50 text-stone-600'}`}>
                    {s} Shift
                  </button>
                ))}
              </div>
            </Field>
          </div>

          {/* CWID (only for non-PIT) and CWR */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {showCwid && (
              <Field label="CWID" hint="Required for non-PIT roles">
                <div className="relative">
                  <IdCard size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    value={form.cwid}
                    onChange={e => setForm(f => ({ ...f, cwid: e.target.value }))}
                    placeholder="CWID..."
                    className="w-full pl-11 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-stone-900 focus:bg-white transition" />
                </div>
              </Field>
            )}
            <Field label="CWR" hint="Contingent Worker">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setForm(f => ({ ...f, cwr: false }))}
                  className={`flex-1 py-3 rounded-xl text-sm font-medium transition border-2 ${!form.cwr ? 'border-stone-900 bg-stone-900 text-white' : 'border-stone-200 bg-stone-50 text-stone-600'}`}>
                  No
                </button>
                <button
                  type="button"
                  onClick={() => setForm(f => ({ ...f, cwr: true }))}
                  className={`flex-1 py-3 rounded-xl text-sm font-medium transition border-2 ${form.cwr ? 'border-stone-900 bg-stone-900 text-white' : 'border-stone-200 bg-stone-50 text-stone-600'}`}>
                  Yes
                </button>
              </div>
            </Field>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Hire date">
              <div className="relative">
                <Calendar size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
                <input
                  value={form.hireDate}
                  onChange={e => setForm(f => ({ ...f, hireDate: e.target.value }))}
                  type="date"
                  className="w-full pl-11 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-stone-900 focus:bg-white transition" />
              </div>
            </Field>
            <Field label="Birthday" hint="Optional">
              <div className="relative">
                <Cake size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
                <input
                  value={form.birthday}
                  onChange={e => setForm(f => ({ ...f, birthday: e.target.value }))}
                  type="date"
                  className="w-full pl-11 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-stone-900 focus:bg-white transition" />
              </div>
            </Field>
          </div>

          {/* Shirt size */}
          <Field label="Shirt size">
            <div className="relative">
              <Shirt size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
              <select
                value={form.shirtSize}
                onChange={e => setForm(f => ({ ...f, shirtSize: e.target.value }))}
                className="w-full pl-11 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-stone-900 focus:bg-white transition">
                <option value="">Select size...</option>
                {SHIRT_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </Field>

          {/* Notes */}
          <Field label="Notes" hint="Anything else worth recording about this employee">
            <div className="relative">
              <FileText size={14} className="absolute left-4 top-3 text-stone-400 pointer-events-none" />
              <textarea
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                placeholder="Notes..."
                rows={3}
                className="w-full pl-11 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-stone-900 focus:bg-white transition resize-none" />
            </div>
          </Field>
        </div>

        <div className="px-5 md:px-7 py-4 md:py-5 bg-stone-50 rounded-b-3xl flex flex-col-reverse md:flex-row md:items-center md:justify-end gap-2 sticky bottom-0">
          <button
            onClick={onClose}
            className="px-5 py-3 text-sm font-medium text-stone-700 hover:bg-stone-100 active:bg-stone-200 rounded-full transition">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!canSave}
            className="px-5 py-3 text-sm font-medium text-white bg-stone-900 hover:bg-stone-800 active:bg-stone-700 rounded-full transition disabled:opacity-40 disabled:cursor-not-allowed shadow-sm">
            {isEdit ? 'Save changes' : 'Add employee'}
          </button>
        </div>
      </div>
    </div>
  );
};
