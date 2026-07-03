import os

p = "src/routes/NewInspectionRoute.tsx"
with open(p, "r", encoding="utf-8") as f:
    c = f.read()

# Add listInspectorsForSite to imports
c = c.replace(
    "import { listActiveStagingLocations, type StagingLocation } from '../services/stagingLocations';",
    "import { listActiveStagingLocations, type StagingLocation } from '../services/stagingLocations';\nimport { listInspectorsForSite } from '../services/inspectors';"
)

# Replace the single-select state and useEffect
state_start = c.find("  const [pickerName, setPickerName] = useState('');")
state_end = c.find("  const [creating, setCreating] = useState(false);")

new_states = """  const [pickerName, setPickerName] = useState('');
  const [selectedInspectors, setSelectedInspectors] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  
  const [inspectors, setInspectors] = useState<{id: string, name: string}[]>([]);
  const [stagingLocations, setStagingLocations] = useState<StagingLocation[]>([]);"""

c = c[:state_start] + new_states + "\n" + c[state_end:]

# Update useEffect
effect_start = c.find("  useEffect(() => {\n    if (config) {")
effect_end = c.find("  }, [config]);") + len("  }, [config]);")

new_effect = """  useEffect(() => {
    if (config) {
      setStagingLocations(listActiveStagingLocations(config.siteId));
      setInspectors(listInspectorsForSite(config.siteId));
    }
  }, [config]);"""

c = c[:effect_start] + new_effect + c[effect_end:]


# Add MultiSelectPills helper function inside the file but before NewInspectionRoute
helper = """
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
              border: `1px solid ${active ? 'var(--accent)' : 'var(--rule)'}`,
              background: active ? 'var(--accent)' : 'var(--paper)',
              color: active ? '#fff' : 'inherit',
              fontWeight: active ? 600 : 400,
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

"""

comp_start = c.find("export function NewInspectionRoute() {")
c = c[:comp_start] + helper + c[comp_start:]

# Update canStart and start logic
can_start_idx = c.find("  const canStart = pickerName && inspectorName && stagingLocation;")
start_end_idx = c.find("  const start = async () => {")

new_can_start = """  const canStart = (inspectionType === 'returns' || pickerName) && selectedInspectors.length > 0 && selectedLocations.length > 0;
"""
c = c[:can_start_idx] + new_can_start + c[start_end_idx:]

start_fn_idx = c.find("const inspection = {")
start_fn_end = c.find("};", start_fn_idx) + 2

new_inspection_obj = """const inspection = {
      ...emptyInspection(config.siteId, inspectionType),
      pickerName: inspectionType === 'returns' ? undefined : pickerName,
      startedBy: selectedInspectors.join(', '),
      currentInspector: selectedInspectors.join(', '),
      lastEditedBy: selectedInspectors.join(', '),
      stagingLocation: selectedLocations.join(', '),
    };"""

c = c[:start_fn_idx] + new_inspection_obj + c[start_fn_end:]


# Now update the UI elements
ui_start = c.find("""      <div className="field">
        <div className="field__label">Picker (who pulled the load)</div>""")

ui_end = c.find("""      <div className="flex gap-8 mt-24">""")

new_ui = """      {inspectionType !== 'returns' && (
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

"""

c = c[:ui_start] + new_ui + c[ui_end:]

with open(p, "w", encoding="utf-8") as f:
    f.write(c)
    
print("Updated NewInspectionRoute.tsx successfully")
