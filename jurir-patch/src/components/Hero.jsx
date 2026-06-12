import { ArrowRight, Zap, Shield, Scale, Brain } from 'lucide-react';
import { useStore } from '../store';

const STATS = [
  { icon: <Brain  size={13}/>, val: '16',    label: 'Agentes IA',       sub: 'em paralelo' },
  { icon: <Zap    size={13}/>, val: '<3min', label: 'Análise Premium',  sub: 'streaming SSE' },
  { icon: <Shield size={13}/>, val: '100%',  label: 'Contraditório',    sub: 'obrigatório' },
  { icon: <Scale  size={13}/>, val: 'JURIR', label: 'Score 0–100',      sub: '4 dimensões' },
];

const BADGES = [
  '⚖️ Direito Civil',
  '🔒 Penal',
  '👷 Trabalhista',
  '👨‍👩‍👧 Família',
  '💰 Tributário',
  '🏢 Empresarial',
];

export default function Hero() {
  const { openModal } = useStore();
  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  return (
    <section style={{ minHeight: '92vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 24px', paddingTop: 68 }}>
      <div style={{ maxWidth: 860, textAlign: 'center' }}>

        {/* Badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'var(--lift)', border: '1px solid var(--br)',
          borderRadius: 'var(--r-pill)', padding: '6px 18px',
          fontSize: '.7rem', color: 'var(--r3)', fontFamily: 'var(--f-mono)',
          letterSpacing: '.12em', marginBottom: 32, textTransform: 'uppercase',
        }}>
          <Zap size={10}/> Quantum Jurist v3.0 · 16 Agentes · Contraditório Obrigatório
        </div>

        {/* Title */}
        <h1 className="t-display" style={{
          fontSize: 'clamp(2.6rem,6.5vw,5rem)',
          fontWeight: 700, lineHeight: 1.07, letterSpacing: '-.01em',
          marginBottom: 24, color: 'var(--n0)',
        }}>
          O parecer que um{' '}
          <em style={{ color: 'var(--r3)', fontStyle: 'normal' }}>escritório inteiro</em>
          {' '}não consegue dar em um dia,{' '}
          <em style={{ color: 'var(--g4)', fontStyle: 'normal' }}>em minutos.</em>
        </h1>

        {/* Desc */}
        <p style={{ fontSize: '1.02rem', color: 'var(--n4)', maxWidth: 580, margin: '0 auto 40px', lineHeight: 1.75 }}>
          16 especialistas em IA analisam seu caso simultaneamente. O Advogado do Diabo apresenta o contraditório. O Juiz IA Quantum prolata o veredicto com JURIR Score dimensional.
        </p>

        {/* Area badges */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center', marginBottom: 36 }}>
          {BADGES.map((b, i) => (
            <span key={i} style={{
              background: 'var(--lift)', border: '1px solid var(--bn)',
              borderRadius: 'var(--r-pill)', padding: '4px 12px',
              fontSize: '.72rem', color: 'var(--n4)',
            }}>
              {b}
            </span>
          ))}
          <span style={{
            background: 'var(--lift)', border: '1px solid var(--bn)',
            borderRadius: 'var(--r-pill)', padding: '4px 12px',
            fontSize: '.72rem', color: 'var(--n5)',
          }}>
            +10 áreas…
          </span>
        </div>

        {/* CTAs */}
        <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 52 }}>
          <button className="btn btn-crimson btn-xl" onClick={() => scrollTo('analise')}>
            Analisar Gratuitamente <ArrowRight size={15}/>
          </button>
          <button className="btn btn-outline-gold btn-xl" onClick={() => scrollTo('agentes')}>
            Ver os 16 Agentes
          </button>
        </div>

        {/* Stats row */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          {STATS.map((s, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              background: 'var(--lift)', border: '1px solid var(--bn)',
              borderRadius: 'var(--r-md)', padding: '12px 18px',
              minWidth: 130,
            }}>
              <span style={{ color: 'var(--r3)' }}>{s.icon}</span>
              <div>
                <div style={{ fontFamily: 'var(--f-mono)', fontSize: '.88rem', fontWeight: 700, color: 'var(--n0)' }}>
                  {s.val}
                </div>
                <div style={{ fontSize: '.66rem', color: 'var(--n4)', textTransform: 'uppercase', letterSpacing: '.08em' }}>
                  {s.label}
                </div>
                <div style={{ fontSize: '.62rem', color: 'var(--n6)', letterSpacing: '.04em' }}>
                  {s.sub}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
