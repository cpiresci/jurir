import { useState } from 'react';
import { CreditCard, Loader2, Check } from 'lucide-react';
import { useStore } from '../store';
import { createCheckoutSession } from '../lib/api';

const FEATURES = [
  '16 agentes especializados em paralelo',
  'Advogado do Diabo com contraditório obrigatório',
  'Juiz IA Quantum + JURIR Score',
  'Streaming SSE em tempo real',
  'Histórico completo de análises',
  'Delta Analysis — comparativo jurídico',
  'Análise de documentos PDF/DOCX',
  'Simulador de Instâncias Judiciárias',
  'Gerador de Petições .docx',
  'Monitoramento processual via DATAJUD',
  'PDF profissional com serial de autenticidade',
  'Suporte prioritário',
];

export default function CheckoutPage() {
  const { authToken, openModal, addToast } = useStore();
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    if (!authToken) { openModal('login'); return; }
    setLoading(true);
    try {
      const { checkout_url } = await createCheckoutSession(authToken);
      if (checkout_url) window.location.href = checkout_url;
      else addToast('Erro ao criar sessão de checkout.', 'error');
    } catch (e) {
      addToast(`Erro: ${e.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '100px 24px 60px' }}>
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <h1 className="t-display" style={{ fontSize: 'clamp(2rem,5vw,3rem)', fontWeight: 700, marginBottom: 12 }}>
          Ativar Acesso Premium
        </h1>
        <p style={{ color: 'var(--n4)', fontSize: '.95rem', lineHeight: 1.6 }}>
          Acesso completo a todos os recursos da plataforma jurídica mais avançada do Brasil.
        </p>
      </div>

      <div style={{ background: 'linear-gradient(145deg, var(--surface), var(--lift))',
        border: '1px solid var(--br)', borderRadius: 'var(--r-xl)', padding: 36,
        boxShadow: 'var(--shadow-crimson)', position: 'relative', overflow: 'hidden', marginBottom: 20 }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2,
          background: 'linear-gradient(90deg, transparent, var(--g3), transparent)' }}/>
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: '.72rem', color: 'var(--g4)', fontFamily: 'var(--f-mono)', letterSpacing: '.12em', marginBottom: 8 }}>PLANO PREMIUM</div>
          <div className="t-display" style={{ fontSize: '3rem', fontWeight: 700, color: 'var(--n0)', lineHeight: 1 }}>Sob consulta</div>
          <div style={{ fontSize: '.82rem', color: 'var(--n4)', marginTop: 6 }}>acesso completo · sem limite de análises</div>
        </div>
        <ul style={{ listStyle: 'none', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 20px', marginBottom: 28 }}>
          {FEATURES.map((f, i) => (
            <li key={i} style={{ display: 'flex', gap: 8, fontSize: '.83rem', color: 'var(--n2)', alignItems: 'flex-start' }}>
              <Check size={13} style={{ color: 'var(--g4)', flexShrink: 0, marginTop: 2 }}/> {f}
            </li>
          ))}
        </ul>
        <button className="btn btn-crimson" style={{ width: '100%', justifyContent: 'center', padding: '14px' }}
          onClick={handleCheckout} disabled={loading}>
          {loading ? <><Loader2 size={15} className="spin"/> Redirecionando…</> : <><CreditCard size={15}/> Assinar via Stripe</>}
        </button>
      </div>

      <p style={{ textAlign: 'center', fontSize: '.75rem', color: 'var(--n5)', lineHeight: 1.6 }}>
        Pagamento seguro processado pelo Stripe. Cancele a qualquer momento.
      </p>
    </div>
  );
}
