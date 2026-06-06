import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Zap, Shield, Scale, Star } from 'lucide-react';
import { useStore } from '../store';

const STATS = [
  { icon: <Zap size={15}/>,    val: '16',     label: 'Agentes Especialistas', color: 'var(--au6)' },
  { icon: <Shield size={15}/>, val: '<3min',  label: 'Análise Completa',      color: 'var(--cr4)' },
  { icon: <Scale size={15}/>,  val: '100%',   label: 'Contraditório',         color: 'var(--jade2)' },
];

/* Animated number counter */
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

export default function Hero() {
  const { openModal } = useStore();
  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  // Staggered reveal
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <section style={{
      minHeight: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '0 24px', paddingTop: 72,
      position: 'relative',
    }}>
      {/* Decorative horizontal rule — Roman numeral style */}
      <div style={{
        position: 'absolute', top: 120, left: '50%', transform: 'translateX(-50%)',
        display: 'flex', alignItems: 'center', gap: 16, opacity: 0.35,
        pointerEvents: 'none',
      }}>
        <div style={{ width: 80, height: 1, background: 'linear-gradient(90deg, transparent, var(--au5))' }}/>
        <span style={{ fontFamily: 'var(--f-mono)', fontSize: '.6rem', color: 'var(--au5)', letterSpacing: '.3em' }}>
          LEX · IUSTITIA · AEQUITAS
        </span>
        <div style={{ width: 80, height: 1, background: 'linear-gradient(90deg, var(--au5), transparent)' }}/>
      </div>

      <div style={{ maxWidth: 860, textAlign: 'center', position: 'relative' }}>

        {/* Version badge */}
        <div
          className="hero-badge fade-up"
          style={{ marginBottom: 36, opacity: visible ? 1 : 0 }}
        >
          <Zap size={10} style={{ color: 'var(--au6)' }}/>
          <span>Inteligência Jurídica Quântica</span>
          <span style={{ color: 'var(--p5)', margin: '0 4px' }}>·</span>
          <span style={{ color: 'var(--cr4)' }}>v10.0</span>
        </div>

        {/* Main headline */}
        <h1
          className="hero-title fade-up fade-up-1"
          style={{ marginBottom: 28, opacity: visible ? 1 : 0 }}
        >
          O parecer que um{' '}
          <span className="accent-gold">escritório inteiro</span>
          {' '}não consegue dar em um dia,{' '}
          <span className="accent-cr">em minutos.</span>
        </h1>

        {/* Sub-headline with animated stat */}
        <p
          className="fade-up fade-up-2"
          style={{
            fontSize: '1.05rem', color: 'var(--p4)',
            maxWidth: 600, margin: '0 auto 16px',
            lineHeight: 1.75, opacity: visible ? 1 : 0,
          }}
        >
          16 agentes de IA especializados analisam seu caso em paralelo.
          Advogado do Diabo apresenta o contraditório.
          Juiz IA Quantum prolata o veredicto final.
        </p>

        {/* Decorative legal latin */}
        <p
          className="fade-up fade-up-3"
          style={{
            fontFamily: 'var(--f-display)',
            fontStyle: 'italic',
            fontSize: '.88rem',
            color: 'var(--p5)',
            marginBottom: 44,
            letterSpacing: '.04em',
            opacity: visible ? 1 : 0,
          }}
        >
          "Audi alteram partem · Iustitia omnibus · In dubio pro reo"
        </p>

        {/* CTA buttons */}
        <div
          className="fade-up fade-up-3"
          style={{
            display: 'flex', gap: 14, justifyContent: 'center',
            flexWrap: 'wrap', marginBottom: 64,
            opacity: visible ? 1 : 0,
          }}
        >
          <button
            className="btn btn-gold btn-xl"
            onClick={() => scrollTo('analise')}
          >
            <Zap size={16}/>
            Analisar Gratuitamente
            <ArrowRight size={16}/>
          </button>
          <button
            className="btn btn-outline-gold btn-xl"
            onClick={() => scrollTo('agentes')}
          >
            Ver os 16 Agentes
          </button>
        </div>

        {/* Stat pills */}
        <div
          className="fade-up fade-up-4"
          style={{
            display: 'flex', gap: 16, justifyContent: 'center',
            flexWrap: 'wrap', opacity: visible ? 1 : 0,
          }}
        >
          {STATS.map((s, i) => (
            <div key={i} className="stat-pill">
              <span style={{ color: s.color }}>{s.icon}</span>
              <div>
                <div style={{
                  fontFamily: 'var(--f-title)',
                  fontSize: '1.5rem', lineHeight: 1,
                  color: s.color,
                  textShadow: `0 0 20px ${s.color}60`,
                  letterSpacing: '.06em',
                }}>
                  {s.val}
                </div>
                <div style={{
                  fontSize: '.65rem', color: 'var(--p5)',
                  textTransform: 'uppercase', letterSpacing: '.1em',
                  fontFamily: 'var(--f-mono)', marginTop: 2,
                }}>
                  {s.label}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Scroll indicator */}
        <div
          className="fade-up fade-up-5"
          style={{
            marginTop: 64, display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: 8, opacity: visible ? 0.5 : 0,
          }}
        >
          <span style={{
            fontFamily: 'var(--f-mono)', fontSize: '.6rem',
            color: 'var(--p5)', letterSpacing: '.2em', textTransform: 'uppercase',
          }}>
            scroll
          </span>
          <div style={{
            width: 1, height: 40,
            background: 'linear-gradient(var(--au5), transparent)',
            animation: 'pulse 2s ease-in-out infinite',
          }}/>
        </div>
      </div>
    </section>
  );
}
