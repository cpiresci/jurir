import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';

const FEATURES = [
  {
    id: 'delta',
    label: 'Delta Analysis',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <polygon points="14,4 26,24 2,24" stroke="var(--co7)" strokeWidth="1.5" fill="rgba(0,242,254,0.06)" strokeLinejoin="round"/>
        <line x1="14" y1="10" x2="14" y2="18" stroke="var(--co8)" strokeWidth="1.2"/>
        <circle cx="14" cy="20" r="1.2" fill="var(--co7)"/>
      </svg>
    ),
    title: 'Delta Analysis',
    desc: 'Compare dois casos jurídicos em paralelo. A IA mapeia divergências, precedentes conflitantes e variações de risco entre cenários distintos.',
    route: '/delta',
    cta: 'Comparar casos',
  },
  {
    id: 'documentos',
    label: 'Documentos',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <rect x="5" y="3" width="14" height="18" rx="2" stroke="var(--co7)" strokeWidth="1.5" fill="rgba(0,242,254,0.06)"/>
        <rect x="9" y="3" width="10" height="6" rx="1" stroke="var(--co8)" strokeWidth="1.2" fill="rgba(79,172,254,0.08)"/>
        <line x1="8" y1="14" x2="16" y2="14" stroke="var(--co9)" strokeWidth="1"/>
        <line x1="8" y1="17" x2="14" y2="17" stroke="var(--co9)" strokeWidth="1" opacity=".6"/>
        <path d="M17 17 L23 23" stroke="var(--co7)" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="20" cy="20" r="4" stroke="var(--co8)" strokeWidth="1.2" fill="rgba(0,242,254,0.06)"/>
      </svg>
    ),
    title: 'Upload de Documentos',
    desc: 'Envie contratos, petições ou decisões em PDF ou Word. Os 16 agentes extraem cláusulas, identificam riscos e geram análise completa.',
    route: '/documentos',
    cta: 'Analisar documento',
  },
  {
    id: 'peticoes',
    label: 'Petições',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <rect x="4" y="3" width="16" height="20" rx="2" stroke="var(--co7)" strokeWidth="1.5" fill="rgba(0,242,254,0.06)"/>
        <line x1="8" y1="9" x2="16" y2="9" stroke="var(--co8)" strokeWidth="1.2"/>
        <line x1="8" y1="13" x2="16" y2="13" stroke="var(--co9)" strokeWidth="1" opacity=".7"/>
        <line x1="8" y1="17" x2="13" y2="17" stroke="var(--co9)" strokeWidth="1" opacity=".5"/>
        <path d="M19 18 L24 13 L22 11 L17 16 L17 19 Z" stroke="var(--co7)" strokeWidth="1.2" fill="rgba(0,242,254,0.08)" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'Gerador de Petições',
    desc: 'Gere petições iniciais, recursos e contestações profissionais em .docx com fundamentação automática, citação de jurisprudência e formatação ABNT.',
    route: '/peticoes',
    cta: 'Gerar petição',
  },
  {
    id: 'simulador',
    label: 'Simulador',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <rect x="3" y="6" width="22" height="16" rx="2" stroke="var(--co7)" strokeWidth="1.5" fill="rgba(0,242,254,0.06)"/>
        <path d="M3 10 H25" stroke="var(--co8)" strokeWidth="1" opacity=".5"/>
        <circle cx="7" cy="8" r="1" fill="var(--co9)" opacity=".7"/>
        <circle cx="10" cy="8" r="1" fill="var(--co9)" opacity=".5"/>
        <path d="M8 15 L12 13 L16 16 L20 12" stroke="var(--co7)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <circle cx="20" cy="12" r="1.5" fill="var(--co8)"/>
      </svg>
    ),
    title: 'Simulador de Instâncias',
    desc: 'Simule o percurso processual em 1ª instância, TJ, STJ e STF. Projete probabilidades de êxito, prazos e custos em cada grau de jurisdição.',
    route: '/simulador',
    cta: 'Simular instâncias',
  },
  {
    id: 'monitoramento',
    label: 'Monitoramento',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <circle cx="14" cy="14" r="10" stroke="var(--co7)" strokeWidth="1.5" fill="rgba(0,242,254,0.04)"/>
        <path d="M14 8 L14 14 L18 17" stroke="var(--co8)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="14" cy="14" r="1.5" fill="var(--co7)"/>
        <path d="M4 14 Q9 8 14 14 Q19 20 24 14" stroke="var(--co9)" strokeWidth="1" opacity=".4" fill="none"/>
      </svg>
    ),
    title: 'Monitoramento Processual',
    desc: 'Acompanhe processos em tempo real via DATAJUD. Receba alertas automáticos sobre movimentações, publicações e prazos críticos.',
    route: '/monitoramento',
    cta: 'Monitorar processo',
  },
  {
    id: 'verificar',
    label: 'Verificar',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <shield-like>
          <path d="M14 3 L23 7 L23 15 C23 20 14 25 14 25 C14 25 5 20 5 15 L5 7 Z" stroke="var(--co7)" strokeWidth="1.5" fill="rgba(0,242,254,0.06)" strokeLinejoin="round"/>
          <path d="M10 14 L13 17 L18 11" stroke="var(--co8)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </shield-like>
      </svg>
    ),
    title: 'Verificar Relatório',
    desc: 'Autentique qualquer relatório JURIR pelo código serial único. Confirme integridade, data de emissão e identidade do subscritor.',
    route: '/verificar',
    cta: 'Verificar autenticidade',
  },
];

export default function FeaturesSection() {
  const navigate = useNavigate();
  const { authToken, openModal } = useStore();

  const handleCta = (route) => {
    if (authToken) navigate(route);
    else openModal('register');
  };

  return (
    <section id="funcionalidades" style={{ padding: '100px 24px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 72 }}>
          <div className="section-label" style={{ marginBottom: 20 }}>Funcionalidades</div>
          <h2 className="t-display" style={{
            fontSize: 'clamp(1.9rem,4vw,2.8rem)', fontWeight: 400,
            color: 'var(--t0)', marginBottom: 14, letterSpacing: '-.02em',
          }}>
            Inteligência jurídica em{' '}
            <span className="accent-cobalt" style={{ fontStyle: 'italic' }}>cada módulo</span>
          </h2>
          <p style={{ color: 'var(--t3)', fontSize: '.9rem', lineHeight: 1.7, maxWidth: 520, margin: '0 auto' }}>
            Seis ferramentas especializadas, construídas para advogados que não aceitam metade do caminho.
          </p>
        </div>

        {/* Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))',
          gap: 20,
        }}>
          {FEATURES.map((f) => (
            <div
              key={f.id}
              style={{
                position: 'relative',
                background: 'rgba(0,242,254,0.03)',
                border: '1px solid rgba(0,242,254,0.10)',
                borderRadius: 'var(--r-card)',
                padding: '32px 28px',
                display: 'flex',
                flexDirection: 'column',
                gap: 0,
                transition: 'border-color .2s, box-shadow .2s, background .2s',
                cursor: 'default',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'rgba(0,242,254,0.25)';
                e.currentTarget.style.boxShadow = '0 0 32px rgba(0,242,254,0.07)';
                e.currentTarget.style.background = 'rgba(0,242,254,0.05)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'rgba(0,242,254,0.10)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.background = 'rgba(0,242,254,0.03)';
              }}
            >
              {/* Top accent line */}
              <div style={{
                position: 'absolute', top: 0, left: 24, right: 24, height: 1,
                background: 'linear-gradient(90deg, transparent, rgba(0,242,254,0.18), transparent)',
              }}/>

              {/* Label mono */}
              <div style={{
                fontFamily: 'var(--f-mono)', fontSize: '.6rem', color: 'var(--t4)',
                letterSpacing: '.16em', textTransform: 'uppercase', marginBottom: 20,
              }}>
                {f.label}
              </div>

              {/* Icon */}
              <div style={{ marginBottom: 20 }}>{f.icon}</div>

              {/* Title */}
              <h3 style={{
                fontFamily: 'var(--f-display)', fontSize: '1.35rem', fontWeight: 400,
                color: 'var(--t0)', marginBottom: 12, letterSpacing: '-.01em',
              }}>
                {f.title}
              </h3>

              {/* Description */}
              <p style={{
                fontSize: '.855rem', color: 'var(--t3)', lineHeight: 1.65,
                marginBottom: 28, flexGrow: 1,
              }}>
                {f.desc}
              </p>

              {/* CTA */}
              <button
                className="btn btn-ghost btn-sm"
                style={{ alignSelf: 'flex-start' }}
                onClick={() => handleCta(f.route)}
              >
                {f.cta} →
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
