import { useState } from 'react';
import type { Equipment } from '../types';
import { Package, Wrench, ArrowUpRight, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';

interface InventoryPageProps {
  equipments?: Equipment[];
}

const STATUS_STYLE: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
  'Available':         { bg: 'bg-emerald-50', text: 'text-emerald-700', icon: <CheckCircle2 size={12} /> },
  'In Use':            { bg: 'bg-blue-50',    text: 'text-blue-700',    icon: <Clock size={12} /> },
  'Under Maintenance': { bg: 'bg-amber-50',   text: 'text-amber-700',   icon: <Wrench size={12} /> },
  'Out of Service':    { bg: 'bg-red-50',     text: 'text-red-700',     icon: <AlertTriangle size={12} /> },
};

export function InventoryPage({ equipments = [] }: InventoryPageProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');

  const stats = {
    total:       equipments.length,
    available:   equipments.filter(e => e.status === 'Available').length,
    inUse:       equipments.filter(e => e.status === 'In Use').length,
    maintenance: equipments.filter(e => e.status === 'Under Maintenance' || e.status === 'Out of Service').length,
  };

  const types = ['All', ...Array.from(new Set(equipments.map(e => e.type)))];
  const statuses = ['All', 'Available', 'In Use', 'Under Maintenance', 'Out of Service'];

  const filtered = equipments.filter(e => {
    const q = search.toLowerCase();
    const matchSearch = !q || e.name.toLowerCase().includes(q) || e.serialNumber.toLowerCase().includes(q) || e.type.toLowerCase().includes(q);
    const matchStatus = statusFilter === 'All' || e.status === statusFilter;
    const matchType   = typeFilter === 'All' || e.type === typeFilter;
    return matchSearch && matchStatus && matchType;
  });

  return (
    <div className="p-6 md:p-8">
      {/* Page header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-stone-500 font-semibold">Assets</p>
          <h1 className="text-2xl md:text-3xl font-serif text-stone-900 tracking-tight">Inventory</h1>
        </div>
        <a
          href="http://localhost:5175"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-4 py-2 bg-stone-900 text-white rounded-full text-sm font-medium hover:bg-stone-800 transition"
        >
          <Package size={14} />
          Full Inventory App
          <ArrowUpRight size={13} />
        </a>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total Assets',   value: stats.total,       color: 'text-stone-900' },
          { label: 'Available',      value: stats.available,   color: 'text-emerald-700' },
          { label: 'In Use',         value: stats.inUse,       color: 'text-blue-700' },
          { label: 'Needs Attention',value: stats.maintenance, color: 'text-amber-700' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-stone-200 shadow-sm p-4">
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-stone-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap mb-4">
        <input
          type="text"
          placeholder="Search name, serial, type..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 min-w-[180px] px-3 py-2 border border-stone-300 rounded-lg text-sm bg-white outline-none focus:border-stone-500 transition"
        />
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-stone-300 rounded-lg text-sm bg-white text-stone-700">
          {statuses.map(s => <option key={s}>{s}</option>)}
        </select>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
          className="px-3 py-2 border border-stone-300 rounded-lg text-sm bg-white text-stone-700">
          {types.map(t => <option key={t}>{t}</option>)}
        </select>
      </div>

      <p className="text-xs text-stone-400 mb-3">{filtered.length} of {equipments.length} assets</p>

      {/* Equipment list */}
      {equipments.length === 0 ? (
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-12 text-center">
          <Package size={32} className="text-stone-300 mx-auto mb-3" />
          <p className="text-stone-500 text-sm">No equipment records yet.</p>
          <p className="text-stone-400 text-xs mt-1">Go to <strong>Assets → Equipment</strong> to add your first piece of equipment.</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-10 text-center">
          <p className="text-stone-400 text-sm">No equipment matches your filters.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200">
                {['Name', 'Type', 'Serial #', 'Status', 'Last Inspected'].map(h => (
                  <th key={h} className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-stone-400 whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((eq, i) => {
                const style = STATUS_STYLE[eq.status] || { bg: 'bg-stone-100', text: 'text-stone-600', icon: null };
                return (
                  <tr key={eq.id} className={`${i < filtered.length - 1 ? 'border-b border-stone-100' : ''} hover:bg-stone-50 transition`}>
                    <td className="px-4 py-3">
                      <span className="font-medium text-sm text-stone-900">{eq.name}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-stone-500">{eq.type}</td>
                    <td className="px-4 py-3 text-xs font-mono text-stone-500">{eq.serialNumber}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${style.bg} ${style.text}`}>
                        {style.icon} {eq.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-stone-400">
                      {eq.lastInspected
                        ? new Date(eq.lastInspected).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                        : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
