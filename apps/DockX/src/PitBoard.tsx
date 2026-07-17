import { useState, useEffect } from 'react';
import { ontologyClient, WORKFLOW_STAGES } from '@gxo/semantic';
import { toast, ToastHost } from './toast';

export function PitBoard() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [statusTab, setStatusTab] = useState<'todo' | 'pending' | 'done'>('todo');
  const [operators, setOperators] = useState<string[]>([]);
  const [selectedOperator, setSelectedOperator] = useState('');

  // Operator names come from the Operations Hub employee roster, scoped to this facility's site.
  useEffect(() => {
    (async () => {
      try {
        const [emps, sites] = await Promise.all([ontologyClient.getEmployees(), ontologyClient.getSites()]);
        const primarySiteId = sites.find(s => s.properties.active)?.id;
        const names = emps
          .filter(e => e.properties.active && (!primarySiteId || !e.properties.siteId || e.properties.siteId === primarySiteId))
          .map(e => e.properties.fullName)
          .sort((a, b) => a.localeCompare(b));
        setOperators(names);
      } catch {
        setOperators([]);
      }
    })();
  }, []);

  const categories = [
    'Outbound', 'Inbound', 'Inbound/outbound', 'Pick', 
    'Putaway', 'Verify', 'Return', 'Retag'
  ];

  useEffect(() => {
    fetchPitTasks();
  }, []);

  async function fetchPitTasks() {
    setLoading(true);
    try {
      const pitTasks = await ontologyClient.getPitTasks();
      const appts = await ontologyClient.getAppointments();
      
      const enrichedTasks = pitTasks.map(t => {
        const appt = appts.find(a => a.id === t.properties.appointmentId);
        return {
          id: t.id,
          appt_id: t.properties.appointmentId,
          type: t.properties.type || 'Inbound/outbound',
          stage: t.properties.stage || null,
          appt_type: appt?.properties.type || 'Outbound',
          bol_shipment_no: appt?.properties.bolShipmentNo || 'Unknown',
          carrier: appt?.properties.carrier || 'Unknown',
          door_name: appt?.properties.doorName || null,
          pit_status: t.properties.status,
          appt_status: appt?.properties.status || null,
          operator_name: t.properties.operatorName,
          startedAt: t.properties.startedAt
        };
      });
      setTasks(enrichedTasks);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleStartTask(taskId: number, operatorName: string) {
    if (!operatorName.trim()) {
      toast('Select your name first', 'danger');
      return;
    }
    try {
      await ontologyClient.startPitTask({ taskId, operatorName });
      toast(`Task started by ${operatorName}`, 'success');
      fetchPitTasks();
    } catch (err: any) {
      toast(err.message, 'danger');
    }
  }

  async function handleCompleteTask(taskId: number) {
    try {
      // The API completes the task and advances the load to the next stage.
      await ontologyClient.completePitTask({ taskId });
      toast('Task completed', 'success');
      fetchPitTasks();
    } catch (err: any) {
      toast(err.message, 'danger');
    }
  }

  const filteredTasks = selectedCategory ? tasks.filter(t => t.type.toLowerCase() === selectedCategory.toLowerCase()) : tasks;

  // A task is workable once the load has reached that task's stage. Gate tasks
  // (no workflow stage) are always workable.
  const isReleased = (t: any) => {
    if (!t.stage) return true;
    const order = WORKFLOW_STAGES[t.appt_type as 'Outbound' | 'Inbound' | 'Return'] || WORKFLOW_STAGES.Outbound;
    const si = order.indexOf(t.stage);
    if (si === -1) return true; // non-workflow (gate) task
    return order.indexOf(t.appt_status) >= si;
  };

  const renderCard = (t: any) => {
    const released = isReleased(t);
    return (
      <div className="card border-0 p-3 shadow-sm mb-3" style={{ background: 'var(--surface)' }} key={t.id}>
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h4 className="mb-0 font-serif fw-bold">#{t.bol_shipment_no}</h4>
          {t.pit_status === 'Pending' ? (
            released ? (
              <span className="badge bg-info text-dark">Ready for Picking</span>
            ) : (
              <span className="badge bg-secondary">Not Released</span>
            )
          ) : (
            <span className={`badge ${t.pit_status === 'Completed' ? 'bg-success' : 'bg-primary'}`}>{t.pit_status}</span>
          )}
        </div>
        <p className="small text-muted mb-1">Type: <strong>{t.type}</strong></p>
        <p className="small text-muted mb-1">Carrier: {t.carrier} | Door: {t.door_name || 'Unassigned'}</p>

        {t.pit_status === 'Pending' ? (
          released ? (
            <div className="mt-3">
              <button
                className="btn btn-sm btn-primary w-100"
                disabled={!selectedOperator}
                onClick={() => handleStartTask(t.id, selectedOperator)}
              >
                Start Task{selectedOperator ? ` as ${selectedOperator}` : ''}
              </button>
              {!selectedOperator && (
                <small className="text-muted d-block mt-1 text-center">Select your name (top-right) to start.</small>
              )}
            </div>
          ) : (
            <div className="mt-3">
              <div className="alert alert-light border small mb-0 py-2 px-2 text-muted">
                <i className="bi bi-lock me-1"></i> Waiting for clerk to release this load to <strong>{t.stage || 'the next stage'}</strong>.
              </div>
            </div>
          )
        ) : t.pit_status === 'In Progress' ? (
          <div className="mt-3">
            <small className="text-muted d-block mb-1">Assigned: <strong>{t.operator_name}</strong></small>
            <button className="btn btn-sm btn-success w-100" onClick={() => handleCompleteTask(t.id)}>Complete Task</button>
          </div>
        ) : (
          <div className="mt-3">
            <small className="text-success d-block fw-bold"><i className="bi bi-check-circle me-1"></i> Completed</small>
          </div>
        )}
      </div>
    );
  };

  // Three status buckets, per the operator workflow
  const buckets = [
    { key: 'todo', title: 'Needs to be done', icon: 'bi-list-check', tasks: filteredTasks.filter(t => t.pit_status === 'Pending') },
    { key: 'pending', title: 'Pending', icon: 'bi-hourglass-split', tasks: filteredTasks.filter(t => t.pit_status === 'In Progress') },
    { key: 'done', title: 'Completed', icon: 'bi-check2-circle', tasks: filteredTasks.filter(t => t.pit_status === 'Completed') },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <ToastHost />
      <header className="px-4 py-3 bg-white shadow-sm d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center gap-3">
          <span className="sidebar-logo-text" style={{ fontSize: 24, fontWeight: 700, color: 'var(--accent)' }}>GXO</span>
          <h2 className="mb-0 font-serif fw-bold" style={{ fontSize: 20 }}>PIT Operator Dashboard</h2>
        </div>
        <div className="d-flex align-items-center gap-2">
          <div className="d-flex align-items-center gap-2 pe-2 me-1 border-end">
            <i className="bi bi-person-badge text-muted"></i>
            <select
              className="form-select form-select-sm"
              style={{ width: 'auto', minWidth: 180 }}
              value={selectedOperator}
              onChange={e => setSelectedOperator(e.target.value)}
              title="Select your name — used when you start a task"
            >
              <option value="">Select your name…</option>
              {operators.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <button className="btn btn-outline-secondary btn-sm" onClick={fetchPitTasks}>
            <i className="bi bi-arrow-clockwise"></i> Refresh
          </button>
          <a href="/" className="btn btn-primary btn-sm">
            <i className="bi bi-arrow-left"></i> Back to Main
          </a>
        </div>
      </header>

      <main className="p-4 p-lg-5">
        {/* Categories Grid */}
        <div className="row g-3 mb-5">
          {categories.map(cat => {
            const count = tasks.filter(t => t.type.toLowerCase() === cat.toLowerCase()).length;
            const isSelected = selectedCategory === cat;
            return (
              <div className="col-6 col-md-3" key={cat}>
                <div 
                  className={`card border-0 p-3 shadow-sm h-100 ${isSelected ? 'bg-primary text-white' : 'bg-white text-dark'}`}
                  style={{ cursor: 'pointer', transition: 'all 0.2s', transform: isSelected ? 'translateY(-2px)' : 'none' }}
                  onClick={() => setSelectedCategory(isSelected ? null : cat)}
                >
                  <h4 className="fw-bold mb-1 font-serif">{cat}</h4>
                  <span className={isSelected ? 'text-white-50' : 'text-muted'}>{count} Tasks</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Task List */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3 className="font-serif fw-bold mb-0">
            {selectedCategory ? `${selectedCategory} Tasks` : 'All Active Tasks'}
          </h3>
          <span className="badge bg-secondary">{filteredTasks.length} total</span>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="card border-0 p-5 text-center text-muted" style={{ background: 'var(--surface)' }}>
            <i className="bi bi-inbox fs-1 mb-2"></i>
            <p className="mb-0">No tasks found for this category.</p>
          </div>
        ) : (
          <>
            {/* Status tabs — show only the selected bucket */}
            <ul className="nav nav-pills gap-2 mb-4">
              {buckets.map(bucket => (
                <li className="nav-item" key={bucket.key}>
                  <button
                    className={`nav-link ${statusTab === bucket.key ? 'active' : ''}`}
                    onClick={() => setStatusTab(bucket.key as 'todo' | 'pending' | 'done')}
                    style={statusTab !== bucket.key ? { background: 'var(--surface)', color: 'var(--text)' } : undefined}
                  >
                    <i className={`bi ${bucket.icon} me-2`}></i>{bucket.title}
                    <span className={`badge ms-2 ${statusTab === bucket.key ? 'bg-white text-primary' : 'bg-secondary'}`}>{bucket.tasks.length}</span>
                  </button>
                </li>
              ))}
            </ul>

            {(() => {
              const active = buckets.find(b => b.key === statusTab)!;
              if (active.tasks.length === 0) {
                return (
                  <div className="card border-0 p-5 text-center text-muted" style={{ background: 'var(--surface)' }}>
                    <i className="bi bi-inbox fs-1 mb-2"></i>
                    <p className="mb-0">Nothing in "{active.title}".</p>
                  </div>
                );
              }
              return (
                <div className="row g-4">
                  {active.tasks.map(t => (
                    <div className="col-md-4 col-lg-3" key={t.id}>{renderCard(t)}</div>
                  ))}
                </div>
              );
            })()}
          </>
        )}
      </main>
    </div>
  );
}
