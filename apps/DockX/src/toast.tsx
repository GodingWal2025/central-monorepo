import { useEffect, useState } from 'react';

// Minimal dependency-free toast system. Call `toast('msg', 'success')` anywhere;
// mount <ToastHost /> once per render root.

export type ToastVariant = 'success' | 'danger' | 'info';
interface ToastItem { id: number; message: string; variant: ToastVariant; }

let _id = 0;
const listeners = new Set<(items: ToastItem[]) => void>();
let items: ToastItem[] = [];

function emit() { listeners.forEach((l) => l(items)); }

export function toast(message: string, variant: ToastVariant = 'info') {
  const item: ToastItem = { id: ++_id, message, variant };
  items = [...items, item];
  emit();
  setTimeout(() => {
    items = items.filter((i) => i.id !== item.id);
    emit();
  }, 4000);
}

const ICONS: Record<ToastVariant, string> = {
  success: 'bi-check-circle-fill',
  danger: 'bi-exclamation-triangle-fill',
  info: 'bi-info-circle-fill',
};

export function ToastHost() {
  const [list, setList] = useState<ToastItem[]>(items);
  useEffect(() => {
    listeners.add(setList);
    return () => { listeners.delete(setList); };
  }, []);

  return (
    <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 2000, display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 360 }}>
      {list.map((t) => (
        <div
          key={t.id}
          className={`alert alert-${t.variant} shadow-sm d-flex align-items-center gap-2 mb-0 py-2 px-3`}
          role="alert"
          style={{ animation: 'toastIn 0.15s ease' }}
        >
          <i className={`bi ${ICONS[t.variant]}`}></i>
          <span className="small">{t.message}</span>
        </div>
      ))}
    </div>
  );
}
