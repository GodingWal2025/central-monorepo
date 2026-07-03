import type { Suggestable } from '../types/inspection';

interface Props<T extends string | number> {
  label: string;
  field: Suggestable<T>;
  type?: 'text' | 'number';
  placeholder?: string;
  mono?: boolean;
  onChange: (next: Suggestable<T>) => void;
}

export function SuggestableField<T extends string | number>({
  label,
  field,
  type = 'text',
  placeholder,
  mono,
  onChange,
}: Props<T>) {
  const handleChange = (raw: string) => {
    const next: T | null =
      raw === '' ? null : (type === 'number' ? (Number(raw) as T) : (raw as T));

    let source: Suggestable<T>['source'];
    if (next === null) source = 'empty';
    else source = 'manual';

    onChange({ ...field, value: next, source });
  };

  return (
    <div className="field">
      <div className="field__label">{label}</div>

      <input
        type={type}
        value={field.value === null ? '' : String(field.value)}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        className={mono ? 'mono' : ''}
      />
    </div>
  );
}
