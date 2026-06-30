import { useStore } from '../store';
import { X } from 'lucide-react';

export default function Toast() {
  const { toasts, removeToast } = useStore();
  if (!toasts.length) return null;
  return (
    <div className="toast-wrap">
      {toasts.map(t => (
        <div key={t.id} className={`toast ${t.type || 'info'}`}>
          <span style={{ flex: 1 }}>{t.message}</span>
          <button onClick={() => removeToast(t.id)} aria-label="Fechar notificação" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--t4)', padding: 2, display: 'flex', flexShrink: 0 }}>
            <X size={13}/>
          </button>
        </div>
      ))}
    </div>
  );
}
