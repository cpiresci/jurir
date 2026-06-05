import { Check } from 'lucide-react';
import { useStore } from '../store';

const FREE_FEATURES = [
  '1 agente especialista (selecionado por IA)',
  'Análise por área jurídica mais relevante',
  'Resultado imediato',
];

const PREMIUM_FEATURES = [
  '16 agentes especializados em paralelo',
  'Advogado do Diabo com contraditório',
  'Juiz IA Quantum + JURIR Score',
  'Streaming SSE em tempo real',
  'Histórico completo de análises',
  'Delta Analysis (comparativo de casos)',
  'Análise de documentos PDF/Word',
  'Simulador de Instâncias',
  'Exportação em PDF profissional',
  'Suporte prioritário',
];

export default function Pricing() {
  const { openModal, authToken } = useStore();

  return (
    <section id="precos" style={{ padding: '80px 24px' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 className="t-display" style={{ fontSize: 'clamp(1.8rem,4vw,2.4rem)', fontWeight: 700, marginBottom: 12 }}>
            Planos
          </h2>
          <p style={{ color: 'var(--n4)', fontSize: '.9rem' }}>
            Comece gratuitamente. Faça upgrade quando precisar de profundidade total.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px,1fr))', gap: 20 }}>

          {/* Free */}
          <div style={{
            background: 'var(--surface)', border: '1px solid var(--bn)',
            borderRadius: 'var(--r-xl)', padding: 32,
          }}>
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: '.72rem', color: 'var(--n4)', fontFamily: 'var(--f-mono)', letterSpacing: '.12em', marginBottom: 8 }}>GRATUITO</div>
              <div style={{ fontFamily: 'var(--f-display)', fontSize: '2.4rem', fontWeight: 700 }}>R$ 0</div>
              <div style={{ fontSize: '.82rem', color: 'var(--n4)', marginTop: 4 }}>para sempre</div>
            </div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
              {FREE_FEATURES.map((f, i) => (
                <li key={i} style={{ display: 'flex', gap: 10, fontSize: '.85rem', color: 'var(--n3)' }}>
                  <Check size={14} style={{ color: 'var(--emerald2)', flexShrink: 0, marginTop: 2 }}/> {f}
                </li>
              ))}
            </ul>
            <button
              className="btn btn-ghost"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={() => document.getElementById('analise')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Usar Grátis
            </button>
          </div>

          {/* Premium */}
          <div style={{
            background: 'linear-gradient(145deg, var(--surface), var(--lift))',
            border: '1px solid var(--br)',
            borderRadius: 'var(--r-xl)', padding: 32,
            position: 'relative', overflow: 'hidden',
            boxShadow: 'var(--shadow-crimson)',
          }}>
            <div style={{
              position: 'absolute', top: 16, right: 16,
              background: 'linear-gradient(135deg, var(--r2), var(--r1))',
              borderRadius: 'var(--r-pill)', padding: '3px 10px',
              fontSize: '.68rem', color: '#fff', fontWeight: 700, letterSpacing: '.08em',
            }}>
              POPULAR
            </div>
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: '.72rem', color: 'var(--r3)', fontFamily: 'var(--f-mono)', letterSpacing: '.12em', marginBottom: 8 }}>PREMIUM</div>
              <div style={{ fontFamily: 'var(--f-display)', fontSize: '2.4rem', fontWeight: 700, color: 'var(--n0)' }}>
                Sob consulta
              </div>
              <div style={{ fontSize: '.82rem', color: 'var(--n4)', marginTop: 4 }}>acesso completo</div>
            </div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
              {PREMIUM_FEATURES.map((f, i) => (
                <li key={i} style={{ display: 'flex', gap: 10, fontSize: '.85rem', color: 'var(--n2)' }}>
                  <Check size={14} style={{ color: 'var(--g4)', flexShrink: 0, marginTop: 2 }}/> {f}
                </li>
              ))}
            </ul>
            <button
              className="btn btn-crimson"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={() => openModal('register')}
              disabled={!!authToken}
            >
              {authToken ? '✓ Conta ativa' : '🔓 Ativar Premium'}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
