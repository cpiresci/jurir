import { Check, Zap, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useStore } from '../store';

const FREE_FEATURES = [
  '1 agente especialista (selecionado por IA)',
  'Análise jurídica por área mais relevante',
  'Resultado em até 3 minutos',
];

const PREMIUM_FEATURES = [
  '16 agentes especializados em paralelo',
  'Advogado do Diabo com contraditório completo',
  'Juiz IA Quantum + JURIR Score dimensional',
  'Streaming SSE em tempo real',
  'Histórico completo de análises',
  'Delta Analysis (comparativo de casos)',
  'Análise de documentos PDF/Word',
  'Simulador de Instâncias judiciais',
  'Gerador de Petições profissional (.docx)',
  'Monitoramento Processual via DATAJUD',
  'Exportação em PDF profissional',
  'Verificação de autenticidade (serial)',
];

export default function Pricing() {
  const { openModal, authToken } = useStore();

  return (
    <section id="precos" style={{ padding: '100px 24px' }}>
      <div style={{ maxWidth: 820, margin: '0 auto' }}>

        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <div className="section-label" style={{ marginBottom: 20 }}>Planos & Acesso</div>
          <h2 className="t-display" style={{ fontSize: 'clamp(1.9rem,4vw,2.8rem)', fontWeight: 400, color: 'var(--t0)', marginBottom: 14, letterSpacing: '-.02em' }}>
            Escolha seu nível de{' '}
            <span className="accent-cobalt" style={{ fontStyle: 'italic' }}>acesso</span>
          </h2>
          <p style={{ color: 'var(--t3)', fontSize: '.9rem', lineHeight: 1.7 }}>
            Comece gratuitamente. Eleve para poder total quando precisar de profundidade máxima.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, alignItems: 'start' }}>

          {/* Free card */}
          <div className="pricing-card pricing-card-free">
            <div style={{ fontFamily: 'var(--f-mono)', fontSize: '.65rem', color: 'var(--t4)', letterSpacing: '.18em', textTransform: 'uppercase', marginBottom: 20 }}>
              GRATUITO
            </div>
            <div style={{ fontFamily: 'var(--f-display)', fontSize: '3rem', letterSpacing: '.02em', color: 'var(--t0)', lineHeight: 1, marginBottom: 4 }}>
              R$ 0
            </div>
            <div style={{ fontSize: '.82rem', color: 'var(--t4)', marginBottom: 32 }}>para sempre, sem cartão</div>

            <div style={{ height: 1, background: 'var(--b-main)', marginBottom: 24 }}/>

            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
              {FREE_FEATURES.map((f, i) => (
                <li key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <Check size={13} style={{ color: 'var(--jade2)', flexShrink: 0, marginTop: 3 }}/>
                  <span style={{ fontSize: '.855rem', color: 'var(--t2)', lineHeight: 1.5 }}>{f}</span>
                </li>
              ))}
            </ul>

            <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center' }}
              onClick={() => document.getElementById('analise')?.scrollIntoView({ behavior: 'smooth' })}>
              Usar Grátis
            </button>
          </div>

          {/* Premium card */}
          <div className="pricing-card pricing-card-premium">
            {/* Glow top accent */}
            <div style={{
              position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
              width: '60%', height: 1,
              background: 'linear-gradient(90deg, transparent, var(--co8), transparent)',
              zIndex: 1,
            }}/>

            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <span style={{ fontFamily: 'var(--f-mono)', fontSize: '.65rem', color: 'rgba(255,255,255,0.45)', letterSpacing: '.18em', textTransform: 'uppercase' }}>
                  PREMIUM
                </span>
                <span style={{
                  background: 'rgba(43,138,245,0.2)', border: '1px solid rgba(43,138,245,0.35)',
                  borderRadius: 'var(--r-pill)', padding: '3px 10px',
                  fontFamily: 'var(--f-mono)', fontSize: '.6rem', color: 'var(--co9)',
                  letterSpacing: '.1em',
                }}>
                  MAIS POPULAR
                </span>
              </div>

              <div style={{ fontFamily: 'var(--f-display)', fontSize: '3rem', letterSpacing: '.02em', color: '#fff', lineHeight: 1, marginBottom: 4 }}>
                R$ 49
              </div>
              <div style={{ fontSize: '.82rem', color: 'rgba(255,255,255,0.45)', marginBottom: 32 }}>por mês, cancele quando quiser</div>

              <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', marginBottom: 24 }}/>

              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 32 }}>
                {PREMIUM_FEATURES.map((f, i) => (
                  <li key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <Check size={13} style={{ color: 'var(--co9)', flexShrink: 0, marginTop: 3 }}/>
                    <span style={{ fontSize: '.845rem', color: 'rgba(255,255,255,0.80)', lineHeight: 1.5 }}>{f}</span>
                  </li>
                ))}
              </ul>

              {authToken ? (
                <Link to="/premium" className="btn" style={{
                  width: '100%', justifyContent: 'center', display: 'flex',
                  background: '#fff', color: 'var(--co6)',
                  fontWeight: 700,
                }}>
                  <Zap size={14}/> Fazer Upgrade <ArrowRight size={14}/>
                </Link>
              ) : (
                <button className="btn" onClick={() => openModal('register')} style={{
                  width: '100%', justifyContent: 'center',
                  background: '#fff', color: 'var(--co6)',
                  fontWeight: 700,
                }}>
                  <Zap size={14}/> Começar Premium <ArrowRight size={14}/>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Trust row */}
        <div style={{
          marginTop: 48, display: 'flex', justifyContent: 'center',
          gap: 32, flexWrap: 'wrap',
        }}>
          {['🔒 Pagamento seguro', '✅ Cancele a qualquer hora', '⚡ Acesso imediato', '🛡️ Dados protegidos'].map((item, i) => (
            <span key={i} style={{ fontFamily: 'var(--f-mono)', fontSize: '.68rem', color: 'var(--t4)', letterSpacing: '.08em' }}>
              {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
