import { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';

const FEATURES = [
  {
    id: 'analise',
    emoji: '⚛️',
    label: 'Core',
    title: 'Análise Jurídica Quântica',
    desc: '16 agentes IA em paralelo analisam seu caso simultaneamente, com contraditório real via Advogado do Diabo e veredicto do Juiz IA Quantum.',
    tag: 'GRATUITO · PREMIUM',
    tagJade: false,
    route: null,
    cta: 'Analisar caso',
    scrollTo: 'analise',
  },
  {
    id: 'score',
    emoji: '📊',
    label: 'Score',
    title: 'JURIR Score Dimensional',
    desc: 'Pontuação multidimensional do seu caso: mérito jurídico, risco processual, probabilidade de êxito e solidez dos argumentos.',
    tag: 'PREMIUM',
    tagJade: false,
    route: null,
    cta: 'Ver score',
    scrollTo: 'analise',
  },
  {
    id: 'delta',
    emoji: '🔀',
    label: 'Delta Analysis',
    title: 'Delta Analysis',
    desc: 'Compare dois casos jurídicos. A IA mapeia divergências, precedentes conflitantes e variações de risco entre cenários distintos.',
    tag: 'PREMIUM',
    tagJade: false,
    route: '/delta',
    cta: 'Comparar casos',
  },
  {
    id: 'documentos',
    emoji: '📄',
    label: 'Documentos',
    title: 'Análise de Documentos',
    desc: 'Upload de contratos, petições ou decisões em PDF ou Word. Os 16 agentes extraem cláusulas, identificam riscos e geram análise completa.',
    tag: 'PREMIUM',
    tagJade: false,
    route: '/documentos',
    cta: 'Analisar documento',
  },
  {
    id: 'peticoes',
    emoji: '📝',
    label: 'Petições',
    title: 'Gerador de Petições',
    desc: 'Gere petições iniciais, recursos e contestações profissionais em .docx com fundamentação automática, citação de jurisprudência e formatação ABNT.',
    tag: 'PREMIUM',
    tagJade: false,
    route: '/peticoes',
    cta: 'Gerar petição',
  },
  {
    id: 'simulador',
    emoji: '🏛️',
    label: 'Simulador',
    title: 'Simulador de Instâncias',
    desc: 'Simule o percurso processual em 1ª instância, TJ, STJ e STF. Projete probabilidades de êxito, prazos e custos em cada grau de jurisdição.',
    tag: 'PREMIUM',
    tagJade: false,
    route: '/simulador',
    cta: 'Simular instâncias',
  },
  {
    id: 'monitoramento',
    emoji: '🔍',
    label: 'Monitoramento',
    title: 'Monitoramento Processual',
    desc: 'Acompanhe processos em tempo real via DATAJUD. Receba alertas automáticos sobre movimentações, publicações e prazos críticos.',
    tag: 'PREMIUM',
    tagJade: false,
    route: '/monitoramento',
    cta: 'Monitorar processo',
  },
  {
    id: 'historico',
    emoji: '📋',
    label: 'Histórico',
    title: 'Histórico de Análises',
    desc: 'Todas as suas análises salvas e organizadas. Revisite, compare e exporte relatórios completos em PDF com serial de autenticidade verificável.',
    tag: 'INCLUSO NO PREMIUM',
    tagJade: true,
    route: '/historico',
    cta: 'Ver histórico',
  },
];

function FeatureCard({ f, onCta }) {
  const cardRef = useRef(null);

  const handleEnter = () => {
    const el = cardRef.current;
    if (!el) return;
    el.style.background = 'var(--card-hover)';
    el.style.borderColor = 'rgba(0,242,254,0.20)';
    el.style.transform = 'translateY(-4px)';
    el.style.boxShadow = '0 0 0 1px rgba(0,242,254,0.2), 0 8px 48px rgba(0,0,0,0.7), 0 0 60px rgba(0,242,254,0.10)';
    el.querySelector('.fc-topbar').style.opacity = '1';
  };
  const handleLeave = () => {
    const el = cardRef.current;
    if (!el) return;
    el.style.background = 'var(--card)';
    el.style.borderColor = 'rgba(0,242,254,0.10)';
    el.style.transform = 'translateY(0)';
    el.style.boxShadow = 'none';
    el.querySelector('.fc-topbar').style.opacity = '0';
  };

  return (
    <div
      ref={cardRef}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      style={{
        position: 'relative',
        background: 'var(--card)',
        border: '1px solid rgba(0,242,254,0.10)',
        borderRadius: 'var(--r-lg)',
        padding: '28px 26px',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all .3s cubic-bezier(0.19,1,0.22,1)',
        overflow: 'hidden',
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* Gradient top bar (hover reveal) */}
      <div className="fc-topbar" style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 1,
        background: 'linear-gradient(90deg, #00f2fe 0%, #4facfe 100%)',
        opacity: 0,
        transition: 'opacity .3s',
      }} />

      {/* Label mono */}
      <div style={{
        fontFamily: 'var(--f-mono)', fontSize: '.58rem', color: 'var(--t4)',
        letterSpacing: '.18em', textTransform: 'uppercase', marginBottom: 16,
      }}>
        {f.label}
      </div>

      {/* Icon */}
      <div style={{
        fontSize: '1.5rem', marginBottom: 16,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        width: 48, height: 48, borderRadius: 'var(--r-md)',
        background: 'rgba(0,242,254,0.06)',
        border: '1px solid rgba(0,242,254,0.10)',
      }}>
        {f.emoji}
      </div>

      {/* Title */}
      <h3 style={{
        fontFamily: 'var(--f-sans)', fontSize: '.88rem', fontWeight: 600,
        color: 'var(--t0)', marginBottom: 8, letterSpacing: '.01em',
      }}>
        {f.title}
      </h3>

      {/* Desc */}
      <p style={{
        fontFamily: 'var(--f-display)', fontSize: '.8rem', color: 'var(--t3)',
        lineHeight: 1.65, fontWeight: 400, flex: 1,
      }}>
        {f.desc}
      </p>

      {/* Tag */}
      <div style={{
        display: 'inline-flex', alignItems: 'center',
        marginTop: 14, padding: '3px 9px',
        background: f.tagJade ? 'rgba(16,185,129,0.06)' : 'rgba(0,242,254,0.05)',
        border: f.tagJade
          ? '1px solid rgba(16,185,129,0.15)'
          : '1px solid rgba(0,242,254,0.10)',
        borderRadius: 999,
        fontFamily: 'var(--f-mono)', fontSize: '.52rem',
        color: f.tagJade ? 'var(--jade2)' : 'var(--co7)',
        letterSpacing: '.10em',
        alignSelf: 'flex-start',
      }}>
        {f.tag}
      </div>
    </div>
  );
}

export default function FeaturesSection() {
  const navigate = useNavigate();
  const { authToken, openModal } = useStore();

  const handleCta = (f) => {
    if (f.scrollTo) {
      document.getElementById(f.scrollTo)?.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    if (authToken) navigate(f.route);
    else openModal('register');
  };

  return (
    <section
      id="funcionalidades"
      style={{
        padding: 'clamp(60px,8vw,120px) 28px',
        background: 'var(--abyss)',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        position: 'relative',
        zIndex: 1,
        overflow: 'hidden',
      }}
    >
      {/* Top center light line */}
      <div style={{
        position: 'absolute', top: 0, left: '50%',
        transform: 'translateX(-50%)',
        width: 800, height: 1,
        background: 'linear-gradient(90deg,transparent,rgba(0,242,254,0.20),transparent)',
        pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: 1200, margin: '0 auto', textAlign: 'center' }}>

        {/* Header */}
        <div className="section-label" style={{ marginBottom: 18 }}>Plataforma Completa</div>
        <h2 className="t-display" style={{
          fontSize: 'clamp(2rem,4vw,3rem)', fontWeight: 300,
          color: 'var(--t0)', marginBottom: 14,
          letterSpacing: '-.025em', lineHeight: 1.1,
        }}>
          Todas as ferramentas que{' '}
          <span className="accent-cobalt" style={{ fontStyle: 'italic' }}>seu caso precisa</span>
        </h2>
        <p style={{
          fontFamily: 'var(--f-display)', fontSize: '.9rem', color: 'var(--t3)',
          lineHeight: 1.75, maxWidth: 540, margin: '0 auto 56px',
        }}>
          O JURIR não é apenas uma análise. É um ecossistema jurídico completo,
          do diagnóstico inicial até a petição pronta para protocolo.
        </p>

        {/* Grid 8 cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: 16,
        }}>
          {FEATURES.map(f => (
            <FeatureCard key={f.id} f={f} onCta={handleCta} />
          ))}
        </div>
      </div>
    </section>
  );
}
