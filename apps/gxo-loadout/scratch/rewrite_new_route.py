import os

code = """import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getDeviceConfig } from '../lib/deviceConfig';
import { InspectorPicker } from '../components/InspectorPicker';
import { emptyInspection } from '../hooks/useInspection';
import { dbSaveInspection } from '../services/db';
import { listActiveStagingLocations, type StagingLocation } from '../services/stagingLocations';
import { listInspectorsForSite } from '../services/inspectors';
import type { InspectionType } from '../types/inspection';
import { INSPECTION_TYPE_LABELS, INSPECTION_TYPE_DESCRIPTIONS } from '../types/inspection';

function MultiSelectPills({ options, selected, onChange }: { options: string[], selected: string[], onChange: (s: string[]) => void }) {
  const toggle = (opt: string) => {
    if (selected.includes(opt)) onChange(selected.filter(x => x !== opt));
    else onChange([...selected, opt]);
  };
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {options.map(opt => {
        const active = selected.includes(opt);
        return (
          <button 
            key={opt}
            type="button"
            onClick={() => toggle(opt)}
            style={{
              padding: '8px 16px',
              borderRadius: 20,
              border: `1px solid ${active ? 'var(--accent)' : 'var(--rule-soft)'}`,
              background: active ? 'var(--accent-bg)' : 'var(--paper)',
              color: active ? 'var(--accent)' : 'inherit',
              cursor: 'pointer'
            }}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

export function NewInspectionRoute() {
  const navigate = useNavigate();
  const params = useParams<{ type: string }>();
  const config = getDeviceConfig();
  
  const [pickerName, setPickerName] = useState('');
  const [selectedInspectors, setSelectedInspectors] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  
  const [inspectors, setInspectors] = useState<{id: string, name: string}[]>([]);
  const [stagingLocations, setStagingLocations] = useState<StagingLocation[]>([]);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (config) {
      setStagingLocations(listActiveStagingLocations(config.siteId));
      setInspectors(listInspectorsForSite(config.siteId));
    }
  }, [config]);

  if (!config) {
    navigate('/setup');
    return null;
  }

  const inspectionType = (params.type as InspectionType) || 'outbound';
  const validType = ['outbound', 'returns', 'retag'].includes(inspectionType);

  if (!validType) {
    return (
      <main style={{ maxWidth: 560 }}>
        <div className="page-head">
          <h1 className="page-head__title">Unknown workflow</h1>
        </div>
        <Link to="/" className="btn">← Back to home</Link>
      </main>
    );
  }

  // Retag is stubbed for now
  if (inspectionType === 'retag') {
    return (
      <main style={{ maxWidth: 560 }}>
        <div className="page-head">
          <div>
            <h1 className="page-head__title">
              {INSPECTION_TYPE_LABELS[inspectionType]} <em>workflow</em>
            </h1>
            <div className="page-head__sub">{INSPECTION_TYPE_DESCRIPTIONS[inspectionType]}</div>
          </div>
        </div>

        <div className="banner banner--info">
          <span className="banner__icon">🚧</span>
          <div className="banner__body">
            <strong>Coming soon.</strong> The {INSPECTION_TYPE_LABELS[inspectionType]} workflow
            isn't built yet. Spec out the workflow with us and we'll build it.
          </div>
        </div>

        <div className="empty" style={{ marginTop: 16 }}>
          <div className="empty__title">What we need from you to build this</div>
          <div className="empty__sub" style={{ marginTop: 8 }}>
            <ul style={{ textAlign: 'left', listStylePosition: 'inside' }}>
              <li>What fields are captured?</li>
              <li>What photos are required?</li>
              <li>What's the step-by-step workflow?</li>
              <li>What does "complete" look like?</li>
            </ul>
          </div>
        </div>

        <div className="flex gap-8 mt-24">
          <Link to="/" className="btn">← Back to home</Link>
        </div>
      </main>
    );
  }

  // Outbound / Returns workflow
  const canStart = (inspectionType === 'returns' || pickerName) && selectedInspectors.length > 0 && selectedLocations.length > 0;

  const start = async () => {
    if (!canStart) return;
    setCreating(true);
    const inspection = {
      ...emptyInspection(config.siteId, inspectionType),
      pickerName: inspectionType === 'returns' ? undefined : pickerName,
      startedBy: selectedInspectors.join(', '),
      currentInspector: selectedInspectors.join(', '),
      lastEditedBy: selectedInspectors.join(', '),
      stagingLocation: selectedLocations.join(', '),
    };
    await dbSaveInspection(inspection);
    
    if (inspectionType === 'returns') {
      navigate(`/inspection/${inspection.id}/capture-returns-bol`);
    } else {
      navigate(`/inspection/${inspection.id}/capture-bol`);
    }
  };

  return (
    <main style={{ maxWidth: 560 }}>
      <div className="page-head">
        <div>
          <h1 className="page-head__title">
            New <em>{INSPECTION_TYPE_LABELS[inspectionType]} inspection</em>
          </h1>
          <div className="page-head__sub">Step 1 of 4 · Names and location</div>
        </div>
      </div>

      {inspectionType !== 'returns' && (
        <div className="field">
          <div className="field__label">Picker (who pulled the load)</div>
          <InspectorPicker
            siteId={config.siteId}
            value={pickerName}
            placeholder="Select picker…"
            onChange={setPickerName}
          />
        </div>
      )}

      <div className="field">
        <div className="field__label">Inspector(s)</div>
        <MultiSelectPills 
          options={inspectors.map(i => i.name)}
          selected={selectedInspectors}
          onChange={setSelectedInspectors}
        />
        <div className="field__hint" style={{ marginTop: 8 }}>
          Tap all inspectors working on this load. If you don't see your name, ask a manager to add you.
        </div>
      </div>

      <div className="field">
        <div className="field__label">Staging location(s)</div>
        {stagingLocations.length === 0 ? (
          <div className="banner banner--warn" style={{ marginBottom: 0 }}>
            <span className="banner__icon">⚠</span>
            <div className="banner__body">
              No staging locations defined for this site. Ask a manager to add them.
            </div>
          </div>
        ) : (
          <MultiSelectPills 
            options={stagingLocations.map(l => l.name)}
            selected={selectedLocations}
            onChange={setSelectedLocations}
          />
        )}
      </div>

      <div className="flex gap-8 mt-24">
        <Link to="/" className="btn btn--ghost">Cancel</Link>
        <button
          className="btn btn--accent btn--lg"
          onClick={start}
          disabled={!canStart || creating}
        >
          {creating ? 'Starting…' : `Continue → Capture ${inspectionType === 'returns' ? 'Returns BOL' : 'BOL'}`}
        </button>
      </div>
    </main>
  );
}
"""

with open("src/routes/NewInspectionRoute.tsx", "w", encoding="utf-8") as f:
    f.write(code)

print("Rewritten successfully")
