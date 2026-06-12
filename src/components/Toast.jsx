import { useEffect, useState } from 'react';
import { useStore } from '../store';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

const TYPE_CONFIG = {
  success: { icon: <CheckCircle size={14}/>, color: 'var(--emerald2)', bg: 'rgba(5,150,105,.14)', border: 'rgba(5,150,105,.28)' },
  error:   { icon: <AlertCircle size={14}/>, color: 'var(--r4)',       bg: 'rgba(185,28,28,.14)', border: 'rgba(185,28,28,.28)' },
  info:    { icon: <Info        size={14}/>, color: 'var(--n3)',       bg: 'rgba(12,12,30,.92)',  border: 'var(--bn)' },
};

function ToastItem({ toast, onRemove }) {
  const [visible, setVisible] = useState(false);
  const cfg = TYPE_CONFIG[toast.type] || TYPE_CONFIG.info;

  useEffect(() => {
    // Animate in
    requestAnimationFrame(() => setVisible(true));
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onRemove(toast.id), 300);
    }, 3800);
    return () => clearTimeout(timer);
  }, [toast.id, onRemove]);

  return (
    <div
      onClick={() => onRemove(toast.id)}
      style={{
        display: 'flex', alignItems: 'flex-start', gap: 10,
        background: cfg.bg, border: `1px solid ${cfg.border}`,
        borderRadius: 'var(--r-md)', padding: '12px 14px',
        fontSize: '.84rem', color: 'var(--n1)',
        fontFamily: 'var(--f-sans)',
        boxShadow: '0 8px 28px rgba(0,0,0,.45)',
        pointerEvents: 'all', cursor: 'pointer',
        maxWidth: 340, minWidth: 240,
        transition: 'opacity .3s, transform .3s',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateX(0)' : 'translateX(16px)',
      }}
    >
      <span style={{ color: cfg.color, flexShrink: 0, paddingTop: 1 }}>{cfg.icon}</span>
      <span style={{ flex: 1, lineHeight: 1.5 }}>{toast.message}</span>
      <X size={12} style={{ color: 'var(--n5)', flexShrink: 0, marginTop: 2 }}/>
    </div>
  );
}

export default function Toast() {
  const { toasts, removeToast } = useStore();

  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24,
      display: 'flex', flexDirection: 'column', gap: 8,
      zIndex: 9999, pointerEvents: 'none',
    }}>
      {toasts.map(t => (
        <ToastItem key={t.id} toast={t} onRemove={removeToast}/>
      ))}
    </div>
  );
}
