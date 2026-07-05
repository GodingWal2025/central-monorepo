import { useState, useEffect } from 'react';
import { ontologyClient } from '@gxo/semantic';

// ─── Types ────────────────────────────────────────────────────────
interface Equipment {
  id: number;
  name: string;
  type: string;
  status: string;
  serialNumber: string;
  lastInspected?: string;
  assignedToId?: number;
  notes?: string;
}

type StatusFilter = 'All' | 'Available' | 'In Use' | 'Under Maintenance' | 'Out of Service';
type TypeFilter = 'All' | 'Forklift' | 'Reach Truck' | 'Pallet Jack' | 'RF Scanner' | 'Printer' | 'Other';

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  'Available':        { bg: '#F0FDF4', color: '#15803D' },
  'In Use':           { bg: '#EFF6FF', color: '#1D4ED8' },
  'Under Maintenance':{ bg: '#FFFBEB', color: '#B45309' },
  'Out of Service':   { bg: '#FEF2F2', color: '#B91C1C' },
};

// ─── Components ───────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const style = STATUS_COLORS[status] || { bg: '#F5F5F4', color: '#78716C' };
  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 10px',
      borderRadius: 999,
      fontSize: 11,
      fontWeight: 600,
      background: style.bg,
      color: style.color,
      letterSpacing: '0.02em',
    }}>
      {status}
    </span>
  );
}

// ─── Main App ─────────────────────────────────────────────────────
export default function App() {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('All');

  useEffect(() => {
    ontologyClient.getEquipments()
      .then(objs => setEquipment(objs.map(o => ({ id: o.id, ...o.properties }))))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = equipment.filter(e => {
    const matchesSearch = search.trim() === '' ||
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.serialNumber.toLowerCase().includes(search.toLowerCase()) ||
      e.type.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'All' || e.status === statusFilter;
    const matchesType = typeFilter === 'All' || e.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  // Stat cards
  const stats = {
    total: equipment.length,
    available: equipment.filter(e => e.status === 'Available').length,
    inUse: equipment.filter(e => e.status === 'In Use').length,
    maintenance: equipment.filter(e => e.status === 'Under Maintenance').length,
    outOfService: equipment.filter(e => e.status === 'Out of Service').length,
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'Arial Black, sans-serif', fontSize: 28, fontWeight: 900, color: '#FF4713', marginBottom: 4 }}>GXO</div>
          <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.25em', color: 'var(--text-muted)', marginBottom: 24 }}>Inventory</div>
          <div style={{ width: 32, height: 32, border: '2px solid #E7E3DC', borderTopColor: '#1C1917', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: 16 }}>
        <div style={{ textAlign: 'center', maxWidth: 400 }}>
          <h2 style={{ fontSize: 20, marginBottom: 8 }}>Couldn't load inventory</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 16 }}>{error}</p>
          <button onClick={() => window.location.reload()}
            style={{ padding: '10px 24px', background: '#1C1917', color: '#fff', border: 'none', borderRadius: 999, fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Header */}
      <header style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
        <svg viewBox="0 0 300 110" style={{ height: 28, width: 'auto' }} xmlns="http://www.w3.org/2000/svg">
          <text x="0" y="85" fontFamily="Arial Black, Arial, sans-serif" fontSize="100" fontWeight="900" fill="#FF4713" letterSpacing="-2">GXO</text>
        </svg>
        <div style={{ borderLeft: '1px solid var(--border)', paddingLeft: 16 }}>
          <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>Inventory</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Bayer · Albert Lea</div>
        </div>
      </header>

      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>
        {/* Page heading */}
        <div style={{ marginBottom: 24 }}>
          <p style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--text-muted)', fontWeight: 600, marginBottom: 4 }}>Assets</p>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)' }}>Equipment Inventory</h1>
        </div>

        {/* Stat Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 24 }}>
          {[
            { label: 'Total', value: stats.total, color: 'var(--text-primary)' },
            { label: 'Available', value: stats.available, color: '#15803D' },
            { label: 'In Use', value: stats.inUse, color: '#1D4ED8' },
            { label: 'Maintenance', value: stats.maintenance, color: '#B45309' },
            { label: 'Out of Service', value: stats.outOfService, color: '#B91C1C' },
          ].map(s => (
            <div key={s.label} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '16px 20px', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ fontSize: 26, fontWeight: 700, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Search by name, serial, type..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex: '1 1 220px', padding: '9px 14px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', fontSize: 14, outline: 'none', background: 'var(--surface)' }}
          />
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as StatusFilter)}
            style={{ padding: '9px 14px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', fontSize: 14, background: 'var(--surface)', color: 'var(--text-primary)' }}>
            {(['All', 'Available', 'In Use', 'Under Maintenance', 'Out of Service'] as StatusFilter[]).map(s => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value as TypeFilter)}
            style={{ padding: '9px 14px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', fontSize: 14, background: 'var(--surface)', color: 'var(--text-primary)' }}>
            {(['All', 'Forklift', 'Reach Truck', 'Pallet Jack', 'RF Scanner', 'Printer', 'Other'] as TypeFilter[]).map(t => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </div>

        {/* Results count */}
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>
          {filtered.length} of {equipment.length} items
        </p>

        {/* Equipment Table */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
          {filtered.length === 0 ? (
            <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--text-muted)' }}>
              No equipment matches your filters.
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#F5F3F0' }}>
                  {['Name', 'Type', 'Serial #', 'Status', 'Last Inspected'].map(h => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((eq, i) => (
                  <tr key={eq.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : undefined, transition: 'background 0.1s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#FAF7F2')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontWeight: 500, fontSize: 14 }}>{eq.name}</span>
                      {eq.notes && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{eq.notes}</div>}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--text-secondary)' }}>{eq.type}</td>
                    <td style={{ padding: '12px 16px', fontSize: 13, fontFamily: 'monospace', color: 'var(--text-secondary)' }}>{eq.serialNumber}</td>
                    <td style={{ padding: '12px 16px' }}><StatusBadge status={eq.status} /></td>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--text-muted)' }}>
                      {eq.lastInspected ? new Date(eq.lastInspected).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}
