import { Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useStore } from '../store';

const FREE_FEATURES = [
  '1 agente especialista (selecionado por IA)',
  'Análise por área jurídica mais relevante',
  'Resultado imediato',
];

const PREMIUM_FEATURES = [
  '16 agentes especializados em paralelo',
  'Advogado do Diabo com contraditório',
  'Juiz IA Quantum + JURIR Score 4D',
  'Streaming SSE em tempo real',
  'Histórico completo de análises',
  'Delta Analysis (comparativo de casos)',
  'Análise de documentos PDF/Word',
  'Simulador de Instâncias',
  'Gerador de Petições .docx',
  'Monitoramento Processual via DATAJUD',
  'Exportação em PDF profissional',
  'Verificação de autenticidade (serial)',
];

export default function Pricing() {
  const { openModal, authToken } = useStore();

  return (
    <section id="precos" style={{ padding: '110px 0' }}>
      <div className="page-wrap">
        <div className="section-header">
          <div className="section-eyebrow">Planos</div>
          <h2 className="section-title">
            Acesso Total à <em>Inteligência</em> Jurídica
          </h2>
          <p className="section-desc">
            Comece gratuitamente. Faça upgrade quando precisar da profundidade máxima.
          </p>
        </div>

        <div className="pricing-grid">
          {/* Free */}
          <div className="pricing-card">
            <div style={{ marginBottom: 28 }}>
              <div style={{ fontSize: '.64rem', color: 'var(--n4)', fontFamily: 'var(--f-mono)', letterSpacing: '.18em', marginBottom: 10, textTransform: 'uppercase' }}>GRATUITO</div>
              <div className="pricing-price">R$ 0</div>
              <div className="pricing-period">para sempre</div>
            </div>
            <ul className="pricing-features">
              {FREE_FEATURES.map((f, i) => (
                <li key={i} className="pricing-feature">
                  <Check size={13} style={{ color: 'var(--emerald)', flexShrink: 0, marginTop: 2 }}/> {f}
                </li>
              ))}
            </ul>
            <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center' }}
              onClick={() => document.getElementById('analise')?.scrollIntoView({ behavior: 'smooth' })}>
              Usar Grátis
            </button>
          </div>

          {/* Premium */}
          <div className="pricing-card featured">
            <div style={{ marginBottom: 28 }}>
              <div style={{ fontSize: '.64rem', color: 'var(--flame)', fontFamily: 'var(--f-mono)', letterSpacing: '.18em', marginBottom: 10, textTransform: 'uppercase' }}>PREMIUM</div>
              <div className="pricing-price" style={{ color: 'var(--n0)' }}>R$ 49<span style={{ fontSize: '1.2rem', fontWeight: 400 }}>/mês</span></div>
              <div className="pricing-period">acesso completo</div>
            </div>
            <ul className="pricing-features">
              {PREMIUM_FEATURES.map((f, i) => (
                <li key={i} className="pricing-feature">
                  <Check size={13} style={{ color: 'var(--flame)', flexShrink: 0, marginTop: 2 }}/> {f}
                </li>
              ))}
            </ul>
            {authToken ? (
              <Link to="/premium" className="btn btn-flame" style={{ width: '100%', justifyContent: 'center' }}>
                ⚡ Fazer Upgrade
              </Link>
            ) : (
              <button className="btn btn-flame" style={{ width: '100%', justifyContent: 'center' }}
                onClick={() => openModal('register')}>
                ⚡ Começar Premium
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
