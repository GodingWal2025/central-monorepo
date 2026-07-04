import { useState, useMemo } from "react";
import { Search, Plus, Pencil, Trash2, Mail, Phone, BookUser } from "lucide-react";
import { Pills, SectionHead } from "../components/UI";
import type { Contact } from "../types";

const CATEGORIES = ['All', 'Vendor', 'Bayer', 'Emergency', 'Other'];

const CATEGORY_COLORS: Record<string, string> = {
  Vendor: '#15803D',
  Bayer: '#1D4ED8',
  Emergency: '#B91C1C',
  Other: '#78716C',
};

interface Props {
  contacts: Contact[];
  onAdd: () => void;
  onEdit: (contact: Contact) => void;
  onDelete: (id: number, name: string) => void;
}

export const ContactsPage = ({ contacts, onAdd, onEdit, onDelete }: Props) => {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');

  const filtered = useMemo(() => {
    return contacts.filter(c => {
      if (categoryFilter !== 'All' && c.category !== categoryFilter) return false;
      if (search) {
        const s = search.toLowerCase();
        const haystack = [c.fullName, c.company, c.role, c.email].join(' ').toLowerCase();
        if (!haystack.includes(s)) return false;
      }
      return true;
    }).sort((a, b) => a.fullName.localeCompare(b.fullName));
  }, [contacts, search, categoryFilter]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-10 py-6 md:py-10">
      <SectionHead
        eyebrow={`${contacts.length} ${contacts.length === 1 ? 'contact' : 'contacts'}`}
        title="Contacts"
        subtitle="External contacts: vendors, Bayer staff, emergency contacts, and others outside GXO."
        action={
          <button onClick={onAdd}
            className="inline-flex items-center justify-center gap-2 bg-stone-900 hover:bg-stone-800 active:bg-stone-700 text-white px-5 py-3 rounded-full text-sm font-medium transition shadow-sm w-full md:w-auto">
            <Plus size={16} strokeWidth={2.5} /> Add Contact
          </button>
        }
      />

      <div className="flex flex-col gap-3 mb-6 md:mb-8">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, company, or email..."
            className="w-full pl-11 pr-4 py-3 bg-white border border-stone-200 rounded-full text-sm focus:outline-none focus:border-stone-400 transition" />
        </div>
        <div className="overflow-x-auto pb-1 scrollbar-hide">
          <Pills options={CATEGORIES} value={categoryFilter} onChange={setCategoryFilter} />
        </div>
      </div>

      {contacts.length === 0 ? (
        <div className="bg-white border border-stone-200 rounded-2xl py-16 px-6 text-center">
          <BookUser size={28} className="mx-auto text-stone-300 mb-3" />
          <h3 className="font-serif text-xl text-stone-900 mb-2">No contacts yet</h3>
          <p className="text-sm text-stone-500 mb-5 max-w-sm mx-auto">
            Add the people you work with outside GXO — vendors, Bayer contacts, emergency contacts.
          </p>
          <button onClick={onAdd}
            className="inline-flex items-center gap-2 bg-stone-900 hover:bg-stone-800 active:bg-stone-700 text-white px-5 py-3 rounded-full text-sm font-medium transition shadow-sm">
            <Plus size={16} strokeWidth={2.5} /> Add your first contact
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-sm text-stone-500">No contacts match your filters.</p>
          <button onClick={() => { setSearch(''); setCategoryFilter('All'); }}
            className="mt-3 text-xs font-medium text-stone-900 hover:underline py-2 px-4">
            Clear filters
          </button>
        </div>
      ) : (
        <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden divide-y divide-stone-100">
          {filtered.map(c => (
            <div key={c.id} className="px-4 md:px-6 py-4 hover:bg-stone-50 transition group">
              <div className="flex items-start gap-3 md:gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center flex-wrap gap-2 mb-1">
                    <h3 className="font-medium text-stone-900 text-sm">{c.fullName}</h3>
                    {c.category && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-medium"
                        style={{
                          color: CATEGORY_COLORS[c.category] || '#78716C',
                          backgroundColor: (CATEGORY_COLORS[c.category] || '#78716C') + '15',
                        }}>
                        {c.category}
                      </span>
                    )}
                  </div>
                  {(c.role || c.company) && (
                    <div className="text-xs text-stone-500">
                      {c.role}{c.role && c.company && ' · '}{c.company}
                    </div>
                  )}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-stone-600">
                    {c.phone && (
                      <a href={`tel:${c.phone}`} className="inline-flex items-center gap-1.5 hover:text-stone-900 transition" onClick={e => e.stopPropagation()}>
                        <Phone size={12} className="text-stone-400" />
                        {c.phone}
                      </a>
                    )}
                    {c.email && (
                      <a href={`mailto:${c.email}`} className="inline-flex items-center gap-1.5 hover:text-stone-900 transition truncate" onClick={e => e.stopPropagation()}>
                        <Mail size={12} className="text-stone-400 flex-shrink-0" />
                        <span className="truncate">{c.email}</span>
                      </a>
                    )}
                  </div>
                </div>
                <div className="flex flex-shrink-0 gap-1 md:opacity-0 md:group-hover:opacity-100 transition">
                  <button onClick={() => onEdit(c)}
                    title="Edit"
                    className="p-2.5 text-stone-400 hover:text-stone-900 hover:bg-stone-100 rounded-full transition">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => onDelete(c.id, c.fullName)}
                    title="Delete"
                    className="p-2.5 text-stone-400 hover:text-rose-700 hover:bg-rose-50 rounded-full transition">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
