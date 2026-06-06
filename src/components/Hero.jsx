import { ArrowRight, Zap, ChevronDown } from 'lucide-react';
import { useStore } from '../store';

const STATS = [
  { val: '16',    label: 'Agentes em paralelo',  sub: 'especializados' },
  { val: '<3min', label: 'Análise Premium',       sub: 'SSE streaming' },
  { val: '100%',  label: 'Contraditório',         sub: 'obrigatório' },
  { val: '4D',    label: 'JURIR Score',           sub: 'dimensional' },
];

const BADGES = [
  'Direito Civil', 'Penal', 'Trabalhista', 'Família',
  'Tributário', 'Empresarial', 'Imobiliário', 'Digital',
  'Ambiental', 'Constitucional', '+6 áreas',
];

export default function Hero() {
  const { openModal } = useStore();
  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  return (
    <section className="hero-section">
      {/* Architectural overlays */}
      <div className="hero-grid" />
      <div className="hero-noise" />
      <div className="hero-corner" />
      <div className="hero-corner-bl" />

      {/* Main content */}
      <div className="hero-main">
        {/* Counter label */}
        <div className="hero-counter">
          <Zap size={10} style={{ color: 'rgba(255,255,255,0.5)' }} />
          16-Agent AI Legal Engine · Quantum Supremacy v13
        </div>

        {/* Massive title */}
        <h1 className="hero-title">
          <span className="line-outline">A plataforma</span>
          <span className="line-solid">do Direito.</span>
        </h1>

        {/* Tagline + CTA row */}
        <div className="hero-tagline-wrap">
          <div>
            <p className="hero-tagline">
              <strong>16 especialistas em IA</strong> analisam seu caso simultaneamente.<br />
              Contraditório completo. Juiz IA Quantum. JURIR Score dimensional.
            </p>
            <div className="hero-ctas">
              <button className="btn btn-flame btn-xl" onClick={() => scrollTo('analise')}>
                Analisar Agora <ArrowRight size={16} />
              </button>
              <button className="btn btn-ghost btn-xl" onClick={() => scrollTo('agentes')}>
                Ver os 16 Agentes
              </button>
            </div>
          </div>
        </div>

        {/* Area badges */}
        <div className="hero-badges" style={{ marginTop: 36 }}>
          {BADGES.map((b, i) => (
            <span key={i} className="hero-badge">{b}</span>
          ))}
        </div>
      </div>

      {/* Stats bar — inside crimson section */}
      <div className="hero-stats-wrapper">
        <div className="hero-stats-row">
          {STATS.map((s, i) => (
            <div key={i} className="hero-stat-cell">
              <div className="hero-stat-num">{s.val}</div>
              <div className="hero-stat-lbl">{s.label}</div>
              <div style={{ fontFamily: 'var(--f-mono)', fontSize: '.58rem', color: 'rgba(255,255,255,0.35)', marginTop: 2, letterSpacing: '.12em' }}>{s.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll cue */}
      <div style={{
        position: 'relative', zIndex: 1,
        display: 'flex', justifyContent: 'center',
        padding: '20px 0 140px',
        animation: 'pulse 2.5s ease-in-out infinite',
      }}>
        <ChevronDown size={20} style={{ color: 'rgba(255,255,255,0.4)' }} />
      </div>
    </section>
  );
}
