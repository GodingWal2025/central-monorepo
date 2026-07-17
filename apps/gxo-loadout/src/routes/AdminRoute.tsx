import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getDeviceConfig, setDeviceConfig } from '../lib/deviceConfig';
import { fetchActiveSites } from '../services/sites';
import {
  adminLogout,
  getAdminPassword,
  setAdminPassword,
  isAdminPasswordCustomized,
} from '../services/adminAuth';
import {
  dbListAllInspections,
  dbHardDeleteInspection,
} from '@gxo/semantic';
import type { Site } from '@gxo/semantic';

type Tab = 'loads' | 'security';

export function AdminRoute() {
  const navigate = useNavigate();
  const config = getDeviceConfig();
  const [tab, setTab] = useState<Tab>('loads');

  // Site selector for admins to switch the device's active site.
  // Sites themselves are managed in the Operations Hub app.
  const [activeSites, setActiveSites] = useState<Site[]>([]);
  const [selectedSiteId, setSelectedSiteId] = useState<string>(config?.siteId || '');

  useEffect(() => {
    fetchActiveSites().then(setActiveSites).catch(() => setActiveSites([]));
  }, []);

  const handleSiteChange = (newSiteId: string) => {
    const site = activeSites.find((s) => s.id === newSiteId);
    if (site && config) {
      setSelectedSiteId(newSiteId);
      setDeviceConfig({
        ...config,
        siteId: site.id,
        siteName: site.name,
      });
    }
  };

  const logout = () => {
    adminLogout();
    navigate('/');
  };

  return (
    <main>
      <div className="page-head">
        <div>
          <h1 className="page-head__title">
            Admin <em>console</em>
          </h1>
          <div className="page-head__sub">
            Manager-only{config ? ` · ${config.siteName}` : ' · no site assigned yet'}
          </div>
        </div>
        <div className="page-head__actions" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {config && (
            <div className="field" style={{ marginBottom: 0 }}>
              <select
                value={selectedSiteId}
                onChange={(e) => handleSiteChange(e.target.value)}
                style={{ minHeight: 36, padding: '6px 12px' }}
                title="Switch this device's active site"
              >
                {activeSites.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          )}
          <Link to="/" className="btn btn--ghost">← Back to app</Link>
          <button className="btn btn--danger" onClick={logout}>Log out</button>
        </div>
      </div>

      {!config && (
        <div className="banner banner--warn">
          <span className="banner__icon">⚠</span>
          <div className="banner__body">
            <strong>This device isn't assigned to a site yet.</strong> Create the site in the
            Operations Hub app, then assign this device to it from Device setup.
          </div>
        </div>
      )}

      <div className="admin-tabs">
        <button
          className={`admin-tab ${tab === 'loads' ? 'active' : ''}`}
          onClick={() => setTab('loads')}
        >
          Archived loads
        </button>
        <button
          className={`admin-tab ${tab === 'security' ? 'active' : ''}`}
          onClick={() => setTab('security')}
        >
          Security
        </button>
      </div>

      {tab === 'loads' && <ArchivedLoadsPanel />}
      {tab === 'security' && <SecurityPanel />}
    </main>
  );
}

// ----- Archived loads tab -----

function ArchivedLoadsPanel() {
  const [inspections, setInspections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 25;

  useEffect(() => {
    loadInspections(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const loadInspections = async (p: number) => {
    setLoading(true);
    const all = await dbListAllInspections();
    const archived = all.filter((i: any) => i.archived);
    setTotal(archived.length);
    setInspections(archived.slice((p - 1) * pageSize, p * pageSize));
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Permanently delete this archived load? This cannot be undone.')) return;
    await dbHardDeleteInspection(id);
    // Best-effort backend delete
    try {
      await fetch(`${import.meta.env.VITE_API_URL || ''}/api/inspections/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.error('Failed to delete inspection from backend', err);
    }
    // Reload (step back a page if we just emptied the last one)
    const nextTotal = total - 1;
    const lastPage = Math.max(1, Math.ceil(nextTotal / pageSize));
    const targetPage = Math.min(page, lastPage);
    if (targetPage !== page) setPage(targetPage);
    else loadInspections(page);
  };

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <section className="section">
      <div className="section__head">
        <h2 className="section__title">Archived <em>loads</em></h2>
        <span className="section__meta">{total} archived</span>
      </div>

      <div className="banner banner--info">
        <span className="banner__icon">i</span>
        <div className="banner__body">
          Archived loads are completed inspections that have been closed out. Deleting one removes it
          permanently from this device and the server.
        </div>
      </div>

      {loading ? (
        <div className="soft">Loading archived loads…</div>
      ) : inspections.length === 0 ? (
        <div className="empty">
          <div className="empty__title">No archived loads</div>
          <div className="empty__sub">Archived loads will appear here once inspections are closed out.</div>
        </div>
      ) : (
        <>
          <div className="table-card">
            <table className="data">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th className="right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {inspections.map((i: any) => (
                  <tr key={i.id}>
                    <td className="mono">{i.id.slice(0, 8)}</td>
                    <td>{i.type}</td>
                    <td>{i.status}</td>
                    <td className="right">
                      <button className="btn btn--sm btn--danger" onClick={() => handleDelete(i.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16, marginTop: 16 }}>
              <button className="btn btn--sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>
                ← Previous
              </button>
              <span className="small soft">Page {page} of {totalPages}</span>
              <button className="btn btn--sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}

// ----- Security tab (admin password) -----

function SecurityPanel() {
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const submitPasswordChange = () => {
    if (currentPw !== getAdminPassword()) {
      setMessage({ type: 'error', text: 'Current password is incorrect.' });
      return;
    }
    if (newPw.length < 6) {
      setMessage({ type: 'error', text: 'New password must be at least 6 characters.' });
      return;
    }
    if (newPw !== confirmPw) {
      setMessage({ type: 'error', text: 'New password and confirmation do not match.' });
      return;
    }
    setAdminPassword(newPw);
    setMessage({ type: 'success', text: 'Password updated.' });
    setCurrentPw('');
    setNewPw('');
    setConfirmPw('');
  };

  return (
    <section className="section">
      <div className="section__head">
        <h2 className="section__title">Change <em>admin password</em></h2>
      </div>

      {!isAdminPasswordCustomized() && (
        <div className="banner banner--warn">
          <span className="banner__icon">⚠</span>
          <div className="banner__body">
            <strong>You're still using the default password.</strong> Change it now to keep
            warehouse workers out of the admin area.
          </div>
        </div>
      )}

      <div className="banner banner--info">
        <span className="banner__icon">i</span>
        <div className="banner__body">
          This password is stored on this device and shared across all managers using it.
          For real-world security you'd want individual Microsoft accounts.
        </div>
      </div>

      <div className="field">
        <div className="field__label">Current password</div>
        <input
          type="password"
          value={currentPw}
          onChange={(e) => setCurrentPw(e.target.value)}
          placeholder="••••••••"
        />
      </div>
      <div className="field">
        <div className="field__label">New password</div>
        <input
          type="password"
          value={newPw}
          onChange={(e) => setNewPw(e.target.value)}
          placeholder="At least 6 characters"
        />
      </div>
      <div className="field">
        <div className="field__label">Confirm new password</div>
        <input
          type="password"
          value={confirmPw}
          onChange={(e) => setConfirmPw(e.target.value)}
          placeholder="Repeat new password"
        />
      </div>

      {message && (
        <div className={`banner banner--${message.type === 'success' ? 'success' : 'danger'}`}>
          <span className="banner__icon">{message.type === 'success' ? '✓' : '⚠'}</span>
          <div className="banner__body">{message.text}</div>
        </div>
      )}

      <button
        className="btn btn--accent btn--lg"
        onClick={submitPasswordChange}
        disabled={!currentPw || !newPw || !confirmPw}
      >
        Update password
      </button>
    </section>
  );
}
