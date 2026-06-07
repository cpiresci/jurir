import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Zap, Shield, Scale } from 'lucide-react';
import { useStore } from '../store';

function CountUp({ target, suffix = '' }) {
  const [val, setVal] = useState(0);
  const started = useRef(false);
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const dur = 1800;
    const start = performance.now();
    const num = parseFloat(target);
    if (isNaN(num)) { setVal(target); return; }
    const run = (now) => {
      const t = Math.min((now - start) / dur, 1);
      const ease = 1 - Math.pow(1 - t, 4);
      setVal(Math.round(ease * num));
      if (t < 1) requestAnimationFrame(run);
    };
    requestAnimationFrame(run);
  }, [target]);
  return <>{isNaN(parseFloat(target)) ? target : val}{suffix}</>;
}

const STATS = [
  { val: '16',    suffix: '',    label: 'Agentes Especialistas', icon: '⚖️' },
  { val: '3',     suffix: 'min', label: 'Análise Completa',      icon: '⚡' },
  { val: '100',   suffix: '%',   label: 'Contraditório Real',     icon: '🛡️' },
  { val: '50000', suffix: '+',   label: 'Análises Realizadas',    icon: '📋' },
];

const AREAS = [
  'Direito Civil', 'Direito Penal', 'Direito Trabalhista',
  'Direito de Família', 'Direito Digital', 'Direito Tributário',
  'Direito Empresarial', 'Direito Constitucional',
];

/* ─── ScoreRing: animated SVG ring — purely decorative ── */
function ScoreRing({ size = 120, score = 87, visible }) {
  const R = (size / 2) - 10;
  const C = 2 * Math.PI * R;
  const [animScore, setAnimScore] = useState(0);

  useEffect(() => {
    if (!visible) return;
    let start = null;
    const dur = 2200;
    const run = (ts) => {
      if (!start) start = ts;
      const t = Math.min((ts - start) / dur, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      setAnimScore(Math.round(ease * score));
      if (t < 1) requestAnimationFrame(run);
    };
    const raf = requestAnimationFrame(run);
    return () => cancelAnimationFrame(raf);
  }, [visible, score]);

  const fill = C - (animScore / 100) * C;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: 'block' }}>
      {/* Background track */}
      <circle
        cx={size / 2} cy={size / 2} r={R}
        fill="none"
        stroke="rgba(20,114,217,0.08)"
        strokeWidth={6}
      />
      {/* Glow filter */}
      <defs>
        <filter id="ring-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <linearGradient id="ring-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="var(--co6)"/>
          <stop offset="100%" stopColor="#a78bfa"/>
        </linearGradient>
      </defs>
      {/* Filled arc */}
      <circle
        cx={size / 2} cy={size / 2} r={R}
        fill="none"
        stroke="url(#ring-grad)"
        strokeWidth={6}
        strokeLinecap="round"
        strokeDasharray={C}
        strokeDashoffset={fill}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        filter="url(#ring-glow)"
        style={{ transition: 'stroke-dashoffset .05s linear' }}
      />
      {/* Center score */}
      <text x="50%" y="44%" textAnchor="middle" dominantBaseline="middle"
        style={{ fontFamily: 'var(--f-display)', fontSize: size * 0.22, fontWeight: 600, fill: 'var(--co7)' }}>
        {animScore}
      </text>
      <text x="50%" y="64%" textAnchor="middle" dominantBaseline="middle"
        style={{ fontFamily: 'var(--f-mono)', fontSize: size * 0.095, fill: 'var(--t4)', letterSpacing: '0.08em' }}>
        SCORE
      </text>
    </svg>
  );
}

export default function Hero() {
  const { openModal } = useStore();
  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  const [visible, setVisible] = useState(false);
  const [activeArea, setActiveArea] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setActiveArea(v => (v + 1) % AREAS.length), 2200);
    return () => clearInterval(interval);
  }, []);

  return (
    <section style={{
      minHeight: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '0 24px', paddingTop: 64,
      position: 'relative',
      overflow: 'hidden',
    }}>

      {/* Decorative marble column lines */}
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 1, background: 'linear-gradient(180deg, transparent, rgba(20,114,217,0.12), transparent)', pointerEvents: 'none' }}/>
      <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 1, background: 'linear-gradient(180deg, transparent, rgba(20,114,217,0.12), transparent)', pointerEvents: 'none' }}/>

      {/* Floating legal area badge */}
      <div style={{
        position: 'absolute', top: 100, right: '8%',
        background: 'var(--bg-card)', border: '1px solid var(--b-cobalt)',
        borderRadius: 'var(--r-md)', padding: '10px 18px',
        boxShadow: 'var(--shadow-cobalt)',
        fontFamily: 'var(--f-mono)', fontSize: '.68rem',
        color: 'var(--co7)', letterSpacing: '.08em',
        opacity: visible ? 1 : 0,
        transition: 'opacity .6s .5s',
        display: 'flex', alignItems: 'center', gap: 8,
        pointerEvents: 'none',
      }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--jade2)', boxShadow: '0 0 6px var(--jade2)', animation: 'pulse 2s ease-in-out infinite', flexShrink: 0 }}/>
        {AREAS[activeArea]}
      </div>

      {/* ── Score Ring — decorative, bottom-left ── */}
      <div style={{
        position: 'absolute', bottom: '18%', left: '5%',
        background: 'var(--bg-card)', border: '1px solid var(--b-main)',
        borderRadius: 'var(--r-lg)', padding: '20px 22px',
        boxShadow: 'var(--shadow-float)',
        opacity: visible ? 1 : 0,
        transition: 'opacity .6s .7s',
        pointerEvents: 'none',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
      }}>
        <ScoreRing size={110} score={87} visible={visible} />
        <span style={{ fontFamily: 'var(--f-mono)', fontSize: '.58rem', color: 'var(--t4)', letterSpacing: '.1em' }}>
          JURIR SCORE
        </span>
      </div>

      {/* Floating verdict card right */}
      <div style={{
        position: 'absolute', bottom: '28%', right: '5%',
        background: 'var(--bg-card)', border: '1px solid rgba(16,185,129,0.2)',
        borderRadius: 'var(--r-md)', padding: '12px 18px',
        boxShadow: '0 0 0 1px rgba(16,185,129,0.12), 0 4px 24px rgba(16,185,129,0.08)',
        opacity: visible ? 1 : 0, transition: 'opacity .6s .9s',
        pointerEvents: 'none',
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>⚖️</div>
        <div>
          <div style={{ fontFamily: 'var(--f-sans)', fontSize: '.75rem', fontWeight: 600, color: 'var(--jade2)' }}>Veredicto Favorável</div>
          <div style={{ fontFamily: 'var(--f-mono)', fontSize: '.6rem', color: 'var(--t4)', letterSpacing: '.06em' }}>SCORE 87/100</div>
        </div>
      </div>

      {/* Main content */}
      <div style={{ maxWidth: 900, textAlign: 'center', position: 'relative', zIndex: 1 }}>

        {/* Top label */}
        <div className="hero-badge fade-up" style={{ marginBottom: 40, opacity: visible ? 1 : 0, display: 'inline-flex' }}>
          <Zap size={10} style={{ color: 'var(--co7)' }}/>
          Inteligência Jurídica de Nova Geração
          <span style={{ color: 'var(--t4)', margin: '0 4px' }}>·</span>
          <span style={{ color: 'var(--co7)' }}>v10.0</span>
        </div>

        {/* Headline */}
        <h1 className="hero-title fade-up fade-up-1" style={{ marginBottom: 32, opacity: visible ? 1 : 0 }}>
          A plataforma jurídica que{' '}
          <span className="accent-cobalt" style={{ fontStyle: 'italic' }}>16 especialistas</span>
          {' '}não conseguiriam superar.
        </h1>

        {/* Subline */}
        <p className="fade-up fade-up-2" style={{
          fontSize: '1.05rem', color: 'var(--t3)',
          maxWidth: 620, margin: '0 auto 16px',
          lineHeight: 1.75, opacity: visible ? 1 : 0,
          fontFamily: 'var(--f-display)', fontWeight: 300,
          letterSpacing: '.01em',
        }}>
          Dezesseis agentes de IA em paralelo analisam cada faceta do seu caso.
          Advogado do Diabo confronta. Juiz IA Quantum prolata o veredicto.
        </p>

        {/* Legal latin */}
        <div className="fade-up fade-up-3" style={{ opacity: visible ? 1 : 0, marginBottom: 48 }}>
          <span style={{
            fontFamily: 'var(--f-display)', fontStyle: 'italic',
            fontSize: '.85rem', color: 'var(--t5)', letterSpacing: '.06em',
          }}>
            "Iustitia est constans et perpetua voluntas ius suum cuique tribuendi"
          </span>
        </div>

        {/* CTA buttons */}
        <div className="fade-up fade-up-3" style={{
          display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap',
          marginBottom: 72, opacity: visible ? 1 : 0,
        }}>
          <button className="btn btn-cobalt btn-lg" onClick={() => scrollTo('analise')}>
            Analisar Meu Caso <ArrowRight size={16}/>
          </button>
          <button className="btn btn-ghost btn-lg" onClick={() => openModal('register')}>
            Criar Conta Gratuita
          </button>
        </div>

        {/* Stats bar */}
        <div className="fade-up fade-up-3" style={{
          opacity: visible ? 1 : 0,
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 1, background: 'var(--b-main)',
          borderRadius: 'var(--r-lg)', overflow: 'hidden',
          boxShadow: 'var(--shadow-card)',
          maxWidth: 720, margin: '0 auto',
        }}>
          {STATS.map((s, i) => (
            <div key={i} style={{
              background: 'var(--bg-card)', padding: '24px 16px',
              textAlign: 'center', position: 'relative',
            }}>
              <div style={{
                fontFamily: 'var(--f-display)',
                fontSize: 'clamp(1.6rem, 3vw, 2.2rem)',
                fontWeight: 600, color: 'var(--co7)', lineHeight: 1,
                marginBottom: 6,
              }}>
                <CountUp target={s.val}/>{s.suffix}
              </div>
              <div style={{
                fontFamily: 'var(--f-mono)',
                fontSize: '.6rem', color: 'var(--t4)',
                letterSpacing: '.1em', textTransform: 'uppercase',
              }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* Scroll hint */}
        <div style={{
          marginTop: 52, opacity: visible ? 0.4 : 0,
          transition: 'opacity .6s 1.2s',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
        }}>
          <div style={{
            width: 1, height: 36,
            background: 'linear-gradient(180deg, var(--co7), transparent)',
          }}/>
          <span style={{ fontFamily: 'var(--f-mono)', fontSize: '.6rem', color: 'var(--t4)', letterSpacing: '.18em' }}>
            SCROLL
          </span>
        </div>
      </div>
    </section>
  );
}
