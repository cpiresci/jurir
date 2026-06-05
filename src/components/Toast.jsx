import { useEffect } from 'react';
import { useStore } from '../store';

export default function Toast() {
  const { toasts, removeToast } = useStore();

  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24,
      display: 'flex', flexDirection: 'column', gap: 8,
      zIndex: 9999, pointerEvents: 'none',
    }}>
      {toasts.map(t => (
        <ToastItem key={t.id} toast={t} onRemove={removeToast} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onRemove }) {
  useEffect(() => {
    const timer = setTimeout(() => onRemove(toast.id), 3500);
    return () => clearTimeout(timer);
  }, [toast.id, onRemove]);

  const colors = {
    success: 'var(--emerald2)',
    error:   'var(--r3)',
    info:    'var(--n3)',
  };

  return (
    <div style={{
      background: 'var(--surface)',
      border: `1px solid ${colors[toast.type] || 'var(--bn)'}`,
      borderRadius: 'var(--r-md)',
      padding: '10px 16px',
      fontSize: '.84rem',
      color: 'var(--n1)',
      fontFamily: 'var(--f-sans)',
      boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
      pointerEvents: 'all',
      cursor: 'pointer',
      maxWidth: 320,
    }}
      onClick={() => onRemove(toast.id)}
    >
      {toast.message}
    </div>
  );
}
