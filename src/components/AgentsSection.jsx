import { useRef, useEffect, useState } from 'react';
import { AGENT_AREAS } from '../lib/constants';

function useIntersect(options = {}) {
  const ref = useRef(null);
  const [entered, setEntered] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setEntered(true); obs.disconnect(); }
    }, { threshold: 0.1, ...options });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, entered];
}

export default function AgentsSection() {
  const [ref, entered] = useIntersect();

  return (
    <section id="agentes" style={{ padding: '100px 24px' }}>
      <div style={{ maxWidth: 980, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <div className="section-label" style={{ justifyContent: 'center', marginBottom: 20 }}>
            Conselho Especialista
          </div>
          <h2
            className="t-display"
            style={{
              fontSize: 'clamp(2rem,4vw,2.8rem)',
              fontWeight: 700, marginBottom: 14,
              color: 'var(--p0)',
            }}
          >
            Os{' '}
            <span style={{ color: 'var(--au6)', fontStyle: 'italic', textShadow: '0 0 32px rgba(228,168,36,0.25)' }}>
              16 Agentes
            </span>
            {' '}Especialistas
          </h2>
          <p style={{ color: 'var(--p4)', fontSize: '.92rem', maxWidth: 500, margin: '0 auto', lineHeight: 1.7 }}>
            Cada agente é um especialista dedicado a uma área do Direito brasileiro,
            analisando seu caso em paralelo com total independência.
          </p>
        </div>

        {/* Agents grid */}
        <div ref={ref} className="agents-grid" style={{ marginBottom: 48 }}>
          {AGENT_AREAS.map(({ id, area, icon }, i) => (
            <AgentTile
              key={id}
              icon={icon} area={area} id={id}
              delay={entered ? i * 40 : 0}
              visible={entered}
            />
          ))}
        </div>

        {/* Special agents */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 20,
        }}>
          <SpecialAgent
            icon="⚔️"
            title="Advogado do Diabo"
            sub="Contraditório Obrigatório"
            desc="Apresenta todos os argumentos contrários ao caso. Nenhuma decisão sem o contraditório completo — garantindo imparcialidade máxima."
            color="var(--cr4)"
            glow="rgba(192,30,30,0.20)"
            border="var(--b-crimson)"
          />
          <SpecialAgent
            icon="⚖️"
            title="Juiz IA Quantum"
            sub="Veredicto Final"
            desc="Pondera todos os 16 pareceres + contraditório e prolata o veredicto jurídico definitivo com JURIR Score dimensional."
            color="var(--au6)"
            glow="rgba(228,168,36,0.18)"
            border="var(--b-gold)"
          />
        </div>
      </div>
    </section>
  );
}

function AgentTile({ icon, area, id, delay, visible }) {
  return (
    <div
      style={{
        background: 'rgba(10,10,32,0.7)',
        border: '1px solid var(--b-neutral)',
        borderRadius: 'var(--r-md)',
        padding: '16px',
        display: 'flex', alignItems: 'center', gap: 12,
        backdropFilter: 'blur(8px)',
        transition: `border-color .25s, transform .3s, box-shadow .3s, opacity .5s ${delay}ms`,
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(16px)',
        cursor: 'default', position: 'relative', overflow: 'hidden',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'var(--b-gold)';
        e.currentTarget.style.transform = 'translateY(-3px)';
        e.currentTarget.style.boxShadow = '0 8px 32px rgba(228,168,36,0.08)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'var(--b-neutral)';
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Shimmer line */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 1,
        background: 'linear-gradient(90deg, transparent, rgba(228,168,36,0.20), transparent)',
        opacity: 0,
        transition: 'opacity .25s',
      }}/>
      <span style={{ fontSize: '1.05rem', flexShrink: 0, lineHeight: 1 }}>{icon}</span>
      <div>
        <div style={{
          fontSize: '.8rem', fontWeight: 600,
          color: 'var(--p2)', lineHeight: 1.3,
        }}>
          {area}
        </div>
        <div style={{
          fontSize: '.6rem', color: 'var(--p5)',
          fontFamily: 'var(--f-mono)', marginTop: 2,
          letterSpacing: '.06em',
        }}>
          {id}
        </div>
      </div>
    </div>
  );
}

function SpecialAgent({ icon, title, sub, desc, color, glow, border }) {
  return (
    <div style={{
      background: `linear-gradient(145deg, rgba(10,10,32,0.85), rgba(15,15,40,0.9))`,
      border: `1px solid ${border}`,
      borderRadius: 'var(--r-xl)', padding: '28px',
      position: 'relative', overflow: 'hidden',
      transition: 'transform .3s, box-shadow .3s',
      backdropFilter: 'blur(12px)',
    }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = `0 16px 56px ${glow}`;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Top shimmer */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 2,
        background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
        opacity: 0.6,
      }}/>

      {/* Background glow orb */}
      <div style={{
        position: 'absolute', top: -30, right: -30,
        width: 140, height: 140, borderRadius: '50%',
        background: `radial-gradient(circle, ${glow} 0%, transparent 70%)`,
        filter: 'blur(20px)',
        pointerEvents: 'none',
      }}/>

      <div style={{ fontSize: '2.2rem', marginBottom: 16, lineHeight: 1 }}>{icon}</div>

      <div style={{
        fontFamily: 'var(--f-display)',
        fontSize: '1.2rem', fontWeight: 700,
        marginBottom: 4, color: 'var(--p0)',
        textShadow: `0 0 24px ${glow}`,
      }}>
        {title}
      </div>

      <div style={{
        fontSize: '.68rem', color, fontFamily: 'var(--f-mono)',
        letterSpacing: '.12em', marginBottom: 14,
        textTransform: 'uppercase',
      }}>
        {sub}
      </div>

      <p style={{
        fontSize: '.855rem', color: 'var(--p4)',
        lineHeight: 1.65, margin: 0,
      }}>
        {desc}
      </p>
    </div>
  );
}
