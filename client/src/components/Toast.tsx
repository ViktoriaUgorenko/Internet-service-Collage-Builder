import { useEffect, useState } from 'react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type?: ToastType;
  onDone: () => void;
  duration?: number;
}

export function Toast({ message, type = 'success', onDone, duration = 3000 }: ToastProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    const t = setTimeout(() => { setVisible(false); setTimeout(onDone, 300); }, duration);
    return () => clearTimeout(t);
  }, []); // eslint-disable-line

  const styles: Record<ToastType, { bg: string; border: string; color: string }> = {
    success: { bg: 'var(--success-bg)', border: '#b8dfc4', color: 'var(--success)' },
    error:   { bg: 'var(--danger-bg)',  border: '#f5c6c6', color: 'var(--danger)' },
    info:    { bg: 'var(--accent-bg)',  border: 'var(--accent-light)', color: 'var(--accent-dark)' },
  };

  const s = styles[type];

  return (
    <div className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-medium border shadow-sm transition-all duration-300 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
      style={{ background: s.bg, borderColor: s.border, color: s.color }}>
      {type === 'success' && <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/></svg>}
      {type === 'error'   && <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12"/></svg>}
      {type === 'info'    && <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>}
      {message}
    </div>
  );
}

interface ToastItem { id: number; message: string; type: ToastType; }
let _add: ((m: string, t?: ToastType) => void) | null = null;

export function showToast(message: string, type: ToastType = 'success') { _add?.(message, type); }

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  useEffect(() => {
    _add = (message, type = 'success') => setToasts(p => [...p, { id: Date.now(), message, type }]);
    return () => { _add = null; };
  }, []);
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-[100] pointer-events-none">
      {toasts.map(t => (
        <Toast key={t.id} message={t.message} type={t.type}
          onDone={() => setToasts(p => p.filter(x => x.id !== t.id))}/>
      ))}
    </div>
  );
}
