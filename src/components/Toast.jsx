import { useStore } from '../store';
import { X } from 'lucide-react';

export default function Toast() {
  const { toasts, removeToast } = useStore();

  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast toast-${t.type}`}
          style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ flex: 1 }}>{t.message}</span>
          <button
            onClick={() => removeToast(t.id)}
            style={{
              background: 'none', border: 'none',
              color: 'inherit', opacity: .6, flexShrink: 0,
            }}
          >
            <X size={13}/>
          </button>
        </div>
      ))}
    </div>
  );
}
