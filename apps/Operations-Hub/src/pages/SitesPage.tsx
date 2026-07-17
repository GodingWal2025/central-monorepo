import { useEffect, useState, useCallback } from 'react';
import { ontologyClient } from '@gxo/semantic';
import type { SiteObject } from '@gxo/semantic';

/**
 * Site management — the single source of truth for facilities across apps.
 * The GXO Loadout app reads this list (via the ontology) to scope devices,
 * inspections, and staging.
 */
export function SitesPage() {
  const [sites, setSites] = useState<SiteObject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [timezone, setTimezone] = useState('America/Chicago');
  const [saving, setSaving] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setSites(await ontologyClient.getSites());
      setError(null);
    } catch (e: any) {
      setError(e.message || 'Failed to load sites');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const add = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await ontologyClient.createSite({ name: name.trim(), address: address.trim() || undefined, timezone });
      setName('');
      setAddress('');
      await refresh();
    } catch (e: any) {
      alert('Failed to add site: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (s: SiteObject) => {
    await ontologyClient.updateSite({ id: s.id, active: !s.properties.active });
    refresh();
  };

  const remove = async (s: SiteObject) => {
    if (!window.confirm(`Delete site "${s.properties.name}"? This cannot be undone.`)) return;
    try {
      await ontologyClient.deleteSite({ id: s.id });
      refresh();
    } catch (e: any) {
      alert('Could not delete this site — it may still have staging lanes or loads attached.');
    }
  };

  const activeCount = sites.filter(s => s.properties.active).length;

  return (
    <div className="p-6 md:p-8">
      <div className="mb-6">
        <p className="text-[10px] uppercase tracking-wider text-stone-500 font-semibold">Directory</p>
        <h1 className="text-2xl md:text-3xl font-serif text-stone-900 tracking-tight">Sites</h1>
        <p className="text-sm text-stone-500 mt-1">
          Facilities are managed here and shared with the GXO Loadout app.
        </p>
      </div>

      {/* Add site */}
      <div className="bg-white border border-stone-200 rounded-2xl p-5 mb-6 max-w-3xl">
        <h2 className="text-sm font-semibold text-stone-700 mb-3">Add a site</h2>
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1">
            <label className="block text-[10px] uppercase tracking-wider text-stone-500 font-semibold mb-1">Site name</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && add()}
              placeholder="e.g. Memphis Distribution Center"
              className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm bg-white"
            />
          </div>
          <div className="flex-1">
            <label className="block text-[10px] uppercase tracking-wider text-stone-500 font-semibold mb-1">Address (optional)</label>
            <input
              value={address}
              onChange={e => setAddress(e.target.value)}
              placeholder="123 Main St, Memphis TN"
              className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm bg-white"
            />
          </div>
          <div className="w-full md:w-48">
            <label className="block text-[10px] uppercase tracking-wider text-stone-500 font-semibold mb-1">Timezone</label>
            <select value={timezone} onChange={e => setTimezone(e.target.value)} className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm bg-white">
              <option value="America/Chicago">Central</option>
              <option value="America/New_York">Eastern</option>
              <option value="America/Denver">Mountain</option>
              <option value="America/Los_Angeles">Pacific</option>
              <option value="UTC">UTC</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={add}
              disabled={!name.trim() || saving}
              className="px-5 py-2 bg-emerald-700 text-white rounded-full text-sm font-medium hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed transition whitespace-nowrap"
            >
              {saving ? 'Adding…' : '+ Add site'}
            </button>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="flex items-center justify-between mb-3 max-w-3xl">
        <h2 className="text-sm font-semibold text-stone-700">All sites</h2>
        <span className="text-xs text-stone-500">{activeCount} active</span>
      </div>

      {error && (
        <div className="max-w-3xl mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">{error}</div>
      )}

      {loading ? (
        <p className="text-sm text-stone-500">Loading sites…</p>
      ) : sites.length === 0 ? (
        <div className="max-w-3xl border border-dashed border-stone-300 rounded-2xl p-8 text-center">
          <p className="text-stone-900 font-medium">No sites yet</p>
          <p className="text-sm text-stone-500 mt-1">Add the first site above.</p>
        </div>
      ) : (
        <div className="max-w-3xl bg-white border border-stone-200 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-stone-50 text-left text-[11px] uppercase tracking-wider text-stone-500">
                <th className="px-4 py-3 font-semibold">Site</th>
                <th className="px-4 py-3 font-semibold">Address</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sites.map(s => (
                <tr key={s.id} className="border-t border-stone-100">
                  <td className="px-4 py-3 font-medium text-stone-900">{s.properties.name}</td>
                  <td className="px-4 py-3 text-stone-500">{s.properties.address || '—'}</td>
                  <td className="px-4 py-3">
                    {s.properties.active ? (
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">Active</span>
                    ) : (
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-stone-100 text-stone-500">Inactive</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => toggleActive(s)} className="px-3 py-1.5 text-xs font-medium border border-stone-300 rounded-full hover:bg-stone-100 transition">
                        {s.properties.active ? 'Deactivate' : 'Reactivate'}
                      </button>
                      <button onClick={() => remove(s)} className="px-3 py-1.5 text-xs font-medium border border-red-300 text-red-600 rounded-full hover:bg-red-50 transition">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
