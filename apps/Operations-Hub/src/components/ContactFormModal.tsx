import { useState, useEffect } from "react";
import { X, Mail, Phone, Building2 } from "lucide-react";
import { Field } from "./UI";
import type { Contact } from "../types";

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (data: Omit<Contact, 'id'>, editingId?: number) => void;
  contact: Contact | null;
}

const CATEGORIES = ['Vendor', 'Bayer', 'Emergency', 'Other'];

interface FormState {
  fullName: string;
  company: string;
  role: string;
  phone: string;
  email: string;
  category: string;
}

const empty = (): FormState => ({
  fullName: '',
  company: '',
  role: '',
  phone: '',
  email: '',
  category: '',
});

export const ContactFormModal = ({ open, onClose, onSave, contact }: Props) => {
  const isEdit = !!contact;
  const [form, setForm] = useState<FormState>(empty());

  useEffect(() => {
    if (contact) {
      setForm({
        fullName: contact.fullName,
        company: contact.company,
        role: contact.role,
        phone: contact.phone,
        email: contact.email,
        category: contact.category,
      });
    } else {
      setForm(empty());
    }
  }, [contact, open]);

  if (!open) return null;
  const canSave = form.fullName.trim().length > 0;

  const handleSave = () => {
    if (!canSave) return;
    onSave({ ...form, fullName: form.fullName.trim() }, contact?.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center md:p-4 bg-stone-900/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white rounded-t-3xl md:rounded-3xl w-full md:max-w-xl shadow-2xl max-h-[92vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}>
        <div className="px-5 md:px-7 py-5 md:py-6 border-b border-stone-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="min-w-0">
            <p className="text-[10px] md:text-xs uppercase tracking-[0.2em] text-stone-500 font-medium mb-1">
              {isEdit ? 'Edit Record' : 'New Record'}
            </p>
            <h2 className="text-xl md:text-2xl font-serif text-stone-900 truncate">
              {isEdit ? form.fullName.trim() || 'Edit Contact' : 'Add Contact'}
            </h2>
          </div>
          <button onClick={onClose}
            className="p-2.5 hover:bg-stone-100 active:bg-stone-200 rounded-full transition flex-shrink-0"
            aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="px-5 md:px-7 py-5 md:py-6 space-y-5">
          <Field label="Full name" required>
            <input
              value={form.fullName}
              onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
              placeholder="Jane Doe"
              autoFocus
              className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-stone-900 focus:bg-white transition" />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Company">
              <div className="relative">
                <Building2 size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  value={form.company}
                  onChange={e => setForm(f => ({ ...f, company: e.target.value }))}
                  placeholder="Acme Corp"
                  className="w-full pl-11 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-stone-900 focus:bg-white transition" />
              </div>
            </Field>
            <Field label="Role / title">
              <input
                value={form.role}
                onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                placeholder="Site Manager"
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-stone-900 focus:bg-white transition" />
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Phone">
              <div className="relative">
                <Phone size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  type="tel"
                  placeholder="(555) 123-4567"
                  className="w-full pl-11 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-stone-900 focus:bg-white transition" />
              </div>
            </Field>
            <Field label="Email">
              <div className="relative">
                <Mail size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  type="email"
                  placeholder="contact@company.com"
                  className="w-full pl-11 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-stone-900 focus:bg-white transition" />
              </div>
            </Field>
          </div>

          <Field label="Category">
            <select
              value={form.category}
              onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
              className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-stone-900 focus:bg-white transition">
              <option value="">Select a category...</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
        </div>

        <div className="px-5 md:px-7 py-4 md:py-5 bg-stone-50 rounded-b-3xl flex flex-col-reverse md:flex-row md:items-center md:justify-end gap-2 sticky bottom-0">
          <button onClick={onClose}
            className="px-5 py-3 text-sm font-medium text-stone-700 hover:bg-stone-100 active:bg-stone-200 rounded-full transition">
            Cancel
          </button>
          <button onClick={handleSave} disabled={!canSave}
            className="px-5 py-3 text-sm font-medium text-white bg-stone-900 hover:bg-stone-800 active:bg-stone-700 rounded-full transition disabled:opacity-40 disabled:cursor-not-allowed shadow-sm">
            {isEdit ? 'Save changes' : 'Add contact'}
          </button>
        </div>
      </div>
    </div>
  );
};
