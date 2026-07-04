import { useState, useEffect } from 'react';
import { StagingLanesMap } from '@gxo/semantic';

// CONFIG
const CONFIG = {
  apiBase: '/api'
};

export default function App() {
  const [view, setView] = useState<'dashboard' | 'appointments' | 'add-appointment' | 'check-in' | 'check-out' | 'kpi-export' | 'pit-board' | 'admin' | 'staging-map'>('dashboard');
  const [stats, setStats] = useState({ total: 0, checked_in: 0, completed: 0, late: 0, missed: 0, ib_count: 0, ob_count: 0 });
  const [appointments, setAppointments] = useState<any[]>([]);
  const [metadata, setMetadata] = useState<any>({ customers: [], carriers: [], productTypes: [], doors: [], operators: [] });
  const [pitTasks, setPitTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Forms
  const [newAppt, setNewAppt] = useState({ date: '', time: '', type: 'Inbound', carrierId: '', bol: '', customerId: '', productTypeId: '' });
  const [checkInSearch, setCheckInSearch] = useState('');
  const [checkInMatches, setCheckInMatches] = useState<any[]>([]);
  const [selectedCheckIn, setSelectedCheckIn] = useState<any | null>(null);
  const [checkInForm, setCheckInForm] = useState({ doorId: '', operatorId: '' });

  const [checkOutSearch, setCheckOutSearch] = useState('');
  const [checkOutMatches, setCheckOutMatches] = useState<any[]>([]);

  // Fetch metadata on mount
  useEffect(() => {
    fetchMetadata();
  }, []);

  // Fetch stats & data when view changes
  useEffect(() => {
    if (view === 'dashboard') {
      fetchDashboardData();
    } else if (view === 'appointments') {
      fetchAppointments();
    } else if (view === 'pit-board') {
      fetchPitTasks();
    } else if (view === 'kpi-export') {
      fetchCompletedAppointments();
    }
  }, [view]);

  async function fetchMetadata() {
    try {
      const res = await fetch(`${CONFIG.apiBase}/meta-data`);
      if (res.ok) {
        const data = await res.json();
        setMetadata(data);
      }
    } catch (err) {
      console.error('Failed to load metadata', err);
    }
  }

  async function fetchDashboardData() {
    setLoading(true);
    try {
      const statsRes = await fetch(`${CONFIG.apiBase}/appointment-stats`);
      if (statsRes.ok) {
        setStats(await statsRes.json());
      }
      const checkedInRes = await fetch(`${CONFIG.apiBase}/appointments?status=Checked In`);
      if (checkedInRes.ok) {
        const data = await checkedInRes.json();
        setAppointments(data.appointments || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchAppointments() {
    setLoading(true);
    try {
      const res = await fetch(`${CONFIG.apiBase}/appointments`);
      if (res.ok) {
        const data = await res.json();
        setAppointments(data.appointments || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchPitTasks() {
    setLoading(true);
    try {
      const res = await fetch(`${CONFIG.apiBase}/pit/tasks`);
      if (res.ok) {
        const data = await res.json();
        setPitTasks(data.trucks || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchCompletedAppointments() {
    setLoading(true);
    try {
      const res = await fetch(`${CONFIG.apiBase}/appointments?status=Completed`);
      if (res.ok) {
        const data = await res.json();
        setAppointments(data.appointments || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // Action: Add Appointment
  async function handleAddAppointment(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch(`${CONFIG.apiBase}/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: newAppt.date,
          time: newAppt.time,
          type: newAppt.type,
          carrier: metadata.carriers.find((c: any) => c.id === parseInt(newAppt.carrierId))?.name || '',
          bol_shipment_no: newAppt.bol,
          customer: metadata.customers.find((c: any) => c.id === parseInt(newAppt.customerId))?.name || '',
          product_type: metadata.productTypes.find((p: any) => p.id === parseInt(newAppt.productTypeId))?.name || ''
        })
      });
      if (res.ok) {
        alert('Appointment created successfully!');
        setNewAppt({ date: '', time: '', type: 'Inbound', carrierId: '', bol: '', customerId: '', productTypeId: '' });
        setView('appointments');
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to create appointment');
      }
    } catch (err: any) {
      alert(err.message);
    }
  }

  // Action: Search Check-In
  async function handleSearchCheckIn() {
    if (!checkInSearch.trim()) return;
    try {
      const res = await fetch(`${CONFIG.apiBase}/appointments?status=Scheduled`);
      if (res.ok) {
        const data = await res.json();
        const query = checkInSearch.toLowerCase();
        const matches = (data.appointments || []).filter((appt: any) =>
          (appt.bol_shipment_no || '').toLowerCase().includes(query) ||
          (appt.carrier || '').toLowerCase().includes(query) ||
          (appt.customer || '').toLowerCase().includes(query)
        );
        setCheckInMatches(matches);
      }
    } catch (err) {
      console.error(err);
    }
  }

  // Action: Confirm Check-In
  async function handleConfirmCheckIn(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedCheckIn) return;
    try {
      const res = await fetch(`${CONFIG.apiBase}/appointments/check-in`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appt_id: selectedCheckIn.id,
          check_in_time: new Date().toISOString(),
          door_id: parseInt(checkInForm.doorId),
          operator_id: parseInt(checkInForm.operatorId)
        })
      });
      if (res.ok) {
        alert('Driver checked in successfully!');
        setSelectedCheckIn(null);
        setCheckInSearch('');
        setCheckInMatches([]);
        setView('dashboard');
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to check in driver');
      }
    } catch (err: any) {
      alert(err.message);
    }
  }

  // Action: Search Check-Out
  async function handleSearchCheckOut() {
    if (!checkOutSearch.trim()) return;
    try {
      const res = await fetch(`${CONFIG.apiBase}/appointments?status=Checked In`);
      if (res.ok) {
        const data = await res.json();
        const query = checkOutSearch.toLowerCase();
        const matches = (data.appointments || []).filter((appt: any) =>
          (appt.bol_shipment_no || '').toLowerCase().includes(query) ||
          (appt.carrier || '').toLowerCase().includes(query)
        );
        setCheckOutMatches(matches);
      }
    } catch (err) {
      console.error(err);
    }
  }

  // Action: Confirm Check-Out
  async function handleConfirmCheckOut(apptId: number) {
    if (!confirm('Are you sure you want to check out this driver?')) return;
    try {
      const res = await fetch(`${CONFIG.apiBase}/appointments/check-out`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appt_id: apptId,
          check_out_time: new Date().toISOString()
        })
      });
      if (res.ok) {
        alert('Driver checked out successfully!');
        setCheckOutSearch('');
        setCheckOutMatches([]);
        setView('dashboard');
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to check out');
      }
    } catch (err: any) {
      alert(err.message);
    }
  }

  // Action: Start PIT Task
  async function handleStartPitTask(apptId: number, operatorName: string) {
    if (!operatorName.trim()) {
      alert('Please enter operator name');
      return;
    }
    try {
      const res = await fetch(`${CONFIG.apiBase}/pit/tasks/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appt_id: apptId, operator_name: operatorName })
      });
      if (res.ok) {
        fetchPitTasks();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to start task');
      }
    } catch (err: any) {
      alert(err.message);
    }
  }

  // Action: Complete PIT Task
  async function handleCompletePitTask(apptId: number) {
    try {
      const res = await fetch(`${CONFIG.apiBase}/pit/tasks/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appt_id: apptId })
      });
      if (res.ok) {
        fetchPitTasks();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to complete task');
      }
    } catch (err: any) {
      alert(err.message);
    }
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Sidebar Navigation */}
      <aside className="sidebar px-3 py-4" style={{ width: 280, borderRight: '1px solid var(--rule-soft)' }}>
        <div className="sidebar-logo mb-4">
          <span className="sidebar-logo-text" style={{ fontSize: 24, fontWeight: 700, color: 'var(--accent)' }}>GXO</span>
          <div className="sidebar-subtitle text-uppercase text-muted fw-bold" style={{ fontSize: 10, letterSpacing: '0.1em' }}>Dock Schedule</div>
          <div className="sidebar-site small mt-1">Albert Lea Hub</div>
        </div>

        <div className="sidebar-section-heading text-uppercase text-muted fw-bold mb-2" style={{ fontSize: 11 }}>Main</div>
        <nav className="d-flex flex-column gap-1 mb-4">
          <button className={`btn text-start py-2 px-3 sidebar-link ${view === 'dashboard' ? 'active' : ''}`} onClick={() => setView('dashboard')}>
            <i className="bi bi-house-door me-2"></i> Home
          </button>
          <button className={`btn text-start py-2 px-3 sidebar-link ${view === 'appointments' ? 'active' : ''}`} onClick={() => setView('appointments')}>
            <i className="bi bi-list-ul me-2"></i> Appointments
          </button>
          <button className={`btn text-start py-2 px-3 sidebar-link ${view === 'add-appointment' ? 'active' : ''}`} onClick={() => setView('add-appointment')}>
            <i className="bi bi-plus-circle me-2"></i> Add Appointment
          </button>
        </nav>

        <div className="sidebar-section-heading text-uppercase text-muted fw-bold mb-2" style={{ fontSize: 11 }}>Operations</div>
        <nav className="d-flex flex-column gap-1 mb-4">
          <button className={`btn text-start py-2 px-3 sidebar-link ${view === 'check-in' ? 'active' : ''}`} onClick={() => setView('check-in')}>
            <i className="bi bi-box-arrow-in-right me-2"></i> Check-In
          </button>
          <button className={`btn text-start py-2 px-3 sidebar-link ${view === 'check-out' ? 'active' : ''}`} onClick={() => setView('check-out')}>
            <i className="bi bi-box-arrow-left me-2"></i> Check-Out
          </button>
          <button className={`btn text-start py-2 px-3 sidebar-link ${view === 'staging-map' ? 'active' : ''}`} onClick={() => setView('staging-map')}>
            <i className="bi bi-map me-2"></i> Staging Map
          </button>
          <button className={`btn text-start py-2 px-3 sidebar-link ${view === 'kpi-export' ? 'active' : ''}`} onClick={() => setView('kpi-export')}>
            <i className="bi bi-file-earmark-spreadsheet me-2"></i> KPI Export
          </button>
        </nav>

        <div className="sidebar-section-heading text-uppercase text-muted fw-bold mb-2" style={{ fontSize: 11 }}>External</div>
        <nav className="d-flex flex-column gap-1">
          <button className={`btn text-start py-2 px-3 sidebar-link ${view === 'pit-board' ? 'active' : ''}`} onClick={() => setView('pit-board')}>
            <i className="bi bi-forklift me-2"></i> PIT Board
          </button>
          <button className={`btn text-start py-2 px-3 sidebar-link ${view === 'admin' ? 'active' : ''}`} onClick={() => setView('admin')}>
            <i className="bi bi-gear me-2"></i> Admin
          </button>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-grow-1 p-4 p-lg-5" style={{ overflowY: 'auto', position: 'relative' }}>
        {loading && (
          <div className="position-absolute top-50 start-50 translate-middle" style={{ zIndex: 1000 }}>
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        )}
        {view === 'dashboard' && (
          <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <span className="text-uppercase text-muted fw-bold" style={{ fontSize: 11 }}>Overview</span>
                <h1 className="display-5 font-serif fw-bold">Dashboard</h1>
              </div>
              <span className="badge bg-dark fs-6 py-2 px-3">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
            </div>

            {/* KPI statistics cards */}
            <div className="row g-3 mb-5">
              {[
                { label: 'Scheduled', val: stats.total, color: 'text-primary', desc: 'Total appointments' },
                { label: 'Checked In', val: stats.checked_in, color: 'text-warning', desc: 'At facility' },
                { label: 'Completed', val: stats.completed, color: 'text-success', desc: 'Checked out' },
                { label: 'Late', val: stats.late, color: 'text-danger', desc: '>15 mins late' },
                { label: 'Missed', val: stats.missed, color: 'text-secondary', desc: 'No show' },
                { label: 'IB / OB', val: `${stats.ib_count}/${stats.ob_count}`, color: 'text-dark', desc: 'Split ratio' }
              ].map((kpi, idx) => (
                <div className="col-6 col-md-4 col-lg-2" key={idx}>
                  <div className="card border-0 p-3 shadow-sm" style={{ background: 'var(--surface)' }}>
                    <span className="text-muted small fw-semibold d-block mb-1">{kpi.label}</span>
                    <h3 className={`fw-bold mb-1 ${kpi.color}`}>{kpi.val}</h3>
                    <span className="text-muted" style={{ fontSize: 11 }}>{kpi.desc}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Checked-In Trucks */}
            <div className="card border-0 p-4 shadow-sm" style={{ background: 'var(--surface)' }}>
              <h3 className="font-serif fw-bold mb-3">Live Yard Checked-In Trucks</h3>
              {appointments.length === 0 ? (
                <div className="text-center py-4 text-muted">No checked-in trucks currently in yard</div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle">
                    <thead>
                      <tr>
                        <th>BOL #</th>
                        <th>Type</th>
                        <th>Carrier</th>
                        <th>Customer</th>
                        <th>Door</th>
                        <th>PIT Operator</th>
                        <th>Check-In Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {appointments.map((appt) => (
                        <tr key={appt.id}>
                          <td className="mono fw-bold">#{appt.bol_shipment_no}</td>
                          <td><span className={`badge ${appt.appt_type === 'Inbound' ? 'bg-primary' : 'bg-success'}`}>{appt.appt_type}</span></td>
                          <td>{appt.carrier}</td>
                          <td>{appt.customer}</td>
                          <td><span className="badge bg-secondary">{appt.door_name || 'Unassigned'}</span></td>
                          <td>{appt.operator_name || 'Unassigned'}</td>
                          <td className="small text-muted">{new Date(appt.check_in_time).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {view === 'appointments' && (
          <div>
            <h1 className="display-5 font-serif fw-bold mb-4">Appointments List</h1>
            <div className="card border-0 p-4 shadow-sm" style={{ background: 'var(--surface)' }}>
              {appointments.length === 0 ? (
                <div className="text-center py-4 text-muted">No appointments found</div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Date</th>
                        <th>Time</th>
                        <th>Type</th>
                        <th>BOL / Shipment</th>
                        <th>Carrier</th>
                        <th>Customer</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {appointments.map((appt) => (
                        <tr key={appt.id}>
                          <td className="mono text-muted">{appt.id}</td>
                          <td>{appt.appt_date}</td>
                          <td className="mono">{appt.appt_time}</td>
                          <td><span className={`badge ${appt.appt_type === 'Inbound' ? 'bg-primary' : 'bg-success'}`}>{appt.appt_type}</span></td>
                          <td className="mono fw-bold">#{appt.bol_shipment_no}</td>
                          <td>{appt.carrier}</td>
                          <td>{appt.customer}</td>
                          <td>
                            <span className={`badge ${
                              appt.status === 'Completed' ? 'bg-success' :
                              appt.status === 'Checked In' ? 'bg-warning text-dark' : 'bg-secondary'
                            }`}>{appt.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {view === 'add-appointment' && (
          <div style={{ maxWidth: 640 }}>
            <h1 className="display-5 font-serif fw-bold mb-4">Add Appointment</h1>
            <div className="card border-0 p-4 shadow-sm" style={{ background: 'var(--surface)' }}>
              <form onSubmit={handleAddAppointment}>
                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label className="form-label small text-uppercase text-muted fw-bold">Date</label>
                    <input type="date" required className="form-control" value={newAppt.date} onChange={e => setNewAppt({...newAppt, date: e.target.value})} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small text-uppercase text-muted fw-bold">Time</label>
                    <input type="time" required className="form-control" value={newAppt.time} onChange={e => setNewAppt({...newAppt, time: e.target.value})} />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label small text-uppercase text-muted fw-bold">Direction</label>
                  <select className="form-select" value={newAppt.type} onChange={e => setNewAppt({...newAppt, type: e.target.value})}>
                    <option value="Inbound">Inbound (IB)</option>
                    <option value="Outbound">Outbound (OB)</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label small text-uppercase text-muted fw-bold">Carrier</label>
                  <select required className="form-select" value={newAppt.carrierId} onChange={e => setNewAppt({...newAppt, carrierId: e.target.value})}>
                    <option value="">Select Carrier...</option>
                    {metadata.carriers.map((c: any) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label small text-uppercase text-muted fw-bold">BOL / Shipment Number</label>
                  <input type="text" required placeholder="Type BOL number..." className="form-control" value={newAppt.bol} onChange={e => setNewAppt({...newAppt, bol: e.target.value})} />
                </div>

                <div className="mb-3">
                  <label className="form-label small text-uppercase text-muted fw-bold">Customer</label>
                  <select required className="form-select" value={newAppt.customerId} onChange={e => setNewAppt({...newAppt, customerId: e.target.value})}>
                    <option value="">Select Customer...</option>
                    {metadata.customers.map((c: any) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="mb-4">
                  <label className="form-label small text-uppercase text-muted fw-bold">Product Type</label>
                  <select required className="form-select" value={newAppt.productTypeId} onChange={e => setNewAppt({...newAppt, productTypeId: e.target.value})}>
                    <option value="">Select Product...</option>
                    {metadata.productTypes.map((p: any) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <button type="submit" className="btn btn-primary w-100 py-2">Create Appointment</button>
              </form>
            </div>
          </div>
        )}

        {view === 'check-in' && (
          <div style={{ maxWidth: 640 }}>
            <h1 className="display-5 font-serif fw-bold mb-4">Driver Check-In</h1>
            <div className="card border-0 p-4 shadow-sm mb-4" style={{ background: 'var(--surface)' }}>
              <label className="form-label small text-uppercase text-muted fw-bold">Find Scheduled Appointment</label>
              <div className="input-group mb-3">
                <input type="text" placeholder="Search BOL, carrier, or customer..." className="form-control" value={checkInSearch} onChange={e => setCheckInSearch(e.target.value)} />
                <button className="btn btn-outline-secondary" type="button" onClick={handleSearchCheckIn}>Search</button>
              </div>

              {checkInMatches.length > 0 && (
                <div className="list-group">
                  {checkInMatches.map((appt) => (
                    <button key={appt.id} className={`list-group-item list-group-item-action ${selectedCheckIn?.id === appt.id ? 'active' : ''}`} onClick={() => setSelectedCheckIn(appt)}>
                      <div className="d-flex w-100 justify-content-between">
                        <h5 className="mb-1 fw-bold">#{appt.bol_shipment_no}</h5>
                        <small>{appt.appt_date} @ {appt.appt_time}</small>
                      </div>
                      <p className="mb-1 small">Carrier: {appt.carrier} | Customer: {appt.customer}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {selectedCheckIn && (
              <div className="card border-0 p-4 shadow-sm" style={{ background: 'var(--surface)' }}>
                <h4 className="font-serif fw-bold mb-3">Complete Check-In for #{selectedCheckIn.bol_shipment_no}</h4>
                <form onSubmit={handleConfirmCheckIn}>
                  <div className="mb-3">
                    <label className="form-label small text-uppercase text-muted fw-bold">Select Door Assignment</label>
                    <select required className="form-select" value={checkInForm.doorId} onChange={e => setCheckInForm({...checkInForm, doorId: e.target.value})}>
                      <option value="">Select Door...</option>
                      {metadata.doors.filter((d: any) => d.status === 'Open').map((d: any) => (
                        <option key={d.id} value={d.id}>{d.door_name} ({d.direction})</option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-4">
                    <label className="form-label small text-uppercase text-muted fw-bold">Select Assignee (PIT Board Operator)</label>
                    <select required className="form-select" value={checkInForm.operatorId} onChange={e => setCheckInForm({...checkInForm, operatorId: e.target.value})}>
                      <option value="">Select Operator...</option>
                      {metadata.operators.map((o: any) => (
                        <option key={o.id} value={o.id}>{o.name}</option>
                      ))}
                    </select>
                  </div>

                  <button type="submit" className="btn btn-warning w-100 py-2">Confirm Check-In</button>
                </form>
              </div>
            )}
          </div>
        )}

        {view === 'check-out' && (
          <div style={{ maxWidth: 640 }}>
            <h1 className="display-5 font-serif fw-bold mb-4">Driver Check-Out</h1>
            <div className="card border-0 p-4 shadow-sm" style={{ background: 'var(--surface)' }}>
              <label className="form-label small text-uppercase text-muted fw-bold">Find Checked-In Appointment</label>
              <div className="input-group mb-3">
                <input type="text" placeholder="Search BOL or carrier..." className="form-control" value={checkOutSearch} onChange={e => setCheckOutSearch(e.target.value)} />
                <button className="btn btn-outline-secondary" type="button" onClick={handleSearchCheckOut}>Search</button>
              </div>

              {checkOutMatches.length > 0 && (
                <div className="list-group">
                  {checkOutMatches.map((appt) => (
                    <div key={appt.id} className="list-group-item d-flex justify-content-between align-items-center">
                      <div>
                        <h5 className="mb-1 fw-bold">#{appt.bol_shipment_no}</h5>
                        <small className="text-muted">Door: {appt.door_name} | Carrier: {appt.carrier}</small>
                      </div>
                      <button className="btn btn-success btn-sm" onClick={() => handleConfirmCheckOut(appt.id)}>Check Out</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {view === 'staging-map' && (
          <div>
            <h1 className="display-5 font-serif fw-bold mb-2">Staging Lanes Map</h1>
            <p className="text-muted mb-4">Real-time status visual representation of Bayer Albert Lea staging lanes.</p>
            <div className="card border-0 p-4 shadow-sm" style={{ background: 'var(--surface)', minHeight: 600 }}>
              <StagingLanesMap />
            </div>
          </div>
        )}

        {view === 'kpi-export' && (
          <div>
            <h1 className="display-5 font-serif fw-bold mb-4">KPI Export Board</h1>
            <div className="card border-0 p-4 shadow-sm" style={{ background: 'var(--surface)' }}>
              {appointments.length === 0 ? (
                <div className="text-center py-4 text-muted">No completed appointments found for export</div>
              ) : (
                <div>
                  <button className="btn btn-sm btn-outline-primary mb-3" onClick={() => {
                    const text = appointments.map(appt => `${appt.bol_shipment_no}\t${appt.appt_type}\t${appt.carrier}\t${appt.customer}\t${appt.check_in_time}\t${appt.check_out_time}`).join('\n');
                    navigator.clipboard.writeText(text);
                    alert('Copied to clipboard in Excel-ready format!');
                  }}>Copy Excel Data</button>
                  <div className="table-responsive">
                    <table className="table align-middle">
                      <thead>
                        <tr>
                          <th>BOL</th>
                          <th>Type</th>
                          <th>Carrier</th>
                          <th>Customer</th>
                          <th>In</th>
                          <th>Out</th>
                          <th>Dwell</th>
                        </tr>
                      </thead>
                      <tbody>
                        {appointments.map((appt) => (
                          <tr key={appt.id}>
                            <td className="mono fw-bold">#{appt.bol_shipment_no}</td>
                            <td>{appt.appt_type}</td>
                            <td>{appt.carrier}</td>
                            <td>{appt.customer}</td>
                            <td className="small text-muted">{new Date(appt.check_in_time).toLocaleTimeString()}</td>
                            <td className="small text-muted">{new Date(appt.check_out_time).toLocaleTimeString()}</td>
                            <td className="mono fw-semibold text-success">{appt.dwell_time || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {view === 'pit-board' && (
          <div>
            <h1 className="display-5 font-serif fw-bold mb-4">PIT Operator Dashboard</h1>
            <div className="row g-3">
              {pitTasks.map((t) => (
                <div className="col-md-4" key={t.appt_id}>
                  <div className="card border-0 p-3 shadow-sm bg-dark text-white">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <h4 className="mb-0 font-serif">#{t.bol_shipment_no}</h4>
                      <span className={`badge ${t.pit_status === 'Pending' ? 'bg-warning text-dark' : 'bg-primary'}`}>{t.pit_status}</span>
                    </div>
                    <p className="small text-light mb-1">Carrier: {t.carrier} | Door: {t.door_name || 'Unassigned'}</p>
                    {t.pit_status === 'Pending' ? (
                      <div className="mt-3">
                        <input type="text" placeholder="Type operator name..." id={`op-name-${t.appt_id}`} className="form-control bg-secondary text-white mb-2" />
                        <button className="btn btn-sm btn-success w-100" onClick={() => {
                          const name = (document.getElementById(`op-name-${t.appt_id}`) as HTMLInputElement)?.value;
                          handleStartPitTask(t.appt_id, name);
                        }}>Start Task</button>
                      </div>
                    ) : (
                      <div className="mt-3">
                        <small className="text-light d-block mb-1">Assigned: {t.operator_name}</small>
                        <button className="btn btn-sm btn-primary w-100" onClick={() => handleCompletePitTask(t.appt_id)}>Complete Task</button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {view === 'admin' && (
          <div>
            <h1 className="display-5 font-serif fw-bold mb-4">Admin Dashboard</h1>
            <div className="row g-4">
              <div className="col-md-6">
                <div className="card border-0 p-4 shadow-sm" style={{ background: 'var(--surface)' }}>
                  <h3 className="font-serif fw-bold mb-3">Facility Doors</h3>
                  <ul className="list-group">
                    {metadata.doors.map((d: any) => (
                      <li key={d.id} className="list-group-item d-flex justify-content-between align-items-center">
                        {d.door_name} ({d.direction})
                        <span className={`badge ${d.status === 'Open' ? 'bg-success' : 'bg-danger'}`}>{d.status}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="col-md-6">
                <div className="card border-0 p-4 shadow-sm" style={{ background: 'var(--surface)' }}>
                  <h3 className="font-serif fw-bold mb-3">PIT Operators</h3>
                  <ul className="list-group">
                    {metadata.operators.map((o: any) => (
                      <li key={o.id} className="list-group-item">{o.name}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
