import { useEffect, useState } from 'react';
import { ontologyClient } from '../client';

interface Props {
  /** Kept for API compatibility; inspectors are now sourced from Operations Hub employees. */
  siteId: string;
  value: string;
  placeholder?: string;
  onChange: (name: string) => void;
}

/**
 * Dropdown of inspector names.
 *
 * Names are pulled from the Operations Hub employee roster (active employees)
 * via the ontology API — the single source of truth for people across apps.
 */
export function InspectorPicker({ value, placeholder, onChange }: Props) {
  const [names, setNames] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    ontologyClient.getEmployees()
      .then((emps) => {
        if (cancelled) return;
        setNames(
          emps
            .filter((e) => e.properties.active)
            .map((e) => e.properties.fullName)
            .sort((a, b) => a.localeCompare(b))
        );
      })
      .catch(() => { if (!cancelled) setNames([]); });
    return () => { cancelled = true; };
  }, []);

  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">{placeholder || 'Select inspector…'}</option>
      {names.map((n) => (
        <option key={n} value={n}>{n}</option>
      ))}
    </select>
  );
}
