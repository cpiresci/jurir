import { useEffect, useRef, useState } from 'react';
import { AGENT_AREAS } from '../lib/constants';
import { useStore } from '../store';

const FLOW = [
  { icon: '📋', label: 'Caso submetido', desc: 'Seu caso é processado e distribuído aos 16 agentes' },
  { icon: '⚡', label: '16 Análises em Paralelo', desc: 'Cada especialista analisa simultaneamente' },
  { icon: '⚔️', label: 'Advogado do Diabo', desc: 'O contraditório é apresentado com máxima rigorosidade' },
  { icon: '🏛️', label: 'Juiz IA Quantum', desc: 'Deliberação final com base em todo o material' },
  { icon: '📊', label: 'JURIR Score', desc: 'Pontuação dimensional multidimensional do seu caso' },
];

const STATUS_COLOR = {
  idle:    { border: 'var(--b-main)',               bg: 'var(--bg-card)',                  dot: 'var(--t5)' },
  running: { border: 'rgba(20,114,217,0.4)',         bg: 'rgba(20,114,217,0.035)',           dot: 'var(--co7)' },
  done:    { border: 'rgba(16,185,129,0.28)',        bg: 'rgba(16,185,129,0.025)',           dot: '#10b981' },
  error:   { border: 'rgba(239,68,68,0.25)',         bg: 'rgba(239,68,68,0.02)',             dot: '#ef4444' },
};

export default function AgentsSection() {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);

  /* Live agent states from store — shows real activity if analysis running */
  const agentStates = useStore(s => s.agentStates);
  const running     = useStore(s => s.running);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section id="agentes" ref={ref} style={{ padding: '100px 24px', background: 'var(--bg-card2)', borderTop: '1px solid var(--b-subtle)', borderBottom: '1px solid var(--b-subtle)' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 72 }}>
          <div className="section-label" style={{ marginBottom: 20 }}>O Conselho Jurídico</div>
          <h2 className="t-display" style={{ fontSize: 'clamp(1.9rem,3.5vw,2.8rem)', fontWeight: 400, color: 'var(--t0)', marginBottom: 16, letterSpacing: '-.02em' }}>
            Dezesseis especialistas.<br/>
            <span className="accent-cobalt" style={{ fontStyle: 'italic' }}>Um único veredicto.</span>
          </h2>
          <p style={{ color: 'var(--t3)', maxWidth: 540, margin: '0 auto', lineHeight: 1.7, fontSize: '.92rem' }}>
            Cada agente é treinado na sua área específica do direito brasileiro. Em paralelo, simultâneos, sem compromisso.
          </p>

          {/* Live indicator when analysis is running */}
          {running && (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              marginTop: 20, padding: '8px 16px',
              background: 'rgba(20,114,217,0.06)', border: '1px solid var(--b-cobalt)',
              borderRadius: 'var(--r-md)',
              fontFamily: 'var(--f-mono)', fontSize: '.68rem', color: 'var(--co7)',
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--co7)', animation: 'pulse 1.2s ease-in-out infinite' }}/>
              Análise em tempo real
            </div>
          )}
        </div>

        {/* Agents grid — cards reflect live state when running */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: 10, marginBottom: 72,
        }}>
          {AGENT_AREAS.map((a, i) => {
            const agSt  = agentStates[a.id];
            const status = agSt?.status || 'idle';
            const sc = STATUS_COLOR[status] || STATUS_COLOR.idle;

            return (
              <div key={a.id} style={{
                background: sc.bg,
                border: `1px solid ${sc.border}`,
                borderRadius: 'var(--r-md)',
                padding: '16px 18px',
                display: 'flex', alignItems: 'center', gap: 12,
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0)' : 'translateY(16px)',
                transition: `opacity .5s ${0.03 * i}s, transform .5s ${0.03 * i}s, border-color .35s, background .35s, box-shadow .35s`,
                boxShadow: status === 'running'
                  ? '0 0 14px rgba(20,114,217,0.12)'
                  : status === 'done'
                    ? '0 0 10px rgba(16,185,129,0.07)'
                    : 'var(--shadow-card)',
                position: 'relative', overflow: 'hidden',
              }}>
                {/* Running shimmer */}
                {status === 'running' && (
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(90deg, transparent 0%, rgba(20,114,217,0.06) 50%, transparent 100%)',
                    backgroundSize: '200% 100%',
                    animation: 'agent-shimmer 1.6s ease-in-out infinite',
                    borderRadius: 'inherit', pointerEvents: 'none',
                  }}/>
                )}

                {/* Left status dot */}
                <div style={{
                  position: 'absolute', left: 0, top: 0, bottom: 0, width: 2,
                  background: sc.dot,
                  boxShadow: status !== 'idle' ? `0 0 6px ${sc.dot}88` : 'none',
                  transition: 'background .3s, box-shadow .3s',
                }}/>

                <span style={{ fontSize: '1.1rem', flexShrink: 0, position: 'relative' }}>{a.icon}</span>
                <div style={{ position: 'relative' }}>
                  <div style={{ fontSize: '.77rem', fontWeight: 600, color: status === 'done' ? 'var(--t0)' : 'var(--t1)', lineHeight: 1.3, transition: 'color .3s' }}>
                    {a.area}
                  </div>
                  <div style={{ fontSize: '.62rem', fontFamily: 'var(--f-mono)', color: status === 'running' ? 'var(--co7)' : 'var(--t5)', letterSpacing: '.08em', marginTop: 2, transition: 'color .3s' }}>
                    {status === 'running' ? '● analisando…' : status === 'done' ? '✓ concluído' : `ESPECIALISTA #${String(i + 1).padStart(2, '0')}`}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Process flow */}
        <div>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div className="section-label" style={{ marginBottom: 12 }}>Processo de Análise</div>
            <h3 className="t-display" style={{ fontSize: '1.5rem', fontWeight: 400, color: 'var(--t0)' }}>
              Como funciona
            </h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 0, overflowX: 'auto', paddingBottom: 8 }}>
            {FLOW.map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', minWidth: 0, flex: 1 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, minWidth: 120, padding: '0 8px' }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: '50%',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--b-cobalt)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.3rem', marginBottom: 12,
                    boxShadow: '0 0 0 4px rgba(20,114,217,0.04)',
                    flexShrink: 0,
                  }}>
                    {f.icon}
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '.78rem', fontWeight: 600, color: 'var(--t0)', marginBottom: 4 }}>{f.label}</div>
                    <div style={{ fontSize: '.7rem', color: 'var(--t4)', lineHeight: 1.5 }}>{f.desc}</div>
                  </div>
                </div>
                {i < FLOW.length - 1 && (
                  <div style={{ paddingTop: 24, flexShrink: 0 }}>
                    <div style={{ width: 24, height: 1, background: 'linear-gradient(90deg, var(--b-cobalt), transparent)' }}/>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
