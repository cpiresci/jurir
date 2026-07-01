import { Link } from 'react-router-dom';
import { XCircle } from 'lucide-react';

export default function CheckoutCancelPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ maxWidth: 420, width: '100%', textAlign: 'center' }}>
        <XCircle size={48} style={{ color: 'var(--cr3)', marginBottom: 20 }} />
        <h1 className="t-display" style={{ fontSize: 'clamp(1.75rem,4vw,2.25rem)', fontWeight: 700, marginBottom: 8 }}>
          Pagamento cancelado
        </h1>
        <p style={{ color: 'var(--p4)', fontSize: 'var(--fs-base)', lineHeight: 1.6, marginBottom: 32 }}>
          Nenhuma cobrança foi realizada. Você pode tentar novamente quando quiser.
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          <Link to="/premium" className="btn btn-cobalt">Ver planos</Link>
          <Link to="/" className="btn btn-ghost">Voltar ao início</Link>
        </div>
      </div>
    </div>
  );
}
