import { ArrowRight, Zap, Shield, Scale } from 'lucide-react';
import { useStore } from '../store';

const STATS = [
  { icon: <Zap size={14}/>,    val: '16',    label: 'Agentes Especialistas' },
  { icon: <Shield size={14}/>, val: '<3min', label: 'Análise Completa' },
  { icon: <Scale size={14}/>,  val: '100%',  label: 'Contraditório' },
];

export default function Hero() {
  const { openModal } = useStore();

  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  return (
    <section style={{ minHeight: '92vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 24px', paddingTop: 68 }}>
      <div style={{ maxWidth: 820, textAlign: 'center' }}>

        {/* Badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'var(--lift)', border: '1px solid var(--br)',
          borderRadius: 'var(--r-pill)', padding: '6px 16px',
          fontSize: '.72rem', color: 'var(--r3)', fontFamily: 'var(--f-mono)',
          letterSpacing: '.12em', marginBottom: 32, textTransform: 'uppercase',
        }}>
          <Zap size={11}/> Inteligência Jurídica Quântica · v10.0
        </div>

        {/* Title */}
        <h1 className="t-display" style={{
          fontSize: 'clamp(2.8rem,7vw,5.2rem)',
          fontWeight: 700, lineHeight: 1.08, letterSpacing: '-.01em',
          marginBottom: 24, color: 'var(--n0)',
        }}>
          O parecer que um{' '}
          <em style={{ color: 'var(--r3)', fontStyle: 'normal' }}>escritório inteiro</em>{' '}
          não consegue dar em um dia,{' '}
          <em style={{ color: 'var(--g4)', fontStyle: 'normal' }}>em minutos.</em>
        </h1>

        {/* Desc */}
        <p style={{ fontSize: '1.05rem', color: 'var(--n4)', maxWidth: 580, margin: '0 auto 40px', lineHeight: 1.7 }}>
          16 agentes de IA especializados analisam seu caso em paralelo. Advogado do Diabo apresenta o contraditório. Juiz IA Quantum prolata o veredicto.
        </p>

        {/* CTAs */}
        <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 56 }}>
          <button className="btn btn-crimson btn-xl" onClick={() => scrollTo('analise')}>
            Analisar Gratuitamente <ArrowRight size={16}/>
          </button>
          <button className="btn btn-outline-gold btn-xl" onClick={() => scrollTo('agentes')}>
            Ver os 16 Agentes
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: 24, justifyContent: 'center', flexWrap: 'wrap' }}>
          {STATS.map((s, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              background: 'var(--lift)', border: '1px solid var(--bn)',
              borderRadius: 'var(--r-md)', padding: '12px 20px',
            }}>
              <span style={{ color: 'var(--r3)' }}>{s.icon}</span>
              <div>
                <div style={{ fontFamily: 'var(--f-mono)', fontSize: '.9rem', fontWeight: 700, color: 'var(--n0)' }}>{s.val}</div>
                <div style={{ fontSize: '.68rem', color: 'var(--n5)', textTransform: 'uppercase', letterSpacing: '.08em' }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
