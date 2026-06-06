import { useStore } from '../store';

export default function Toast() {
  const { toasts, removeToast } = useStore();
  if (!toasts.length) return null;
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div
          key={t.id}
          className={`toast toast-${t.type}`}
          onClick={() => removeToast(t.id)}
          style={{ cursor: 'pointer' }}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}
