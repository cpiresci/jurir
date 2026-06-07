import { useEffect, useRef, useState } from 'react';
import { AGENT_AREAS } from '../lib/constants';
import { useStore } from '../store';

const FLOW = [
  { icon: '📋', step: '01', label: 'Caso Submetido',          desc: 'Seu caso é processado, classificado por área e distribuído simultaneamente aos 16 agentes do Conselho.' },
  { icon: '⚡', step: '02', label: '16 Análises em Paralelo', desc: 'Cada especialista analisa de forma independente: jurisprudência, legislação e probabilidade de êxito.' },
  { icon: '⚔️', step: '03', label: 'Advogado do Diabo',       desc: 'O contraditório é apresentado com máxima rigorosidade — fraquezas, riscos e argumentos adversos.' },
  { icon: '🏛️', step: '04', label: 'Juiz IA Quantum',         desc: 'Deliberação final com base em todo o material. Prolata o veredicto e determina o JURIR Score.' },
  { icon: '📊', step: '05', label: 'JURIR Score Dimensional', desc: 'Pontuação multidimensional do seu caso: mérito jurídico, risco processual, probabilidade de êxito.' },
];

const STATUS_COLOR = {
  idle:    { border: 'var(--b-main)',               bg: 'var(--bg-card)',              dot: 'var(--t5)',  label: '' },
  running: { border: 'rgba(20,114,217,0.35)',        bg: 'rgba(20,114,217,0.03)',       dot: 'var(--co7)', label: 'analisando…' },
  done:    { border: 'rgba(16,185,129,0.25)',        bg: 'rgba(16,185,129,0.022)',      dot: 'var(--jade2)', label: 'concluído' },
  error:   { border: 'rgba(239,68,68,0.22)',         bg: 'rgba(239,68,68,0.02)',        dot: '#ef4444',  label: 'erro' },
};

export default function AgentsSection() {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);

  const agentStates = useStore(s => s.agentStates);
  const running     = useStore(s => s.running);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.12 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section id="agentes" ref={ref} style={{
      padding:'110px 28px',
      background:'var(--bg-card2)',
      borderTop:'1px solid var(--b-subtle)',
      borderBottom:'1px solid var(--b-subtle)',
      position:'relative', overflow:'hidden',
    }}>
      {/* Background quantum mesh */}
      <div style={{
        position:'absolute', inset:0, pointerEvents:'none', opacity:0.5,
        backgroundImage:'radial-gradient(rgba(20,114,217,0.04) 1px, transparent 1px)',
        backgroundSize:'32px 32px',
      }}/>

      <div style={{ maxWidth:1120, margin:'0 auto', position:'relative' }}>

        {/* ── HEADER ── */}
        <div style={{ textAlign:'center', marginBottom:80 }}>
          <div className="section-label" style={{ marginBottom:22 }}>O Conselho Jurídico Quântico</div>
          <h2 className="t-display" style={{
            fontSize:'clamp(2rem, 3.8vw, 3.2rem)', fontWeight:300,
            color:'var(--t0)', marginBottom:18, letterSpacing:'-.025em', lineHeight:1.1,
          }}>
            Dezesseis especialistas.<br/>
            <span style={{
              background:'linear-gradient(135deg, var(--co8) 0%, var(--co7) 50%, var(--am4) 100%)',
              WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text',
              fontStyle:'italic',
            }}>
              Um único veredicto.
            </span>
          </h2>
          <p style={{ color:'var(--t3)', maxWidth:560, margin:'0 auto', lineHeight:1.75, fontSize:'.93rem', fontFamily:'var(--f-display)', fontWeight:400 }}>
            Cada agente é treinado exclusivamente na sua área do direito brasileiro.
            Em paralelo, simultâneos, sem compromisso — cada um analisa o seu caso do ângulo que domina.
          </p>

          {/* Live indicator */}
          {running && (
            <div style={{
              display:'inline-flex', alignItems:'center', gap:9,
              marginTop:22, padding:'9px 18px',
              background:'rgba(20,114,217,0.06)', border:'1px solid var(--b-cobalt)',
              borderRadius:'var(--r-md)',
              fontFamily:'var(--f-mono)', fontSize:'.67rem', color:'var(--co7)', letterSpacing:'.10em',
              boxShadow:'0 0 24px rgba(20,114,217,0.10)',
            }}>
              <span style={{ width:6, height:6, borderRadius:'50%', background:'var(--co7)', animation:'pulse 1.2s ease-in-out infinite', boxShadow:'0 0 8px rgba(20,114,217,0.6)' }}/>
              ANÁLISE EM TEMPO REAL — CONSELHO ATIVO
            </div>
          )}
        </div>

        {/* ── AGENTS GRID ── */}
        <div style={{
          display:'grid',
          gridTemplateColumns:'repeat(auto-fill, minmax(195px, 1fr))',
          gap:10, marginBottom:80,
        }}>
          {AGENT_AREAS.map((a, i) => {
            const agSt  = agentStates[a.id];
            const status = agSt?.status || 'idle';
            const sc = STATUS_COLOR[status] || STATUS_COLOR.idle;

            return (
              <div key={a.id} style={{
                background: sc.bg,
                border: `1px solid ${sc.border}`,
                borderRadius:'var(--r-md)',
                padding:'16px 18px',
                display:'flex', alignItems:'center', gap:13,
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0)' : 'translateY(18px)',
                transition: `opacity .5s ${0.025 * i}s, transform .5s ${0.025 * i}s, border-color .35s, background .35s, box-shadow .35s`,
                boxShadow: status === 'running'
                  ? '0 0 18px rgba(20,114,217,0.14)'
                  : status === 'done'
                    ? '0 0 12px rgba(16,185,129,0.09)'
                    : 'var(--shadow-card)',
                position:'relative', overflow:'hidden',
                cursor:'default',
              }}>
                {/* Running shimmer */}
                {status === 'running' && (
                  <div style={{
                    position:'absolute', inset:0,
                    background:'linear-gradient(90deg, transparent 0%, rgba(20,114,217,0.06) 50%, transparent 100%)',
                    backgroundSize:'200% 100%',
                    animation:'agent-shimmer 1.8s ease-in-out infinite',
                    borderRadius:'inherit', pointerEvents:'none',
                  }}/>
                )}

                {/* Left status bar */}
                <div style={{
                  position:'absolute', left:0, top:0, bottom:0, width:2,
                  background: sc.dot,
                  boxShadow: status !== 'idle' ? `0 0 8px ${sc.dot}99` : 'none',
                  transition:'background .3s, box-shadow .3s',
                  borderRadius:'0 2px 2px 0',
                }}/>

                <span style={{ fontSize:'1.05rem', flexShrink:0, position:'relative' }}>{a.icon}</span>
                <div style={{ position:'relative', overflow:'hidden' }}>
                  <div style={{
                    fontSize:'.76rem', fontWeight:600,
                    color: status === 'done' ? 'var(--t0)' : 'var(--t1)',
                    lineHeight:1.3, transition:'color .3s',
                  }}>
                    {a.area}
                  </div>
                  <div style={{
                    fontSize:'.58rem', fontFamily:'var(--f-mono)',
                    color: status === 'running' ? 'var(--co7)' :
                           status === 'done'    ? 'var(--jade2)' : 'var(--t5)',
                    letterSpacing:'.09em', marginTop:3, transition:'color .3s',
                  }}>
                    {status === 'running' ? '● ANALISANDO…' :
                     status === 'done'    ? `✓ CONCLUÍDO` :
                                           `ESPECIALISTA #${String(i + 1).padStart(2, '0')}`}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── PROCESS FLOW ULTRA ── */}
        <div>
          <div style={{ textAlign:'center', marginBottom:48 }}>
            <div className="section-label" style={{ marginBottom:14 }}>Processo de Análise Quântica</div>
            <h3 className="t-display" style={{
              fontSize:'clamp(1.5rem, 2.5vw, 2.0rem)', fontWeight:300, color:'var(--t0)',
              letterSpacing:'-.02em',
            }}>
              Como o tribunal funciona
            </h3>
          </div>

          <div style={{ display:'flex', alignItems:'flex-start', gap:0, overflowX:'auto', paddingBottom:8 }}>
            {FLOW.map((f, i) => (
              <div key={i} style={{ display:'flex', alignItems:'flex-start', minWidth:0, flex:1 }}>
                <div style={{ display:'flex', flexDirection:'column', alignItems:'center', flex:1, minWidth:140, padding:'0 10px' }}>
                  {/* Step indicator */}
                  <div style={{
                    width:52, height:52, borderRadius:'50%',
                    background:'var(--bg-card)',
                    border:'1px solid var(--b-cobalt)',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontSize:'1.2rem', marginBottom:8,
                    boxShadow:'0 0 0 6px rgba(20,114,217,0.04)',
                    flexShrink:0, position:'relative',
                  }}>
                    {f.icon}
                    {/* Step number */}
                    <div style={{
                      position:'absolute', top:-4, right:-4,
                      width:16, height:16, borderRadius:'50%',
                      background:'var(--co7)', color:'#fff',
                      fontFamily:'var(--f-mono)', fontSize:'.48rem',
                      display:'flex', alignItems:'center', justifyContent:'center',
                      letterSpacing:'.04em', fontWeight:600,
                    }}>
                      {f.step}
                    </div>
                  </div>

                  <div style={{ textAlign:'center' }}>
                    <div style={{
                      fontSize:'.79rem', fontWeight:600, color:'var(--t0)',
                      marginBottom:6, fontFamily:'var(--f-sans)', letterSpacing:'.01em',
                    }}>
                      {f.label}
                    </div>
                    <div style={{
                      fontSize:'.7rem', color:'var(--t4)', lineHeight:1.55,
                      fontFamily:'var(--f-display)', fontWeight:400, letterSpacing:'.01em',
                    }}>
                      {f.desc}
                    </div>
                  </div>
                </div>

                {/* Connector */}
                {i < FLOW.length - 1 && (
                  <div style={{ paddingTop:26, flexShrink:0, display:'flex', alignItems:'center', gap:2 }}>
                    <div style={{ width:12, height:1, background:'var(--co7)', opacity:0.25 }}/>
                    <div style={{ width:4, height:4, borderRadius:'50%', background:'var(--co7)', opacity:0.4 }}/>
                    <div style={{ width:12, height:1, background:'var(--co7)', opacity:0.25 }}/>
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
