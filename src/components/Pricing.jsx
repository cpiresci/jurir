import { Check, Zap, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useStore } from '../store';

const FREE_FEATURES = [
  '1 agente especialista (selecionado por IA)',
  'Análise por área jurídica mais relevante',
  'Resultado imediato',
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

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <div className="section-label" style={{ justifyContent: 'center', marginBottom: 20 }}>
            Planos & Acesso
          </div>
          <h2 className="t-display" style={{
            fontSize: 'clamp(1.9rem,4vw,2.6rem)',
            fontWeight: 700, marginBottom: 14, color: 'var(--p0)',
          }}>
            Escolha seu nível de{' '}
            <span style={{ color: 'var(--au6)', fontStyle: 'italic', textShadow: '0 0 32px rgba(228,168,36,0.25)' }}>
              justiça
            </span>
          </h2>
          <p style={{ color: 'var(--p4)', fontSize: '.9rem', lineHeight: 1.7 }}>
            Comece gratuitamente. Eleve para poder total quando precisar de profundidade máxima.
          </p>
        </div>

        {/* Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 24,
          alignItems: 'start',
        }}>
          {/* Free card */}
          <div className="pricing-card pricing-card-free">
            <div style={{
              fontSize: '.7rem', color: 'var(--p5)',
              fontFamily: 'var(--f-mono)', letterSpacing: '.18em',
              textTransform: 'uppercase', marginBottom: 20,
            }}>
              GRATUITO
            </div>
            <div style={{
              fontFamily: 'var(--f-title)',
              fontSize: '3rem', letterSpacing: '.04em',
              color: 'var(--p0)', lineHeight: 1, marginBottom: 4,
            }}>
              R$ 0
            </div>
            <div style={{ fontSize: '.82rem', color: 'var(--p5)', marginBottom: 32 }}>
              para sempre, sem cartão
            </div>

            <div style={{ height: 1, background: 'var(--b-neutral)', marginBottom: 24 }}/>

            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
              {FREE_FEATURES.map((f, i) => (
                <li key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <Check size={14} style={{ color: 'var(--jade2)', flexShrink: 0, marginTop: 3 }}/>
                  <span style={{ fontSize: '.855rem', color: 'var(--p3)', lineHeight: 1.5 }}>{f}</span>
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

          {/* Premium card */}
          <div className="pricing-card pricing-card-premium">
            {/* Popular badge */}
            <div style={{
              position: 'absolute', top: 20, right: 20,
              background: 'linear-gradient(135deg, var(--au5), var(--au4))',
              borderRadius: 'var(--r-pill)',
              padding: '4px 12px',
              fontSize: '.65rem', color: 'var(--void)',
              fontWeight: 700, letterSpacing: '.1em',
              textTransform: 'uppercase',
              display: 'flex', alignItems: 'center', gap: 4,
            }}>
              <Star size={9} fill="currentColor"/> POPULAR
            </div>

            <div style={{
              fontSize: '.7rem', color: 'var(--au5)',
              fontFamily: 'var(--f-mono)', letterSpacing: '.18em',
              textTransform: 'uppercase', marginBottom: 20,
            }}>
              PREMIUM
            </div>
            <div style={{
              fontFamily: 'var(--f-title)',
              fontSize: '3rem', letterSpacing: '.04em',
              color: 'var(--au6)',
              textShadow: '0 0 32px rgba(228,168,36,0.30)',
              lineHeight: 1, marginBottom: 4,
            }}>
              Sob consulta
            </div>
            <div style={{ fontSize: '.82rem', color: 'var(--p4)', marginBottom: 32 }}>
              acesso ilimitado completo
            </div>

            <div style={{
              height: 1,
              background: 'linear-gradient(90deg, transparent, var(--b-gold), transparent)',
              marginBottom: 24,
            }}/>

            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 32 }}>
              {PREMIUM_FEATURES.map((f, i) => (
                <li key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <Check size={14} style={{ color: 'var(--au6)', flexShrink: 0, marginTop: 3 }}/>
                  <span style={{ fontSize: '.84rem', color: 'var(--p2)', lineHeight: 1.5 }}>{f}</span>
                </li>
              ))}
            </ul>

            <Link to="/premium" className="btn btn-gold" style={{ width: '100%', justifyContent: 'center' }}>
              <Zap size={14}/>
              Ativar Premium
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
