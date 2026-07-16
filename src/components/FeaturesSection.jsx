import { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';

const FEATURES = [
  {
    id: 'analise',
    emoji: '⚛️',
    label: 'Core',
    title: 'Análise Jurídica por IA',
    desc: '16 agentes IA em paralelo analisam seu caso simultaneamente, com contraditório real via Advogado do Diabo e veredicto do Juiz IA Quantum.',
    tag: 'GRATUITO · PREMIUM',
    tagJade: false,
    route: null,
    cta: 'Analisar caso',
    scrollTo: 'analise',
    accent: '#00f2fe',
    glowColor: 'rgba(0,242,254,0.18)',
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
    accent: '#4facfe',
    glowColor: 'rgba(79,172,254,0.18)',
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
    accent: '#a78bfa',
    glowColor: 'rgba(167,139,250,0.18)',
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
    accent: '#f59e0b',
    glowColor: 'rgba(245,158,11,0.18)',
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
    accent: '#34d399',
    glowColor: 'rgba(52,211,153,0.18)',
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
    accent: '#f472b6',
    glowColor: 'rgba(244,114,182,0.18)',
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
    accent: '#fb923c',
    glowColor: 'rgba(251,146,60,0.18)',
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
    accent: '#10b981',
    glowColor: 'rgba(16,185,129,0.18)',
  },
  {
    id: 'inventario',
    emoji: '🏛️',
    label: 'Inventário',
    title: 'Triagem de Inventário',
    desc: 'Calcule o ITCMD estimado por estado e descubra se o inventário cabe via extrajudicial (cartório) ou exige via judicial, com base no CPC e na Resolução CNJ 571/2024.',
    tag: 'PREMIUM',
    tagJade: false,
    route: '/inventario',
    cta: 'Fazer triagem',
    accent: '#c084fc',
    glowColor: 'rgba(192,132,252,0.18)',
  },
  {
    id: 'trabalhista',
    emoji: '💼',
    label: 'Trabalhista',
    title: 'Calculadora Trabalhista',
    desc: 'Verbas rescisórias, insalubridade, periculosidade, simulador de valor de acordo e estimador de dano moral — tudo com base na CLT.',
    tag: 'GRATUITO',
    tagJade: true,
    route: '/trabalhista',
    cta: 'Calcular verbas',
    accent: '#fbbf24',
    glowColor: 'rgba(251,191,36,0.18)',
  },
];

function FeatureCard({ f, onCta, index }) {
  const cardRef = useRef(null);
  const [hovered, setHovered] = useState(false);

  const handleEnter = () => setHovered(true);
  const handleLeave = () => setHovered(false);

  const handleMouseMove = (e) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    el.style.setProperty('--mx', `${x}%`);
    el.style.setProperty('--my', `${y}%`);
  };

  return (
    <div
      ref={cardRef}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      onMouseMove={handleMouseMove}
      style={{
        position: 'relative',
        borderRadius: 'var(--r-lg)',
        padding: '26px 24px 22px',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform .35s cubic-bezier(0.19,1,0.22,1), box-shadow .35s ease',
        overflow: 'hidden',
        cursor: 'pointer',
        background: hovered
          ? `radial-gradient(160px circle at var(--mx,50%) var(--my,50%), ${f.glowColor}, transparent 70%), rgba(255,255,255,0.048)`
          : 'rgba(255,255,255,0.028)',
        border: `1px solid ${hovered ? f.accent + '35' : 'rgba(255,255,255,0.07)'}`,
        boxShadow: hovered
          ? `0 0 0 1px ${f.accent}22, 0 12px 48px rgba(0,0,0,0.75), 0 0 80px ${f.glowColor}`
          : '0 1px 0 0 rgba(255,255,255,0.04)',
        transform: hovered ? 'translateY(-5px) scale(1.01)' : 'translateY(0) scale(1)',
        animationDelay: `${index * 60}ms`,
      }}
      onClick={() => onCta(f)}
    >
      {/* Accent top line */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 1,
        background: `linear-gradient(90deg, transparent, ${f.accent}90, transparent)`,
        opacity: hovered ? 1 : 0,
        transition: 'opacity .3s',
      }} />

      {/* Shimmer corner */}
      <div style={{
        position: 'absolute', top: -30, right: -30,
        width: 80, height: 80,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${f.accent}18, transparent 70%)`,
        opacity: hovered ? 1 : 0,
        transition: 'opacity .4s',
        pointerEvents: 'none',
      }} />

      {/* Label mono */}
      <div style={{
        fontFamily: 'var(--f-mono)', fontSize: 'var(--fs-xs)', color: f.accent,
        letterSpacing: '.20em', textTransform: 'uppercase', marginBottom: 14,
        opacity: hovered ? 1 : 0.6,
        transition: 'opacity .2s',
      }}>
        {f.label}
      </div>

      {/* Icon box */}
      <div style={{
        fontSize: 'var(--fs-2xl)', marginBottom: 14,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        width: 46, height: 46, borderRadius: 'var(--r-md)',
        background: hovered ? `${f.accent}14` : 'rgba(255,255,255,0.04)',
        border: `1px solid ${hovered ? f.accent + '30' : 'rgba(255,255,255,0.07)'}`,
        transition: 'all .3s',
        boxShadow: hovered ? `0 0 20px ${f.glowColor}` : 'none',
      }}>
        {f.emoji}
      </div>

      {/* Title */}
      <h3 style={{
        fontFamily: 'var(--f-sans)', fontSize: 'var(--fs-base)', fontWeight: 600,
        color: hovered ? '#fff' : 'rgba(255,255,255,0.88)',
        marginBottom: 8, letterSpacing: '.01em',
        transition: 'color .2s',
      }}>
        {f.title}
      </h3>

      {/* Desc */}
      <p style={{
        fontFamily: 'var(--f-display)', fontSize: 'var(--fs-xs)',
        color: 'var(--t3)',
        lineHeight: 1.65, fontWeight: 400, flex: 1,
      }}>
        {f.desc}
      </p>

      {/* Footer row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 }}>
        {/* Tag pill */}
        <div style={{
          display: 'inline-flex', alignItems: 'center',
          padding: '3px 9px',
          background: f.tagJade ? 'rgba(16,185,129,0.07)' : `${f.accent}0d`,
          border: f.tagJade ? '1px solid rgba(16,185,129,0.18)' : `1px solid ${f.accent}22`,
          borderRadius: 999,
          fontFamily: 'var(--f-mono)', fontSize: 'var(--fs-xs)',
          color: f.tagJade ? 'var(--jade2)' : f.accent,
          letterSpacing: '.10em',
        }}>
          {f.tag}
        </div>

        {/* CTA arrow */}
        <div style={{
          width: 28, height: 28,
          borderRadius: '50%',
          background: hovered ? f.accent : 'rgba(255,255,255,0.04)',
          border: `1px solid ${hovered ? f.accent : 'rgba(255,255,255,0.10)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all .25s',
          fontSize: 'var(--fs-xs)',
          color: hovered ? '#07070A' : 'rgba(255,255,255,0.35)',
          fontWeight: 700,
          flexShrink: 0,
        }}>
          →
        </div>
      </div>
    </div>
  );
}

// Linha de conexão decorativa entre cards (SVG)
function ConnectionLines() {
  return (
    <div style={{
      position: 'absolute', inset: 0, pointerEvents: 'none',
      overflow: 'hidden', zIndex: 0,
    }}>
      <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <linearGradient id="line-grad-h" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="30%" stopColor="rgba(0,242,254,0.12)" />
            <stop offset="70%" stopColor="rgba(0,242,254,0.12)" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
          <linearGradient id="line-grad-v" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="30%" stopColor="rgba(0,242,254,0.07)" />
            <stop offset="70%" stopColor="rgba(0,242,254,0.07)" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>
        {/* Horizontal center line */}
        <line x1="5%" y1="50%" x2="95%" y2="50%"
          stroke="url(#line-grad-h)" strokeWidth="1"
          strokeDasharray="4 8" />
        {/* Vertical center line */}
        <line x1="50%" y1="5%" x2="50%" y2="95%"
          stroke="url(#line-grad-v)" strokeWidth="1"
          strokeDasharray="4 8" />
        {/* Corner dots */}
        {[['5%','5%'],['95%','5%'],['5%','95%'],['95%','95%'],['50%','5%'],['50%','95%'],['5%','50%'],['95%','50%']].map(([cx,cy],i) => (
          <circle key={i} cx={cx} cy={cy} r="2" fill="rgba(0,242,254,0.20)" />
        ))}
      </svg>
    </div>
  );
}

export default function FeaturesSection() {
  const navigate = useNavigate();
  const { authToken, openModal } = useStore();
  const sectionRef = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold: 0.08 }
    );
    if (sectionRef.current) obs.observe(sectionRef.current);
    return () => obs.disconnect();
  }, []);

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
      ref={sectionRef}
      id="funcionalidades"
      style={{
        padding: 'clamp(72px,9vw,130px) 28px',
        background: 'var(--abyss)',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        position: 'relative',
        zIndex: 1,
        overflow: 'hidden',
      }}
    >
      {/* Background grid */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: `
          linear-gradient(rgba(0,242,254,0.025) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,242,254,0.025) 1px, transparent 1px)
        `,
        backgroundSize: '80px 80px',
        maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)',
      }} />

      {/* Top glow */}
      <div style={{
        position: 'absolute', top: -1, left: '50%',
        transform: 'translateX(-50%)',
        width: 600, height: 1,
        background: 'linear-gradient(90deg,transparent,rgba(0,242,254,0.30),transparent)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', top: 0, left: '50%',
        transform: 'translateX(-50%)',
        width: 500, height: 160,
        background: 'radial-gradient(ellipse at 50% 0%, rgba(0,242,254,0.06), transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative', zIndex: 1 }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <div className="section-label" style={{ marginBottom: 18 }}>Plataforma Completa</div>
          <h2 className="t-display" style={{
            fontSize: 'clamp(2rem,4vw,3rem)', fontWeight: 300,
            color: 'var(--t0)', marginBottom: 16,
            letterSpacing: '-.025em', lineHeight: 1.1,
          }}>
            Todas as ferramentas que{' '}
            <span className="accent-cobalt" style={{ fontStyle: 'italic' }}>seu caso precisa</span>
          </h2>
          <p style={{
            fontFamily: 'var(--f-display)', fontSize: 'var(--fs-base)', color: 'var(--t3)',
            lineHeight: 1.75, maxWidth: 520, margin: '0 auto',
          }}>
            O JURIR não é apenas uma análise. É um ecossistema jurídico completo,
            do diagnóstico inicial até a petição pronta para protocolo.
          </p>

          {/* Stats bar */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: 32, marginTop: 36, flexWrap: 'wrap',
          }}>
            {[
              { n: '16', label: 'Agentes IA' },
              { n: '10', label: 'Ferramentas' },
              { n: '16', label: 'Áreas do Direito' },
              { n: '100%', label: 'Jurisprudência BR' },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{
                  fontFamily: 'var(--f-mono)', fontSize: 'var(--fs-lg)', fontWeight: 600,
                  color: 'var(--co7)', letterSpacing: '.04em',
                }}>{s.n}</div>
                <div style={{
                  fontFamily: 'var(--f-mono)', fontSize: 'var(--fs-xs)',
                  color: 'var(--t3)', letterSpacing: '.14em',
                  textTransform: 'uppercase', marginTop: 2,
                }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Cards grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(268px, 1fr))',
          gap: 14,
          position: 'relative',
        }}>
          <ConnectionLines />
          {FEATURES.map((f, i) => (
            <div
              key={f.id}
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0)' : 'translateY(20px)',
                transition: `opacity .5s ease ${i * 55}ms, transform .5s ease ${i * 55}ms`,
              }}
            >
              <FeatureCard f={f} onCta={handleCta} index={i} />
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div style={{ textAlign: 'center', marginTop: 56 }}>
          <p style={{
            fontFamily: 'var(--f-mono)', fontSize: 'var(--fs-xs)',
            color: 'var(--t4)', letterSpacing: '.18em',
            textTransform: 'uppercase', marginBottom: 18,
          }}>
            Comece gratuitamente · Sem cartão de crédito
          </p>
          <button
            onClick={() => openModal('register')}
            style={{
              fontFamily: 'var(--f-sans)', fontSize: 'var(--fs-sm)', fontWeight: 600,
              color: '#07070A',
              background: 'linear-gradient(135deg, #00f2fe, #4facfe)',
              border: 'none', borderRadius: 'var(--r-md)',
              padding: '12px 32px', cursor: 'pointer',
              letterSpacing: '.03em',
              boxShadow: '0 0 40px rgba(0,242,254,0.25)',
              transition: 'box-shadow .25s, transform .2s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.boxShadow = '0 0 60px rgba(0,242,254,0.4)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.boxShadow = '0 0 40px rgba(0,242,254,0.25)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            Acessar plataforma completa →
          </button>
        </div>
      </div>
    </section>
  );
}
